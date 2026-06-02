import { describe, expect, it } from "vitest";

import { CheckpointNormalizer } from "../../../../src/services/observability/checkpoint-normalizer.js";

describe("CheckpointNormalizer", () => {
  it("redacts cookies and session tokens from checkpoint payloads", () => {
    const normalizer = new CheckpointNormalizer();

    expect(
      normalizer.normalize({
        currentStep: "upload_resume",
        cookies: ["session=secret"],
        sessionToken: "abc123"
      })
    ).toEqual({
      currentStep: "upload_resume",
      cookies: "[REDACTED]",
      sessionToken: "[REDACTED]"
    });
  });
});
