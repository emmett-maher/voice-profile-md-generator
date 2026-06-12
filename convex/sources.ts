import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOwner, requireUserId } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("sources")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const source = await ctx.db.get(args.sourceId);
    assertOwner(source, userId);
    return source;
  },
});

// ---- Internal plumbing for the ingestion action -------------------------

export const getInternal = internalQuery({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, args) => ctx.db.get(args.sourceId),
});

export const setStatus = internalMutation({
  args: {
    sourceId: v.id("sources"),
    status: v.union(
      v.literal("pending"),
      v.literal("fetching"),
      v.literal("transcribing"),
      v.literal("segmenting"),
      v.literal("ready"),
      v.literal("error"),
    ),
    error: v.optional(v.string()),
    wordCount: v.optional(v.number()),
    title: v.optional(v.string()),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sourceId, ...patch } = args;
    await ctx.db.patch(sourceId, patch);
  },
});

export const insertPassages = internalMutation({
  args: {
    sourceId: v.id("sources"),
    userId: v.string(),
    passages: v.array(v.object({ text: v.string(), wordCount: v.number() })),
  },
  handler: async (ctx, args) => {
    // Replace any prior passages for this source (re-ingestion).
    const existing = await ctx.db
      .query("passages")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .collect();
    for (const doc of existing) await ctx.db.delete(doc._id);

    let index = 0;
    for (const passage of args.passages) {
      await ctx.db.insert("passages", {
        userId: args.userId,
        sourceId: args.sourceId,
        index: index++,
        text: passage.text,
        wordCount: passage.wordCount,
      });
    }
  },
});

/** All ready passages + sources for a user — used by the synthesis action. */
export const readyCorpus = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const ready = sources.filter((s) => s.status === "ready");
    const passages = [];
    for (const source of ready) {
      const docs = await ctx.db
        .query("passages")
        .withIndex("by_source", (q) => q.eq("sourceId", source._id))
        .collect();
      passages.push(...docs);
    }
    return { sources: ready, passages };
  },
});

/** Sources stuck in a transient state — retried by the cron job. */
export const stuck = internalQuery({
  args: { olderThanMs: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const pending = await ctx.db
      .query("sources")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const fetching = await ctx.db
      .query("sources")
      .withIndex("by_status", (q) => q.eq("status", "fetching"))
      .collect();
    return [...pending, ...fetching].filter((s) => s._creationTime < cutoff);
  },
});
