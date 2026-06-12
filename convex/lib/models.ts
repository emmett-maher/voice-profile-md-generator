/**
 * Anthropic model adapters (Node runtime). Per PLAN.md:
 *  - claude-opus-4-8 runs the core voice-synthesis loop;
 *  - claude-haiku-4-5-20251001 handles segmentation + source classification;
 *  - claude-sonnet-4-6 handles the repair pass.
 *
 * Every adapter returns raw JSON; the shared pipeline owns Zod validation
 * and citation verification. The model never certifies its own output.
 */

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  ProfileDraftSchema,
  RepairResultSchema,
  SegmentationSchema,
  SourceClassificationSchema,
  PROFILE_SECTIONS,
} from "../../src/lib/voice/schema";
import type { PassageInput, SourceInput, SynthesisModel } from "../../src/lib/voice/types";

export const DRAFT_MODEL = "claude-opus-4-8";
export const REPAIR_MODEL = "claude-sonnet-4-6";
export const FAST_MODEL = "claude-haiku-4-5-20251001";

function client(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured on the Convex deployment");
  return new Anthropic({ apiKey });
}

function renderEvidence(passages: PassageInput[], sources: SourceInput[]): string {
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  return passages
    .map((p) => {
      const src = sourceById.get(p.sourceId);
      return `<passage id="${p.id}" source="${src?.title ?? "unknown"}" platform="${src?.platform ?? "other"}">\n${p.text}\n</passage>`;
    })
    .join("\n\n");
}

const DRAFT_SYSTEM = `You are a forensic voice analyst. You are given verbatim transcript passages from one creator's published content. Produce a structured voice profile.

Rules that are enforced by code after you answer — violations are dropped:
- Every trait must cite 1-4 quotes as evidence.
- Each citation's "quote" MUST be copied verbatim, character for character, from the passage whose id you cite. Do not paraphrase, trim words mid-quote, or fix grammar. Copy-paste exactly.
- Each citation's "passageId" must be the id of the passage the quote came from.
- Spread traits across the sections: ${PROFILE_SECTIONS.join(", ")}.
- Name patterns precisely (e.g. "Fragment punches", not "good rhythm").
- The "summary" addresses Claude in second person ("You write like...").
- Only describe patterns the evidence actually shows. If you cannot find a verbatim quote for a pattern, do not include the trait.`;

export function createAnthropicSynthesisModel(): SynthesisModel {
  const anthropic = client();
  return {
    async draftProfile({ passages, sources, creatorName }) {
      const response = await anthropic.messages.parse({
        model: DRAFT_MODEL,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        system: DRAFT_SYSTEM,
        messages: [
          {
            role: "user",
            content: `Creator: ${creatorName}\n\nTranscript passages:\n\n${renderEvidence(passages, sources)}\n\nProduce the voice profile JSON now. Remember: quotes must be verbatim substrings of the cited passage.`,
          },
        ],
        output_config: { format: zodOutputFormat(ProfileDraftSchema) },
      });
      if (response.stop_reason === "refusal") {
        throw new Error("synthesis model refused the request");
      }
      return response.parsed_output as unknown;
    },

    async repairTrait({ trait, failedQuotes, passages }) {
      const response = await anthropic.messages.parse({
        model: REPAIR_MODEL,
        max_tokens: 4000,
        system: `A voice-profile trait failed citation verification: the quoted evidence does not appear verbatim in the cited passages. Your job: search the passages for REAL verbatim quotes that support the trait's claim. If you find supporting quotes, return action "replace_citations" with 1-4 citations whose "quote" fields are exact, character-for-character substrings of the passage you cite. If the passages contain no genuine support for the claim, return action "drop". Never invent or alter a quote — code re-verifies every citation.`,
        messages: [
          {
            role: "user",
            content: `Trait: ${trait.name}\nSection: ${trait.section}\nClaim: ${trait.claim}\n\nQuotes that FAILED verification (do not reuse): ${JSON.stringify(failedQuotes)}\n\nPassages:\n\n${passages.map((p) => `<passage id="${p.id}">\n${p.text}\n</passage>`).join("\n\n")}`,
          },
        ],
        output_config: { format: zodOutputFormat(RepairResultSchema) },
      });
      if (response.stop_reason === "refusal") {
        throw new Error("repair model refused the request");
      }
      return response.parsed_output as unknown;
    },
  };
}

/** Haiku segmentation: split a transcript into topically coherent passages. */
export async function segmentWithHaiku(transcript: string): Promise<unknown> {
  const anthropic = client();
  const response = await anthropic.messages.parse({
    model: FAST_MODEL,
    max_tokens: 16000,
    system:
      "Split the transcript into coherent passages of roughly 60-180 words. Each segment's \"text\" MUST be a verbatim, contiguous slice of the transcript — code verifies this with substring matching and discards anything altered. Do not summarize, rephrase, or skip content.",
    messages: [{ role: "user", content: transcript }],
    output_config: { format: zodOutputFormat(SegmentationSchema) },
  });
  if (response.stop_reason === "refusal") throw new Error("segmentation model refused");
  return response.parsed_output as unknown;
}

/** Haiku source classification: platform + human-readable title. */
export async function classifySourceWithHaiku(input: {
  url: string;
  excerpt: string;
}): Promise<unknown> {
  const anthropic = client();
  const response = await anthropic.messages.parse({
    model: FAST_MODEL,
    max_tokens: 500,
    system:
      "Classify the content source. Return the platform it most likely came from and a clean, human-readable title (no site-name suffixes).",
    messages: [
      {
        role: "user",
        content: `URL: ${input.url}\n\nFirst part of the content:\n${input.excerpt.slice(0, 2000)}`,
      },
    ],
    output_config: { format: zodOutputFormat(SourceClassificationSchema) },
  });
  if (response.stop_reason === "refusal") throw new Error("classification model refused");
  return response.parsed_output as unknown;
}
