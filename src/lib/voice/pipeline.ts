/**
 * The evidence-grounded synthesis loop.
 *
 * Division of labor (from PLAN.md):
 *  - the model interprets style, names patterns, writes prose;
 *  - this code samples passages, validates schema, verifies every citation
 *    verbatim against stored transcripts, routes failures to a repair pass,
 *    computes coverage, and assembles the final markdown.
 *
 * The model never judges whether its own citations are valid. A trait whose
 * evidence cannot be located is repaired with real evidence or dropped —
 * never shipped.
 */

import { ProfileDraftSchema, RepairResultSchema, type Citation, type Trait } from "./schema";
import { buildPassageMap, verifyTraitCitations } from "./verify";
import { computeCoverage, LOW_CONFIDENCE_WORD_THRESHOLD, MIN_WORDS_TO_SYNTHESIZE } from "./coverage";
import { samplePassages } from "./sample";
import { renderProfileMarkdown } from "./markdown";
import type {
  Confidence,
  EmitFn,
  PassageInput,
  SourceInput,
  SynthesisModel,
  SynthesisResult,
  VerifiedCitation,
  VerifiedTrait,
} from "./types";

export interface PipelineOptions {
  creatorName: string;
  passages: PassageInput[];
  sources: SourceInput[];
  model: SynthesisModel;
  emit: EmitFn;
  /** Model names, used only for event labelling. */
  modelNames?: { draft: string; repair: string };
  now?: () => Date;
}

export class SynthesisError extends Error {}

function enrichCitations(
  citations: Citation[],
  passagesById: Map<string, PassageInput>,
  sourcesById: Map<string, SourceInput>,
): VerifiedCitation[] {
  return citations.map((c) => {
    const passage = passagesById.get(c.passageId);
    const source = passage ? sourcesById.get(passage.sourceId) : undefined;
    return {
      ...c,
      sourceId: source?.id ?? "unknown",
      sourceTitle: source?.title ?? "Unknown source",
      sourcePlatform: source?.platform ?? "other",
      sourceUrl: source?.url,
    };
  });
}

export async function runSynthesisPipeline(opts: PipelineOptions): Promise<SynthesisResult> {
  const { creatorName, passages, sources, model, emit } = opts;
  const now = opts.now ?? (() => new Date());
  const modelNames = opts.modelNames ?? { draft: "claude-opus-4-8", repair: "claude-sonnet-4-6" };

  await emit({ type: "run_started", creatorName });

  // ---- Deterministic: sample a representative evidence set --------------
  const sampled = samplePassages(passages);
  const coverage = computeCoverage(passages, sampled);
  await emit({
    type: "sampling",
    passages: coverage.passagesUsed,
    words: coverage.wordsSampled,
    sources: coverage.sourcesUsed,
  });

  if (coverage.wordsIngested < MIN_WORDS_TO_SYNTHESIZE) {
    await emit({
      type: "failed",
      reason: `Only ${coverage.wordsIngested} words ingested — not enough text to say anything defensible about this voice.`,
    });
    throw new SynthesisError("not enough ingested text to synthesize");
  }

  const passagesById = buildPassageMap(sampled);
  const sourcesById = new Map(sources.map((s) => [s.id, s]));

  // ---- Model writes the draft; code owns the contract --------------------
  await emit({ type: "draft_requested", model: modelNames.draft });
  let raw: unknown;
  try {
    raw = await model.draftProfile({ passages: sampled, sources, creatorName });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await emit({ type: "failed", reason: `synthesis model call failed: ${reason}` });
    throw new SynthesisError(reason);
  }
  const parsed = ProfileDraftSchema.safeParse(raw);
  if (!parsed.success) {
    const reason = parsed.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    await emit({ type: "draft_rejected", reason });
    await emit({ type: "failed", reason: `model output failed schema validation: ${reason}` });
    throw new SynthesisError(`draft failed schema validation: ${reason}`);
  }
  const draft = parsed.data;
  await emit({ type: "draft_received", traitsProposed: draft.traits.length });

  // ---- Code verifies every citation; failures go to repair ---------------
  const verifiedTraits: VerifiedTrait[] = [];
  let repaired = 0;
  let dropped = 0;

  for (const trait of draft.traits) {
    await emit({
      type: "trait_verifying",
      traitId: trait.id,
      name: trait.name,
      section: trait.section,
      citations: trait.citations.length,
    });
    const check = verifyTraitCitations(trait.citations, passagesById);
    for (const c of check.verified) {
      await emit({ type: "citation_verified", traitId: trait.id, passageId: c.passageId, quote: c.quote });
    }
    for (const f of check.failed) {
      await emit({
        type: "citation_failed",
        traitId: trait.id,
        passageId: f.citation.passageId,
        quote: f.citation.quote,
        reason: f.reason,
      });
    }

    if (check.ok) {
      verifiedTraits.push({
        id: trait.id,
        section: trait.section,
        name: trait.name,
        claim: trait.claim,
        citations: enrichCitations(check.verified, passagesById, sourcesById),
        outcome: "verified",
      });
      await emit({ type: "trait_verified", traitId: trait.id, name: trait.name });
      continue;
    }

    // No citation survived — repair pass: find real evidence or drop.
    await emit({ type: "trait_failed", traitId: trait.id, name: trait.name });
    const outcome = await repairTrait(trait, check.failed.map((f) => f.citation.quote));
    if (outcome) {
      verifiedTraits.push(outcome);
      repaired += 1;
      await emit({ type: "trait_repaired", traitId: trait.id, name: trait.name });
    } else {
      dropped += 1;
      await emit({
        type: "trait_dropped",
        traitId: trait.id,
        name: trait.name,
        reason: "no verbatim supporting quote could be located in the source transcripts",
      });
    }
  }

  async function repairTrait(trait: Trait, failedQuotes: string[]): Promise<VerifiedTrait | null> {
    await emit({ type: "repair_requested", traitId: trait.id, name: trait.name, model: modelNames.repair });
    let rawRepair: unknown;
    try {
      rawRepair = await model.repairTrait({ trait, failedQuotes, passages: sampled });
    } catch {
      return null; // a failed repair call means the trait is dropped, not shipped
    }
    const repairParsed = RepairResultSchema.safeParse(rawRepair);
    if (!repairParsed.success) return null;
    const repair = repairParsed.data;
    if (repair.action === "drop" || !repair.citations || repair.citations.length === 0) {
      return null;
    }
    // The repair's citations get exactly the same verification as the draft's.
    const recheck = verifyTraitCitations(repair.citations, passagesById);
    for (const c of recheck.verified) {
      await emit({ type: "citation_verified", traitId: trait.id, passageId: c.passageId, quote: c.quote });
    }
    for (const f of recheck.failed) {
      await emit({
        type: "citation_failed",
        traitId: trait.id,
        passageId: f.citation.passageId,
        quote: f.citation.quote,
        reason: f.reason,
      });
    }
    if (!recheck.ok) return null;
    return {
      id: trait.id,
      section: trait.section,
      name: trait.name,
      claim: trait.claim,
      citations: enrichCitations(recheck.verified, passagesById, sourcesById),
      outcome: "repaired",
    };
  }

  if (verifiedTraits.length === 0) {
    await emit({
      type: "failed",
      reason: "no trait survived citation verification — refusing to ship an ungrounded profile",
    });
    throw new SynthesisError("no trait survived citation verification");
  }

  // ---- Deterministic: confidence, stats, final assembly -------------------
  await emit({ type: "assembling", traitsVerified: verifiedTraits.length });
  const confidence: Confidence =
    coverage.wordsIngested >= LOW_CONFIDENCE_WORD_THRESHOLD ? "grounded" : "low_confidence";
  if (confidence === "low_confidence") {
    await emit({
      type: "low_confidence",
      wordsIngested: coverage.wordsIngested,
      threshold: LOW_CONFIDENCE_WORD_THRESHOLD,
    });
  }

  const stats = {
    ...coverage,
    traitsProposed: draft.traits.length,
    traitsVerified: verifiedTraits.length,
    traitsRepaired: repaired,
    traitsDropped: dropped,
  };

  const markdown = renderProfileMarkdown({
    creatorName,
    summary: draft.summary,
    traits: verifiedTraits,
    confidence,
    stats,
    generatedAt: now(),
  });

  await emit({ type: "completed", confidence, stats });

  return { summary: draft.summary, traits: verifiedTraits, confidence, stats, markdown };
}
