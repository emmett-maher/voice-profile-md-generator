import { countWords } from "./verify";

/** Target passage size for segmentation (words). */
export const TARGET_PASSAGE_WORDS = 110;
export const MAX_PASSAGE_WORDS = 200;

/**
 * Deterministic fallback segmentation: split on sentence boundaries and pack
 * sentences into ~TARGET_PASSAGE_WORDS chunks. Used when the Haiku
 * segmentation pass fails validation (its segments must appear verbatim in
 * the transcript) and as the pre-chunker for very long transcripts.
 */
export function segmentDeterministically(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  // Split keeping sentence-ending punctuation attached.
  const sentences = normalized.match(/[^.!?]+[.!?]+["')\]]?\s*|[^.!?]+$/g) ?? [normalized];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current}${sentence}` : sentence;
    if (countWords(candidate) > TARGET_PASSAGE_WORDS && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // Hard-split any pathological chunk that still exceeds the max.
  const result: string[] = [];
  for (const chunk of chunks) {
    const words = chunk.split(" ");
    if (words.length <= MAX_PASSAGE_WORDS) {
      result.push(chunk);
      continue;
    }
    for (let i = 0; i < words.length; i += TARGET_PASSAGE_WORDS) {
      result.push(words.slice(i, i + TARGET_PASSAGE_WORDS).join(" "));
    }
  }
  return result.filter((c) => countWords(c) >= 5);
}
