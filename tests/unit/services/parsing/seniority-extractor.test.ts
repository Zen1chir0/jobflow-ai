import { describe, expect, it } from "vitest";

import { SeniorityExtractor } from "../../../../src/services/parsing/seniority-extractor.js";

describe("SeniorityExtractor", () => {
  it("extracts seniority deterministically", () => {
    const extractor = new SeniorityExtractor();

    expect(extractor.extract("Senior QA Automation Engineer")).toBe("senior");
    expect(extractor.extract("Entry-level QA role")).toBe("junior");
    expect(extractor.extract("Automation Engineer")).toBe("unknown");
  });
});
