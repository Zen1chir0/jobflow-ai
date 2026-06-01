import { describe, expect, it } from "vitest";

import { CompensationMatchScorer } from "../../../../src/services/scoring/compensation-match.scorer.js";

describe("CompensationMatchScorer", () => {
  it("scores compensation against the minimum salary threshold", () => {
    const scorer = new CompensationMatchScorer();

    expect(scorer.score({ min: 80000, max: 120000, currency: "PHP" }, 80000, "PHP").score).toBe(100);
    expect(scorer.score({ min: 50000, max: 90000, currency: "PHP" }, 80000, "PHP").score).toBe(75);
    expect(scorer.score({ min: 40000, max: 60000, currency: "PHP" }, 80000, "PHP").score).toBe(75);
  });

  it("handles missing salary requirements, missing compensation, and currency mismatch", () => {
    const scorer = new CompensationMatchScorer();

    expect(scorer.score({}, undefined, "PHP").score).toBe(100);
    expect(scorer.score({}, 80000, "PHP").score).toBe(0);
    expect(scorer.score({ min: 80000, currency: "USD" }, 80000, "PHP").score).toBe(0);
  });
});
