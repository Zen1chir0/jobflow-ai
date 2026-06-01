import { describe, expect, it } from "vitest";

import { ExperienceMatchScorer } from "../../../../src/services/scoring/experience-match.scorer.js";

describe("ExperienceMatchScorer", () => {
  it("uses the documented seniority lookup table", () => {
    const scorer = new ExperienceMatchScorer();

    expect(scorer.score("mid", "mid").score).toBe(100);
    expect(scorer.score("senior", "mid").score).toBe(50);
    expect(scorer.score("mid", "senior").score).toBe(80);
    expect(scorer.score("lead", "junior").score).toBe(0);
  });

  it("returns zero for unknown job seniority", () => {
    const scorer = new ExperienceMatchScorer();

    expect(scorer.score("unknown", "mid").score).toBe(0);
  });
});
