import { describe, expect, it } from "vitest";

import { ATSTypeDetector } from "../../../../src/services/ats/ats-type-detector.js";

describe("ATSTypeDetector", () => {
  it("detects known ATS types from deterministic signatures", () => {
    const detector = new ATSTypeDetector();

    expect(detector.detect({ url: "https://boards.greenhouse.io/example/jobs/1" })).toBe("greenhouse");
    expect(detector.detect({ url: "https://jobs.lever.co/example/1" })).toBe("lever");
    expect(detector.detect({ url: "https://example.wd1.myworkdaysite.com/recruiting/jobs/1" })).toBe("workday");
  });

  it("falls back to generic for unknown application URLs", () => {
    const detector = new ATSTypeDetector();

    expect(detector.detect({ url: "https://careers.example.com/jobs/1" })).toBe("generic");
  });
});
