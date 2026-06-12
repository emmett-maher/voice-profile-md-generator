import { maya } from "./personas/maya";
import { devon } from "./personas/devon";
import { jules } from "./personas/jules";
import type { DemoPersona } from "./types";

export const DEMO_PERSONAS: DemoPersona[] = [maya, devon, jules];

export function getDemoPersona(id: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.id === id);
}

export type { DemoPersona } from "./types";
