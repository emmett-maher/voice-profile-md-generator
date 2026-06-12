import type { Citation, ProfileSection, Trait } from "./schema";

/** A stored chunk of transcript text with provenance back to its source. */
export interface PassageInput {
  id: string;
  sourceId: string;
  text: string;
}

/** Provenance for one ingested video/post/episode. */
export interface SourceInput {
  id: string;
  platform: string;
  title: string;
  url?: string;
}

/** A citation that survived verification, enriched with provenance. */
export interface VerifiedCitation extends Citation {
  sourceId: string;
  sourceTitle: string;
  sourcePlatform: string;
  sourceUrl?: string;
}

export type TraitOutcome = "verified" | "repaired" | "dropped";

export interface VerifiedTrait {
  id: string;
  section: ProfileSection;
  name: string;
  claim: string;
  citations: VerifiedCitation[];
  outcome: Exclude<TraitOutcome, "dropped">;
}

export type Confidence = "grounded" | "low_confidence";

export interface CoverageStats {
  wordsIngested: number;
  wordsSampled: number;
  sourcesUsed: number;
  passagesUsed: number;
}

export interface SynthesisStats extends CoverageStats {
  traitsProposed: number;
  traitsVerified: number;
  traitsRepaired: number;
  traitsDropped: number;
}

export interface SynthesisResult {
  summary: string;
  traits: VerifiedTrait[];
  confidence: Confidence;
  stats: SynthesisStats;
  markdown: string;
}

/**
 * The model interface the pipeline drives. Implemented by the Anthropic
 * adapter in full mode and by the recorded adapter in demo mode. Returns
 * `unknown` on purpose — the pipeline owns schema validation.
 */
export interface SynthesisModel {
  draftProfile(input: {
    passages: PassageInput[];
    sources: SourceInput[];
    creatorName: string;
  }): Promise<unknown>;
  repairTrait(input: {
    trait: Trait;
    failedQuotes: string[];
    passages: PassageInput[];
  }): Promise<unknown>;
}

/** Events emitted by the synthesis loop so the UI can render it live. */
export type SynthesisEvent =
  | { type: "run_started"; creatorName: string }
  | { type: "sampling"; passages: number; words: number; sources: number }
  | { type: "draft_requested"; model: string }
  | { type: "draft_received"; traitsProposed: number }
  | { type: "draft_rejected"; reason: string }
  | { type: "trait_verifying"; traitId: string; name: string; section: ProfileSection; citations: number }
  | { type: "citation_verified"; traitId: string; passageId: string; quote: string }
  | { type: "citation_failed"; traitId: string; passageId: string; quote: string; reason: string }
  | { type: "trait_verified"; traitId: string; name: string }
  | { type: "trait_failed"; traitId: string; name: string }
  | { type: "repair_requested"; traitId: string; name: string; model: string }
  | { type: "trait_repaired"; traitId: string; name: string }
  | { type: "trait_dropped"; traitId: string; name: string; reason: string }
  | { type: "assembling"; traitsVerified: number }
  | { type: "low_confidence"; wordsIngested: number; threshold: number }
  | { type: "completed"; confidence: Confidence; stats: SynthesisStats }
  | { type: "failed"; reason: string };

export type EmitFn = (event: SynthesisEvent) => void | Promise<void>;
