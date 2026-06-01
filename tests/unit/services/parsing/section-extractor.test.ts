import { describe, expect, it } from "vitest";

import { SectionExtractor } from "../../../../src/services/parsing/section-extractor.js";

describe("SectionExtractor", () => {
  it("extracts deterministic job sections from cleaned text", () => {
    const extractor = new SectionExtractor();

    const sections = extractor.extract(`
Responsibilities
- Build automation tests
Requirements
- TypeScript and Playwright
Preferred
- Supabase
Benefits
- PHP 80000 - 120000
`);

    expect(sections.responsibilities).toEqual(["Build automation tests"]);
    expect(sections.requirements).toEqual(["TypeScript and Playwright"]);
    expect(sections.preferred).toEqual(["Supabase"]);
    expect(sections.benefits).toEqual(["PHP 80000 - 120000"]);
  });
});
