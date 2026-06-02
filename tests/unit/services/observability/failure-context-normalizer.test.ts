import { describe, expect, it } from "vitest";

import { FailureContextNormalizer } from "../../../../src/services/observability/failure-context-normalizer.js";

describe("FailureContextNormalizer", () => {
  it("redacts secrets from metadata and error messages", () => {
    const normalizer = new FailureContextNormalizer();

    const result = normalizer.normalize({
      error: new Error("Failed with Bearer abc123"),
      metadata: {
        LLM_API_KEY: "sk-secret",
        nested: {
          authorization: "Bearer private-token",
          safe: "visible"
        }
      }
    });

    expect(result.errorMessage).toBe("Failed with [REDACTED]");
    expect(result.metadata).toEqual({
      LLM_API_KEY: "[REDACTED]",
      nested: {
        authorization: "[REDACTED]",
        safe: "visible"
      }
    });
  });

  it("does not require stack traces", () => {
    const normalizer = new FailureContextNormalizer();

    const result = normalizer.normalize({ error: "plain failure" });

    expect(result).toEqual({
      errorMessage: "plain failure",
      metadata: {}
    });
  });
});
