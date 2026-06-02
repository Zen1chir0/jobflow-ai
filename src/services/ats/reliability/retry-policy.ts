import type { RetryDecision } from "../../../domain/ats/ats-reliability.types.js";

const DEFAULT_RETRYABLE_ERROR_CODES = new Set([
  "SEMANTIC_LOCATOR_NOT_FOUND",
  "RESUME_UPLOAD_VERIFICATION_FAILED",
  "WORKDAY_STATE_NOT_DETECTED"
]);

export class RetryPolicy {
  constructor(
    private readonly maxAttempts = 3,
    private readonly retryableErrorCodes = DEFAULT_RETRYABLE_ERROR_CODES
  ) {}

  decide(input: { attempt: number; errorCode: string; unsafeSubmitAttempt?: boolean }): RetryDecision {
    if (input.unsafeSubmitAttempt) {
      return {
        shouldRetry: false,
        nextAttempt: input.attempt,
        reason: "Unsafe submit-adjacent actions are never retried"
      };
    }

    if (!this.retryableErrorCodes.has(input.errorCode)) {
      return {
        shouldRetry: false,
        nextAttempt: input.attempt,
        reason: `${input.errorCode} is not retryable`
      };
    }

    if (input.attempt >= this.maxAttempts) {
      return {
        shouldRetry: false,
        nextAttempt: input.attempt,
        reason: "Maximum retry attempts reached"
      };
    }

    return {
      shouldRetry: true,
      nextAttempt: input.attempt + 1,
      reason: `${input.errorCode} is retryable`
    };
  }
}
