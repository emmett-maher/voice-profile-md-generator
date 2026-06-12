"use node";

/**
 * Ingestion pipeline (scheduled Convex jobs): fetch transcripts where
 * available, fall back to Deepgram for audio without captions, segment into
 * Passages via Haiku (validated by code), persist with provenance.
 */

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  extractYouTubeId,
  fetchArticleText,
  fetchYouTubeCaptions,
  isYouTubeUrl,
  looksLikeAudioUrl,
  transcribeWithDeepgram,
} from "./lib/transcripts";
import { classifySourceWithHaiku, segmentWithHaiku } from "./lib/models";
import { SegmentationSchema, SourceClassificationSchema } from "../src/lib/voice/schema";
import { segmentDeterministically } from "../src/lib/voice/segment";
import { countWords, quoteAppearsIn } from "../src/lib/voice/verify";

const MAX_TRANSCRIPT_WORDS_PER_HAIKU_CALL = 5000;

/**
 * Segment a transcript into passages. Haiku proposes segments; code verifies
 * each segment appears verbatim in the transcript and falls back to
 * deterministic sentence-packing when the proposal fails validation.
 */
async function segmentTranscript(transcript: string): Promise<string[]> {
  // Pre-chunk very long transcripts so each Haiku call stays small.
  const words = transcript.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += MAX_TRANSCRIPT_WORDS_PER_HAIKU_CALL) {
    chunks.push(words.slice(i, i + MAX_TRANSCRIPT_WORDS_PER_HAIKU_CALL).join(" "));
  }

  const segments: string[] = [];
  for (const chunk of chunks) {
    let chunkSegments: string[] | null = null;
    try {
      const raw = await segmentWithHaiku(chunk);
      const parsed = SegmentationSchema.safeParse(raw);
      if (parsed.success) {
        const proposed = parsed.data.segments.map((s) => s.text);
        // Code owns the contract: every proposed segment must be a verbatim
        // slice of the transcript, or the whole proposal is discarded.
        if (proposed.every((text) => quoteAppearsIn(text, chunk))) {
          chunkSegments = proposed;
        }
      }
    } catch {
      // model unavailable or refused — fall through to deterministic split
    }
    segments.push(...(chunkSegments ?? segmentDeterministically(chunk)));
  }
  return segments;
}

export const processSource = internalAction({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, args) => {
    const source = await ctx.runQuery(internal.sources.getInternal, { sourceId: args.sourceId });
    if (!source || !source.url) return;

    const fail = async (message: string) => {
      await ctx.runMutation(internal.sources.setStatus, {
        sourceId: args.sourceId,
        status: "error",
        error: message,
      });
    };

    try {
      await ctx.runMutation(internal.sources.setStatus, {
        sourceId: args.sourceId,
        status: "fetching",
      });

      // ---- 1. Acquire a transcript -------------------------------------
      let transcript: string | null = null;
      let title: string | undefined;
      let platform = source.platform;

      if (isYouTubeUrl(source.url)) {
        platform = "youtube";
        const videoId = extractYouTubeId(source.url);
        if (videoId) {
          const captions = await fetchYouTubeCaptions(videoId);
          if (captions) {
            transcript = captions.text;
            title = captions.title;
          }
        }
      } else if (!looksLikeAudioUrl(source.url)) {
        const article = await fetchArticleText(source.url);
        if (article) {
          transcript = article.text;
          title = article.title;
        }
      }

      // Deepgram fallback for audio without captions/transcripts.
      if (!transcript && (looksLikeAudioUrl(source.url) || isYouTubeUrl(source.url))) {
        await ctx.runMutation(internal.sources.setStatus, {
          sourceId: args.sourceId,
          status: "transcribing",
        });
        transcript = await transcribeWithDeepgram(source.url);
      }

      if (!transcript || countWords(transcript) < 20) {
        await fail(
          "No transcript available: no published captions/text found, and speech-to-text " +
            "did not produce usable output (is DEEPGRAM_API_KEY set and the URL audio-accessible?).",
        );
        return;
      }

      // ---- 2. Classify the source (Haiku) when the title is still raw ---
      if (!title || title === source.url) {
        try {
          const raw = await classifySourceWithHaiku({ url: source.url, excerpt: transcript });
          const parsed = SourceClassificationSchema.safeParse(raw);
          if (parsed.success) {
            title = parsed.data.title;
            platform = parsed.data.platform;
          }
        } catch {
          // classification is cosmetic — keep the URL as title
        }
      }

      // ---- 3. Segment into passages (Haiku, code-verified) --------------
      await ctx.runMutation(internal.sources.setStatus, {
        sourceId: args.sourceId,
        status: "segmenting",
        title: title ?? source.title,
        platform,
      });
      const segments = await segmentTranscript(transcript);
      if (segments.length === 0) {
        await fail("Transcript could not be segmented into usable passages.");
        return;
      }

      // ---- 4. Persist passages with provenance --------------------------
      await ctx.runMutation(internal.sources.insertPassages, {
        sourceId: args.sourceId,
        userId: source.userId,
        passages: segments.map((text) => ({ text, wordCount: countWords(text) })),
      });
      await ctx.runMutation(internal.sources.setStatus, {
        sourceId: args.sourceId,
        status: "ready",
        wordCount: segments.reduce((n, s) => n + countWords(s), 0),
      });
    } catch (err) {
      await fail(err instanceof Error ? err.message : "Ingestion failed unexpectedly");
    }
  },
});

/** Cron entry point: re-schedule sources stuck in a transient state. */
export const retryStuck = internalAction({
  args: {},
  handler: async (ctx) => {
    const stuck = await ctx.runQuery(internal.sources.stuck, { olderThanMs: 10 * 60 * 1000 });
    for (const source of stuck) {
      await ctx.runMutation(internal.sources.setStatus, {
        sourceId: source._id,
        status: "pending",
      });
      await ctx.scheduler.runAfter(0, internal.ingest.processSource, { sourceId: source._id });
    }
  },
});
