import { describe, expect, it } from "vitest";

import { SkillMatchScorer } from "../../../../src/services/scoring/skill-match.scorer.js";

describe("SkillMatchScorer", () => {
  it("scores required skill intersection against verified user skills", () => {
    const scorer = new SkillMatchScorer();

    const result = scorer.score(["TypeScript", "Playwright", "Supabase"], ["typescript", "Playwright"]);

    expect(result.score).toBe(66.67);
    expect(result.metadata).toEqual(
      expect.objectContaining({
        matchedSkills: ["typescript", "playwright"],
        missingSkills: ["supabase"]
      })
    );
  });

  it("returns a neutral full score when no required skills exist", () => {
    const scorer = new SkillMatchScorer();

    const result = scorer.score([], ["TypeScript"]);

    expect(result.score).toBe(100);
  });
});
