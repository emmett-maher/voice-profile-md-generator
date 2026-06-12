import { describe, expect, it } from "vitest";
import {
  buildPassageMap,
  normalizeForMatch,
  quoteAppearsIn,
  verifyCitation,
  verifyTraitCitations,
} from "@/lib/voice/verify";

const passages = [
  { id: "p1", sourceId: "s1", text: "Okay,  real talk.\nYour first 5AM workout is going to suck." },
  { id: "p2", sourceId: "s1", text: "Motivation is a “flaky friend” — who shows up late." },
];
const map = buildPassageMap(passages);

describe("normalizeForMatch", () => {
  it("collapses whitespace and lowercases", () => {
    expect(normalizeForMatch("Okay,   real\n\ttalk.")).toBe("okay, real talk.");
  });
  it("normalizes typographic quotes and dashes", () => {
    expect(normalizeForMatch("“flaky friend” — late")).toBe('"flaky friend" - late');
  });
});

describe("quoteAppearsIn", () => {
  it("matches verbatim quotes across whitespace differences", () => {
    expect(quoteAppearsIn("real talk. Your first 5AM workout", passages[0].text)).toBe(true);
  });
  it("matches straight quotes against curly source quotes", () => {
    expect(quoteAppearsIn('"flaky friend" - who shows up late', passages[1].text)).toBe(true);
  });
  it("rejects quotes whose words differ", () => {
    expect(quoteAppearsIn("your first 6AM workout", passages[0].text)).toBe(false);
  });
  it("rejects empty quotes", () => {
    expect(quoteAppearsIn("   ", passages[0].text)).toBe(false);
  });
});

describe("verifyCitation", () => {
  it("rejects citations pointing at nonexistent passages", () => {
    const check = verifyCitation({ passageId: "nope", quote: "real talk" }, map);
    expect(check.ok).toBe(false);
    expect(check.reason).toMatch(/does not exist/);
  });
  it("rejects an injected quote absent from all passages", () => {
    const check = verifyCitation(
      { passageId: "p1", quote: "this sentence was never spoken by anyone" },
      map,
    );
    expect(check.ok).toBe(false);
  });
});

describe("verifyTraitCitations", () => {
  it("passes a trait when at least one citation verifies, stripping failures", () => {
    const result = verifyTraitCitations(
      [
        { passageId: "p1", quote: "going to suck" },
        { passageId: "p1", quote: "completely fabricated quote" },
      ],
      map,
    );
    expect(result.ok).toBe(true);
    expect(result.verified).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
  });
  it("fails a trait when no citation verifies", () => {
    const result = verifyTraitCitations([{ passageId: "p2", quote: "nothing like this" }], map);
    expect(result.ok).toBe(false);
  });
});
