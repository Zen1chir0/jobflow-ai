import { describe, expect, it } from "vitest";

import { SalaryParser } from "../../../../src/services/parsing/salary-parser.js";

describe("SalaryParser", () => {
  it("parses deterministic salary ranges without scoring compensation", () => {
    const parser = new SalaryParser();

    const compensation = parser.parse("PHP 80000 - 120000 monthly");

    expect(compensation).toEqual({
      min: 80000,
      max: 120000,
      currency: "PHP",
      raw: "PHP 80000 - 120000 monthly"
    });
  });

  it("returns empty compensation when no salary is present", () => {
    expect(new SalaryParser().parse("competitive benefits")).toEqual({});
  });
});
