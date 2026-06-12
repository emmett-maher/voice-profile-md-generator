import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireUserId } from "./lib/auth";
import { DEMO_PERSONAS } from "../src/lib/demo";
import { countWords } from "../src/lib/voice/verify";

function guessPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com") || u.includes("tiktok.com") || u.includes("x.com") || u.includes("twitter.com"))
    return "social";
  if (u.includes("podcast") || u.endsWith(".mp3") || u.endsWith(".m4a") || u.endsWith(".wav")) return "podcast";
  return "blog";
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Paste a batch of URLs; each becomes a Source and is scheduled for ingestion. */
export const addUrls = mutation({
  args: { urls: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const urls = args.urls
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u))
      .slice(0, 25);
    if (urls.length === 0) throw new Error("No valid http(s) URLs provided");

    const connectionId = await ctx.db.insert("connections", {
      userId,
      kind: "url_list",
      label: `${urls.length} pasted URL${urls.length === 1 ? "" : "s"}`,
    });

    for (const url of urls) {
      const sourceId = await ctx.db.insert("sources", {
        userId,
        connectionId,
        platform: guessPlatform(url),
        title: url,
        url,
        status: "pending",
      });
      // Scheduled ingestion job: fetch transcript → Deepgram fallback →
      // Haiku segmentation → persist passages with provenance.
      await ctx.scheduler.runAfter(0, internal.ingest.processSource, { sourceId });
    }
    return connectionId;
  },
});

/**
 * Seed a fictional creator's transcripts into the caller's own account so
 * the full ingest→synthesize→export flow can run on known data with keys.
 */
export const seedPersona = mutation({
  args: { personaId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const persona = DEMO_PERSONAS.find((p) => p.id === args.personaId);
    if (!persona) throw new Error("Unknown persona");

    const connectionId = await ctx.db.insert("connections", {
      userId,
      kind: "seed_persona",
      label: `Seed: ${persona.name}`,
    });

    for (const source of persona.sources) {
      const passages = persona.passages.filter((p) => p.sourceId === source.id);
      const wordCount = passages.reduce((n, p) => n + countWords(p.text), 0);
      const sourceId = await ctx.db.insert("sources", {
        userId,
        connectionId,
        platform: source.platform,
        title: source.title,
        url: source.url,
        status: "ready",
        wordCount,
      });
      let index = 0;
      for (const passage of passages) {
        await ctx.db.insert("passages", {
          userId,
          sourceId,
          index: index++,
          text: passage.text,
          wordCount: countWords(passage.text),
        });
      }
    }
    return connectionId;
  },
});
