import { z } from "zod/v4";

/**
 * Zod schemas for everything that crosses the model boundary.
 *
 * The model writes; code certifies. Every payload coming back from Claude is
 * parsed against these schemas before any of it is trusted, and every quoted
 * citation is then verified verbatim against stored passages (see verify.ts).
 */

export const PROFILE_SECTIONS = [
  "voice_and_tone",
  "signature_vocabulary",
  "sentence_rhythm",
  "rhetorical_moves",
  "content_patterns",
] as const;

export type ProfileSection = (typeof PROFILE_SECTIONS)[number];

export const SECTION_LABELS: Record<ProfileSection, string> = {
  voice_and_tone: "Voice & Tone",
  signature_vocabulary: "Signature Vocabulary",
  sentence_rhythm: "Sentence Rhythm",
  rhetorical_moves: "Rhetorical Moves",
  content_patterns: "Content Patterns",
};

/** One quoted piece of evidence, pointing at a stored passage. */
export const CitationSchema = z.object({
  passageId: z.string().min(1),
  /** Verbatim quote that must appear (whitespace-normalized) in the passage. */
  quote: z.string().min(8),
});
export type Citation = z.infer<typeof CitationSchema>;

/** One observed trait of the creator's voice, defended by citations. */
export const TraitSchema = z.object({
  id: z.string().min(1),
  section: z.enum(PROFILE_SECTIONS),
  name: z.string().min(2).max(120),
  claim: z.string().min(10),
  citations: z.array(CitationSchema).min(1).max(4),
});
export type Trait = z.infer<typeof TraitSchema>;

/** The full draft profile emitted by the synthesis model. */
export const ProfileDraftSchema = z.object({
  /** 2–4 sentence overview of the voice, written in second person for Claude. */
  summary: z.string().min(40),
  traits: z.array(TraitSchema).min(3).max(16),
});
export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;

/** Output of the repair pass for a trait whose citation failed verification. */
export const RepairResultSchema = z.object({
  action: z.enum(["replace_citations", "drop"]),
  /** Required when action is replace_citations. */
  citations: z.array(CitationSchema).max(4).optional(),
});
export type RepairResult = z.infer<typeof RepairResultSchema>;

/** Output of the Haiku segmentation pass over a raw transcript. */
export const SegmentationSchema = z.object({
  segments: z
    .array(
      z.object({
        /** Verbatim slice of the transcript; code verifies it appears. */
        text: z.string().min(40),
      }),
    )
    .min(1)
    .max(120),
});
export type Segmentation = z.infer<typeof SegmentationSchema>;

/** Output of the Haiku source-classification pass. */
export const SourceClassificationSchema = z.object({
  platform: z.enum(["youtube", "podcast", "blog", "social", "other"]),
  title: z.string().min(1).max(200),
});
export type SourceClassification = z.infer<typeof SourceClassificationSchema>;
