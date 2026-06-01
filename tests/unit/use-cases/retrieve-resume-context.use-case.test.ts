import { describe, expect, it, vi } from "vitest";

import type { ParsedJobProfile } from "../../../src/domain/jobs/parsed-job-profile.types.js";
import type { ParsedJobProfileRepository } from "../../../src/repositories/parsed-job-profile.repository.js";
import type { ResumeIntelligenceService } from "../../../src/services/resume-intelligence/resume-intelligence.service.js";
import { RetrieveResumeContextUseCase } from "../../../src/use-cases/retrieve-resume-context.use-case.js";

describe("RetrieveResumeContextUseCase", () => {
  it("loads a parsed job profile and returns retrieved resume context", async () => {
    const parsedProfile = buildParsedProfile();
    const context = {
      fragments: [
        {
          id: "fragment_1",
          fragmentText: "Built Playwright framework.",
          fragmentType: "project" as const,
          metadata: {},
          embedding: [],
          similarity: 0.92
        }
      ],
      contextText: "- [project] Built Playwright framework."
    };
    const retrieveContext = vi.fn().mockResolvedValue(context);
    const useCase = new RetrieveResumeContextUseCase(
      {
        upsert: vi.fn(),
        findByJobId: vi.fn().mockResolvedValue(parsedProfile)
      } satisfies ParsedJobProfileRepository,
      {
        createFragment: vi.fn(),
        retrieveContext
      } as unknown as ResumeIntelligenceService
    );

    const result = await useCase.execute({ jobId: "job_1", topK: 3, threshold: 0.8 });

    expect(retrieveContext).toHaveBeenCalledWith(parsedProfile, { topK: 3, threshold: 0.8 });
    expect(result).toEqual(context);
  });
});

function buildParsedProfile(): ParsedJobProfile {
  return {
    jobId: "job_1",
    responsibilities: ["Build tests"],
    requiredSkills: ["Playwright"],
    preferredSkills: [],
    seniority: "mid",
    compensation: {},
    rawMetadata: {}
  };
}
