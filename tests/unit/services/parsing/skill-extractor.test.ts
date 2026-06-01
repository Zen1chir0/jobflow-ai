import { describe, expect, it } from "vitest";

import { SkillExtractor } from "../../../../src/services/parsing/skill-extractor.js";

describe("SkillExtractor", () => {
  it("extracts known required and preferred skills deterministically", () => {
    const extractor = new SkillExtractor();

    const skills = extractor.extract({
      requirements: ["Experience with TypeScript, Playwright, and API Testing."],
      preferred: ["Supabase and GitHub Actions are nice to have."],
      fullText: ""
    });

    expect(skills.requiredSkills).toEqual(["API Testing", "Playwright", "TypeScript"]);
    expect(skills.preferredSkills).toEqual(["GitHub Actions", "Supabase"]);
  });
});
