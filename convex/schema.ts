import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /** A linked source account or pasted URL batch. */
  connections: defineTable({
    userId: v.string(),
    kind: v.union(v.literal("url_list"), v.literal("youtube_channel"), v.literal("seed_persona")),
    label: v.string(),
  }).index("by_user", ["userId"]),

  /** One video/post/episode with provenance. */
  sources: defineTable({
    userId: v.string(),
    connectionId: v.id("connections"),
    platform: v.string(),
    title: v.string(),
    url: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("fetching"),
      v.literal("transcribing"),
      v.literal("segmenting"),
      v.literal("ready"),
      v.literal("error"),
    ),
    wordCount: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  /** A verified-stored chunk of transcript text tied to a Source. */
  passages: defineTable({
    userId: v.string(),
    sourceId: v.id("sources"),
    index: v.number(),
    text: v.string(),
    wordCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_source", ["sourceId"]),

  /** The generated artifact: verified traits, citations, markdown export. */
  profiles: defineTable({
    userId: v.string(),
    userEmail: v.optional(v.string()),
    creatorName: v.string(),
    status: v.union(v.literal("generating"), v.literal("complete"), v.literal("failed")),
    confidence: v.optional(v.union(v.literal("grounded"), v.literal("low_confidence"))),
    summary: v.optional(v.string()),
    markdown: v.optional(v.string()),
    stats: v.optional(v.any()),
    traits: v.optional(v.any()),
    error: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  /** Persisted synthesis-loop events so the UI can render the run live. */
  synthesisEvents: defineTable({
    userId: v.string(),
    profileId: v.id("profiles"),
    seq: v.number(),
    event: v.any(),
  }).index("by_profile", ["profileId", "seq"]),

  /** In-app notifications — the keyless fallback for Resend email. */
  notifications: defineTable({
    userId: v.string(),
    message: v.string(),
    profileId: v.optional(v.id("profiles")),
    readAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});
