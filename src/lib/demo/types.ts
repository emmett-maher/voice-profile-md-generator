import type { ProfileDraft, RepairResult } from "../voice/schema";
import type { PassageInput, SourceInput } from "../voice/types";

/**
 * A demo persona: seeded transcripts from a fictional creator plus a
 * *recorded* synthesis run — the model outputs (draft + repairs) were
 * captured once and are replayed through the real pipeline, so schema
 * validation, citation verification, drops, and repairs all execute live.
 */
export interface DemoPersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  sources: SourceInput[];
  passages: PassageInput[];
  recording: {
    draft: ProfileDraft;
    /** Recorded repair-pass outputs, keyed by trait id. */
    repairs: Record<string, RepairResult>;
  };
}
