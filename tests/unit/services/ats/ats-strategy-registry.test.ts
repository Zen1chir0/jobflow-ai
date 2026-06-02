import { describe, expect, it } from "vitest";

import { ATSStrategyRegistry } from "../../../../src/services/ats/ats-strategy-registry.js";
import type { ATSStrategy } from "../../../../src/services/ats/ats-strategy.interface.js";

describe("ATSStrategyRegistry", () => {
  it("resolves the first matching strategy", async () => {
    const registry = new ATSStrategyRegistry([
      { type: "lever", detect: () => false },
      { type: "greenhouse", detect: () => true },
      { type: "generic", detect: () => true }
    ] satisfies ATSStrategy[]);

    const strategy = await registry.resolve({ url: "https://boards.greenhouse.io/example" });

    expect(strategy.type).toBe("greenhouse");
  });

  it("uses the generic fallback when no strategy matches", async () => {
    const registry = new ATSStrategyRegistry([
      { type: "lever", detect: () => false },
      { type: "generic", detect: () => false }
    ] satisfies ATSStrategy[]);

    const strategy = await registry.resolve({ url: "https://careers.example.com/jobs/1" });

    expect(strategy.type).toBe("generic");
  });

  it("resolves Workday before generic fallback", async () => {
    const registry = new ATSStrategyRegistry([
      { type: "workday", detect: (input) => /workday/i.test(input.url) },
      { type: "generic", detect: () => true }
    ] satisfies ATSStrategy[]);

    const strategy = await registry.resolve({ url: "https://company.myworkdayjobs.com/job/123" });

    expect(strategy.type).toBe("workday");
  });
});
