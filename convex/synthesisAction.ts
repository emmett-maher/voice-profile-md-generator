"use node";

/**
 * The server-side synthesis loop. Drives the shared pipeline with the
 * Anthropic adapters; every event is persisted so the UI renders the run
 * live via reactive queries. On completion the user is notified by Resend
 * email when configured, with an in-app notification as the fallback.
 */

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { runSynthesisPipeline, SynthesisError } from "../src/lib/voice/pipeline";
import type { SynthesisEvent } from "../src/lib/voice/types";
import { createAnthropicSynthesisModel, DRAFT_MODEL, REPAIR_MODEL } from "./lib/models";

async function notifyCompletion(input: {
  email?: string;
  creatorName: string;
  ok: boolean;
  detail: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !input.email) return false;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Voice Profile Generator <onboarding@resend.dev>",
      to: input.email,
      subject: input.ok
        ? `Your voice profile for ${input.creatorName} is ready`
        : `Voice profile run for ${input.creatorName} failed`,
      text: input.detail,
    });
    return true;
  } catch {
    return false;
  }
}

export const run = internalAction({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.runQuery(internal.profiles.getInternal, {
      profileId: args.profileId,
    });
    if (!profile || profile.status !== "generating") return;

    let seq = 0;
    const emit = async (event: SynthesisEvent) => {
      await ctx.runMutation(internal.profiles.appendEvent, {
        profileId: args.profileId,
        userId: profile.userId,
        seq: seq++,
        event,
      });
    };

    const corpus = await ctx.runQuery(internal.sources.readyCorpus, {
      userId: profile.userId,
    });

    try {
      const result = await runSynthesisPipeline({
        creatorName: profile.creatorName,
        passages: corpus.passages.map((p) => ({
          id: p._id,
          sourceId: p.sourceId,
          text: p.text,
        })),
        sources: corpus.sources.map((s) => ({
          id: s._id,
          platform: s.platform,
          title: s.title,
          url: s.url,
        })),
        model: createAnthropicSynthesisModel(),
        emit,
        modelNames: { draft: DRAFT_MODEL, repair: REPAIR_MODEL },
      });

      await ctx.runMutation(internal.profiles.finalize, {
        profileId: args.profileId,
        status: "complete",
        confidence: result.confidence,
        summary: result.summary,
        markdown: result.markdown,
        stats: result.stats,
        traits: result.traits,
      });

      const detail =
        `Your voice profile for ${profile.creatorName} is ready: ` +
        `${result.stats.traitsVerified} verified traits from ${result.stats.sourcesUsed} sources ` +
        `(${result.stats.wordsIngested.toLocaleString("en-US")} words ingested). ` +
        (result.confidence === "low_confidence"
          ? "Note: the profile is labelled LOW CONFIDENCE — ingest more content for a reliable portrait."
          : "Every trait passed verbatim citation verification.");
      const emailed = await notifyCompletion({
        email: profile.userEmail,
        creatorName: profile.creatorName,
        ok: true,
        detail,
      });
      if (!emailed) {
        await ctx.runMutation(internal.notifications.add, {
          userId: profile.userId,
          profileId: args.profileId,
          message: detail,
        });
      }
    } catch (err) {
      const reason =
        err instanceof SynthesisError
          ? err.message
          : err instanceof Error
            ? `Unexpected failure: ${err.message}`
            : "Unexpected failure";
      await ctx.runMutation(internal.profiles.finalize, {
        profileId: args.profileId,
        status: "failed",
        error: reason,
      });
      const emailed = await notifyCompletion({
        email: profile.userEmail,
        creatorName: profile.creatorName,
        ok: false,
        detail: `The synthesis run failed: ${reason}`,
      });
      if (!emailed) {
        await ctx.runMutation(internal.notifications.add, {
          userId: profile.userId,
          profileId: args.profileId,
          message: `Synthesis run for ${profile.creatorName} failed: ${reason}`,
        });
      }
    }
  },
});
