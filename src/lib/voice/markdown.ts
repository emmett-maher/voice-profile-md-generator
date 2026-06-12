/**
 * Deterministic final assembly. No model touches this file's output: verified
 * traits and citations go in, a self-contained Claude context file comes out.
 */

import { PROFILE_SECTIONS, SECTION_LABELS } from "./schema";
import type { SynthesisResult, SynthesisStats, VerifiedTrait } from "./types";

export interface RenderInput {
  creatorName: string;
  summary: string;
  traits: VerifiedTrait[];
  confidence: SynthesisResult["confidence"];
  stats: SynthesisStats;
  generatedAt: Date;
}

function fmtPlatform(platform: string): string {
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function renderProfileMarkdown(input: RenderInput): string {
  const { creatorName, summary, traits, confidence, stats } = input;
  const lines: string[] = [];

  lines.push(`# Voice Profile: ${creatorName}`);
  lines.push("");
  if (confidence === "low_confidence") {
    lines.push(
      "> ⚠️ **Low-confidence profile.** This profile was generated from " +
        `only ${stats.wordsIngested.toLocaleString("en-US")} words of source material — below the ` +
        "threshold for a reliable voice portrait. Every claim below is still " +
        "backed by a verified quote, but the sample is too thin to capture " +
        "this creator's full range. Ingest more content and regenerate before " +
        "relying on it.",
    );
    lines.push("");
  }
  lines.push("## How to use this file");
  lines.push("");
  lines.push(
    "Paste this entire document into Claude as a system prompt (or project " +
      "instructions). It is self-contained: every stylistic claim is backed by " +
      "a verbatim quote from the creator's own published content, with its " +
      "source named. When writing as this creator, imitate the patterns " +
      "described below and use the quoted evidence as calibration for tone, " +
      "rhythm, and vocabulary. Do not mention this profile in your output.",
  );
  lines.push("");
  lines.push(`## Who you are writing as`);
  lines.push("");
  lines.push(summary.trim());
  lines.push("");

  for (const section of PROFILE_SECTIONS) {
    const sectionTraits = traits.filter((t) => t.section === section);
    if (sectionTraits.length === 0) continue;
    lines.push(`## ${SECTION_LABELS[section]}`);
    lines.push("");
    for (const trait of sectionTraits) {
      lines.push(`### ${trait.name.trim()}`);
      lines.push("");
      lines.push(trait.claim.trim());
      lines.push("");
      lines.push("Evidence:");
      lines.push("");
      for (const c of trait.citations) {
        const origin = c.sourceUrl
          ? `[${c.sourceTitle}](${c.sourceUrl}) (${fmtPlatform(c.sourcePlatform)})`
          : `*${c.sourceTitle}* (${fmtPlatform(c.sourcePlatform)})`;
        lines.push(`> "${c.quote.trim()}" — ${origin}`);
        lines.push(">");
      }
      // drop the trailing ">" spacer after the last quote
      lines.pop();
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push("## Provenance");
  lines.push("");
  lines.push(
    `- Confidence: **${confidence === "grounded" ? "Grounded" : "Low confidence"}** — ` +
      (confidence === "grounded"
        ? "every trait above passed verbatim citation verification against stored transcripts."
        : "all citations verified, but the ingested sample is below the reliability threshold."),
  );
  lines.push(`- Words ingested: ${stats.wordsIngested.toLocaleString("en-US")}`);
  lines.push(`- Words sampled for synthesis: ${stats.wordsSampled.toLocaleString("en-US")}`);
  lines.push(`- Sources used: ${stats.sourcesUsed}`);
  lines.push(
    `- Traits: ${stats.traitsVerified} verified` +
      (stats.traitsRepaired > 0 ? ` (${stats.traitsRepaired} repaired with new evidence)` : "") +
      (stats.traitsDropped > 0
        ? `; ${stats.traitsDropped} dropped because no verbatim supporting quote could be located`
        : ""),
  );
  lines.push(`- Generated: ${input.generatedAt.toISOString()}`);
  lines.push("");
  return lines.join("\n");
}
