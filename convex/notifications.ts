import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOwner, requireUserId } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(args.notificationId);
    assertOwner(doc, userId);
    await ctx.db.patch(args.notificationId, { readAt: Date.now() });
  },
});

export const add = internalMutation({
  args: {
    userId: v.string(),
    message: v.string(),
    profileId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", args);
  },
});
