import { describe, expect, it } from "vitest";

import { IndustryMatchScorer } from "../../../../src/services/scoring/industry-match.scorer.js";

describe("IndustryMatchScorer", () => {
  it("scores direct industry matches case-insensitively", () => {
    const scorer = new IndustryMatchScorer();

    expect(scorer.score("SaaS", ["automation", "saas"]).score).toBe(100);
  });

  it("returns zero when industry is missing or not targeted", () => {
    const scorer = new IndustryMatchScorer();

    expect(scorer.score(undefined, ["saas"]).score).toBe(0);
    expect(scorer.score("finance", ["saas"]).score).toBe(0);
  });
});
