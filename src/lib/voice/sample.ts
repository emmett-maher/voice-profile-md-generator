import { countWords } from "./verify";
import type { PassageInput } from "./types";

/** Word budget for the passage sample handed to the synthesis model. */
export const SAMPLE_WORD_BUDGET = 9000;

/**
 * Deterministic, representative sampling: round-robin across sources in
 * stored order so no single video dominates the sample, capped by a word
 * budget. Deterministic so reruns over the same data see the same evidence.
 */
export function samplePassages(
  passages: PassageInput[],
  budgetWords: number = SAMPLE_WORD_BUDGET,
): PassageInput[] {
  const bySource = new Map<string, PassageInput[]>();
  for (const p of passages) {
    const list = bySource.get(p.sourceId) ?? [];
    list.push(p);
    bySource.set(p.sourceId, list);
  }
  const queues = [...bySource.values()];
  const sampled: PassageInput[] = [];
  let words = 0;
  let exhausted = false;
  while (!exhausted) {
    exhausted = true;
    for (const queue of queues) {
      const next = queue.shift();
      if (!next) continue;
      exhausted = false;
      const w = countWords(next.text);
      if (words + w > budgetWords && sampled.length > 0) {
        return sampled;
      }
      sampled.push(next);
      words += w;
    }
  }
  return sampled;
}
