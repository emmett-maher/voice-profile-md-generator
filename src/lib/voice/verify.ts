/**
 * Deterministic citation verification — the heart of the app's honesty
 * contract. A trait's quote counts as evidence only if it appears verbatim
 * (modulo whitespace and typographic punctuation variants) inside the
 * passage it cites. The model never judges its own citations; this code does.
 */

import type { Citation } from "./schema";
import type { PassageInput } from "./types";

/**
 * Normalization applied to both quote and passage before substring matching:
 * - Unicode NFKC normalization
 * - curly quotes/apostrophes → straight equivalents
 * - en/em dashes → hyphen
 * - ellipsis character → three dots
 * - all whitespace runs collapsed to a single space, trimmed
 * - case-insensitive compare
 *
 * Nothing else. Word content must match exactly.
 */
export function normalizeForMatch(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[‘’‚ʼ]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export interface CitationCheck {
  ok: boolean;
  reason?: string;
}

/** Does the quote appear verbatim (normalized) in this passage's text? */
export function quoteAppearsIn(quote: string, passageText: string): boolean {
  const q = normalizeForMatch(quote);
  if (q.length === 0) return false;
  return normalizeForMatch(passageText).includes(q);
}

/** Verify one citation against the stored passages it claims to come from. */
export function verifyCitation(
  citation: Citation,
  passagesById: Map<string, PassageInput>,
): CitationCheck {
  const passage = passagesById.get(citation.passageId);
  if (!passage) {
    return { ok: false, reason: `cited passage ${citation.passageId} does not exist` };
  }
  if (!quoteAppearsIn(citation.quote, passage.text)) {
    return { ok: false, reason: "quote not found verbatim in cited passage" };
  }
  return { ok: true };
}

export interface TraitVerification {
  ok: boolean;
  verified: Citation[];
  failed: { citation: Citation; reason: string }[];
}

/**
 * A trait passes if at least one of its citations verifies. Failed citations
 * are stripped; a trait with zero surviving citations goes to repair.
 */
export function verifyTraitCitations(
  citations: Citation[],
  passagesById: Map<string, PassageInput>,
): TraitVerification {
  const verified: Citation[] = [];
  const failed: { citation: Citation; reason: string }[] = [];
  for (const citation of citations) {
    const check = verifyCitation(citation, passagesById);
    if (check.ok) verified.push(citation);
    else failed.push({ citation, reason: check.reason ?? "failed verification" });
  }
  return { ok: verified.length > 0, verified, failed };
}

export function buildPassageMap(passages: PassageInput[]): Map<string, PassageInput> {
  return new Map(passages.map((p) => [p.id, p]));
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
