import { describe, expect, it } from "vitest";

import { SubmitGuard } from "../../../../src/services/ats/submit-guard.js";

describe("SubmitGuard", () => {
  it("blocks final submit actions", () => {
    const guard = new SubmitGuard();

    expect(() => guard.assertSafeAction("Submit Application")).toThrowError("Final application submission is not automated");
    expect(() => guard.assertSafeAction("Send Application")).toThrowError("Final application submission is not automated");
  });

  it("allows non-submit foundation actions", () => {
    const guard = new SubmitGuard();

    expect(() => guard.assertSafeAction("human_review_required")).not.toThrow();
  });
});
