import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireIdentity } from "./lib/auth";

/**
 * Kick off a synthesis run for the caller's own corpus. Creates the profile
 * document in "generating" state and schedules the server-side loop; the UI
 * follows along through the reactive `profiles.events` query.
 */
export const start = mutation({
  args: { creatorName: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const creatorName = args.creatorName.trim().slice(0, 80) || "Untitled creator";
    const profileId = await ctx.db.insert("profiles", {
      userId: identity.subject,
      userEmail: identity.email ?? undefined,
      creatorName,
      status: "generating",
    });
    await ctx.scheduler.runAfter(0, internal.synthesisAction.run, { profileId });
    return profileId;
  },
});
