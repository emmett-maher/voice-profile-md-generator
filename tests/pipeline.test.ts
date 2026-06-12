import { describe, expect, it } from "vitest";
import { runSynthesisPipeline } from "@/lib/voice/pipeline";
import { quoteAppearsIn } from "@/lib/voice/verify";
import { DEMO_PERSONAS, getDemoPersona } from "@/lib/demo";
import { createRecordedModel } from "@/lib/demo/recordedModel";
import type { SynthesisEvent } from "@/lib/voice/types";
import type { DemoPersona } from "@/lib/demo/types";

async function runPersona(persona: DemoPersona) {
  const events: SynthesisEvent[] = [];
  const result = await runSynthesisPipeline({
    creatorName: persona.name,
    passages: persona.passages,
    sources: persona.sources,
    model: createRecordedModel(persona),
    emit: (e) => {
      events.push(e);
    },
    now: () => new Date("2026-06-12T00:00:00Z"),
  });
  return { events, result };
}

describe("synthesis pipeline on seeded personas", () => {
  it("every trait in every persona's export has a verbatim, locatable citation", async () => {
    for (const persona of DEMO_PERSONAS) {
      const { result } = await runPersona(persona);
      const passageById = new Map(persona.passages.map((p) => [p.id, p]));
      expect(result.traits.length).toBeGreaterThan(0);
      for (const trait of result.traits) {
        expect(trait.citations.length).toBeGreaterThan(0);
        for (const citation of trait.citations) {
          const passage = passageById.get(citation.passageId);
          expect(passage, `${persona.id}/${trait.id} cites missing passage`).toBeDefined();
          expect(
            quoteAppearsIn(citation.quote, passage!.text),
            `${persona.id}/${trait.id} quote not locatable: "${citation.quote}"`,
          ).toBe(true);
          // export contains the quote
          expect(result.markdown).toContain(citation.quote.trim());
        }
      }
    }
  });

  it("maya's recorded run repairs one trait and drops another, visibly", async () => {
    const { events, result } = await runPersona(getDemoPersona("maya")!);
    expect(events.some((e) => e.type === "trait_repaired" && e.traitId === "maya-t7")).toBe(true);
    expect(events.some((e) => e.type === "trait_dropped" && e.traitId === "maya-t8")).toBe(true);

    const repaired = result.traits.find((t) => t.id === "maya-t7");
    expect(repaired?.outcome).toBe("repaired");
    // the fabricated quote never appears in the export
    expect(result.markdown).not.toContain("lying to you about motivation");
    // the dropped trait never appears in the export
    expect(result.markdown).not.toContain("Six-week transformation promises");
    expect(result.markdown).not.toContain("week six");
    expect(result.stats.traitsDropped).toBe(1);
    expect(result.stats.traitsRepaired).toBe(1);
    expect(result.confidence).toBe("grounded");
  });

  it("an injected trait citing absent text is rejected and never exported", async () => {
    const persona = getDemoPersona("devon")!;
    const tampered: DemoPersona = JSON.parse(JSON.stringify(persona));
    tampered.recording.draft.traits.push({
      id: "injected-t1",
      section: "voice_and_tone",
      name: "Fabricated aggression",
      claim: "He constantly insults his audience to keep them engaged somehow.",
      citations: [{ passageId: "devon-p1", quote: "you absolute fools, listen carefully now" }],
    });
    // no repair recorded for the injected trait → repair returns drop
    const { events, result } = await runPersona(tampered);
    expect(events.some((e) => e.type === "trait_dropped" && e.traitId === "injected-t1")).toBe(true);
    expect(result.traits.find((t) => t.id === "injected-t1")).toBeUndefined();
    expect(result.markdown).not.toContain("Fabricated aggression");
    expect(result.markdown).not.toContain("absolute fools");
  });

  it("thin input yields an explicit low-confidence profile, not a confident one", async () => {
    const { events, result } = await runPersona(getDemoPersona("jules")!);
    expect(result.confidence).toBe("low_confidence");
    expect(events.some((e) => e.type === "low_confidence")).toBe(true);
    expect(result.markdown).toContain("Low-confidence profile");
    expect(result.markdown).not.toMatch(/Confidence: \*\*Grounded\*\*/);
  });

  it("grounded personas exceed the word threshold and are labelled grounded", async () => {
    for (const id of ["maya", "devon"]) {
      const { result } = await runPersona(getDemoPersona(id)!);
      expect(result.confidence, `${id} should be grounded`).toBe("grounded");
      expect(result.markdown).toContain("Confidence: **Grounded**");
    }
  });

  it("export is a self-contained markdown context file", async () => {
    const { result } = await runPersona(getDemoPersona("devon")!);
    expect(result.markdown).toMatch(/^# Voice Profile: Devon Okafor/);
    expect(result.markdown).toContain("## How to use this file");
    expect(result.markdown).toContain("## Provenance");
    // citations carry source provenance (title + platform)
    expect(result.markdown).toContain("How Passkeys Actually Work (No, Really)");
    expect(result.markdown).toContain("(Youtube)");
  });
});
