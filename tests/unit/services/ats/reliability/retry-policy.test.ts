import { describe, expect, it } from "vitest";

import { RetryPolicy } from "../../../../../src/services/ats/reliability/retry-policy.js";

describe("RetryPolicy", () => {
  it("retries retryable failures until max attempts", () => {
    const retryPolicy = new RetryPolicy(3);

    expect(retryPolicy.decide({ attempt: 1, errorCode: "SEMANTIC_LOCATOR_NOT_FOUND" })).toEqual({
      shouldRetry: true,
      nextAttempt: 2,
      reason: "SEMANTIC_LOCATOR_NOT_FOUND is retryable"
    });
    expect(retryPolicy.decide({ attempt: 3, errorCode: "SEMANTIC_LOCATOR_NOT_FOUND" })).toEqual({
      shouldRetry: false,
      nextAttempt: 3,
      reason: "Maximum retry attempts reached"
    });
  });

  it("does not retry unsafe submit-adjacent actions", () => {
    const retryPolicy = new RetryPolicy();

    expect(
      retryPolicy.decide({
        attempt: 1,
        errorCode: "SEMANTIC_LOCATOR_NOT_FOUND",
        unsafeSubmitAttempt: true
      })
    ).toEqual({
      shouldRetry: false,
      nextAttempt: 1,
      reason: "Unsafe submit-adjacent actions are never retried"
    });
  });
});
