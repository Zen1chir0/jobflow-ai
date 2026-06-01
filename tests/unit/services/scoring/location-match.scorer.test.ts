import { describe, expect, it } from "vitest";

import { LocationMatchScorer } from "../../../../src/services/scoring/location-match.scorer.js";

describe("LocationMatchScorer", () => {
  it("scores preferred remote type matches", () => {
    const scorer = new LocationMatchScorer();

    expect(scorer.score("remote", ["remote"]).score).toBe(100);
    expect(scorer.score("hybrid", ["remote"]).score).toBe(0);
  });

  it("returns zero for unknown remote type", () => {
    const scorer = new LocationMatchScorer();

    expect(scorer.score("unknown", ["unknown"]).score).toBe(0);
  });
});
