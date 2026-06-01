import { describe, expect, it } from "vitest";

import { HallucinationGuard } from "../../../../src/services/document-generation/hallucination-guard.js";
import { buildGenerationInput, buildResumeJson } from "./support/document-generation.fixtures.js";

describe("HallucinationGuard", () => {
  it("accepts generated claims grounded in retrieved fragments or user profile", () => {
    const input = buildGenerationInput();

    expect(() =>
      new HallucinationGuard().verify({
        documentType: "resume_json",
        content: buildResumeJson(),
        resumeContext: input.resumeContext,
        userProfile: input.userProfile
      })
    ).not.toThrow();
  });

  it("rejects unsupported generated claims", () => {
    const input = buildGenerationInput();

    expect(() =>
      new HallucinationGuard().verify({
        documentType: "resume_json",
        content: {
          ...buildResumeJson(),
          projects: [
            {
              name: "Unsupported Cloud Migration",
              description: "Reduced latency by 99%",
              technologies: ["Kubernetes"],
              highlights: [{ text: "Reduced latency by 99%", evidenceFragmentIds: ["fragment_1"] }],
              evidenceFragmentIds: ["fragment_1"]
            }
          ]
        },
        resumeContext: input.resumeContext,
        userProfile: input.userProfile
      })
    ).toThrow("Unsupported generated claim");
  });
});
