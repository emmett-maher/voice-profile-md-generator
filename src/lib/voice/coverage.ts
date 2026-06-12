import { countWords } from "./verify";
import type { CoverageStats, PassageInput } from "./types";

/**
 * Below this many ingested words, the generated profile is explicitly
 * labelled low-confidence rather than presented as a grounded portrait.
 */
export const LOW_CONFIDENCE_WORD_THRESHOLD = 1200;

/** Hard floor: with fewer words than this we refuse to synthesize at all. */
export const MIN_WORDS_TO_SYNTHESIZE = 60;

export function computeCoverage(
  allPassages: PassageInput[],
  sampledPassages: PassageInput[],
): CoverageStats {
  const wordsIngested = allPassages.reduce((n, p) => n + countWords(p.text), 0);
  const wordsSampled = sampledPassages.reduce((n, p) => n + countWords(p.text), 0);
  const sourcesUsed = new Set(sampledPassages.map((p) => p.sourceId)).size;
  return {
    wordsIngested,
    wordsSampled,
    sourcesUsed,
    passagesUsed: sampledPassages.length,
  };
}
