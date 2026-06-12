import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOwner, requireUserId } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    // Markdown can be large; the list view doesn't need it.
    return profiles.map(({ markdown, ...rest }) => ({
      ...rest,
      hasMarkdown: Boolean(markdown),
    }));
  },
});

export const get = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ctx.db.get(args.profileId);
    assertOwner(profile, userId);
    return profile;
  },
});

/** The persisted synthesis-loop events, ordered, for the live view. */
export const events = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ctx.db.get(args.profileId);
    assertOwner(profile, userId);
    return await ctx.db
      .query("synthesisEvents")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .collect();
  },
});

// ---- Internal plumbing for the synthesis action --------------------------

export const getInternal = internalQuery({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => ctx.db.get(args.profileId),
});

export const appendEvent = internalMutation({
  args: {
    profileId: v.id("profiles"),
    userId: v.string(),
    seq: v.number(),
    event: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("synthesisEvents", args);
  },
});

export const finalize = internalMutation({
  args: {
    profileId: v.id("profiles"),
    status: v.union(v.literal("complete"), v.literal("failed")),
    confidence: v.optional(v.union(v.literal("grounded"), v.literal("low_confidence"))),
    summary: v.optional(v.string()),
    markdown: v.optional(v.string()),
    stats: v.optional(v.any()),
    traits: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profileId, ...patch } = args;
    await ctx.db.patch(profileId, patch);
  },
});
