import type { SynthesisModel } from "../voice/types";
import type { DemoPersona } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * A SynthesisModel backed by a recorded run instead of live API calls.
 * The pipeline that consumes it is the real one — schema validation,
 * citation verification, repair routing, and markdown assembly all execute
 * for real against the persona's seeded passages.
 */
export function createRecordedModel(
  persona: DemoPersona,
  opts: { latencyMs?: number } = {},
): SynthesisModel {
  const latency = opts.latencyMs ?? 0;
  return {
    async draftProfile() {
      if (latency > 0) await sleep(latency * 3);
      // Deep-clone so pipeline consumers can't mutate the recording.
      return JSON.parse(JSON.stringify(persona.recording.draft)) as unknown;
    },
    async repairTrait({ trait }) {
      if (latency > 0) await sleep(latency * 2);
      const recorded = persona.recording.repairs[trait.id];
      if (!recorded) return { action: "drop" };
      return JSON.parse(JSON.stringify(recorded)) as unknown;
    },
  };
}
