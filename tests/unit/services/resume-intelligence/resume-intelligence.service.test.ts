import { describe, expect, it, vi } from "vitest";

import type { ParsedJobProfile } from "../../../../src/domain/jobs/parsed-job-profile.types.js";
import type { ResumeFragment } from "../../../../src/domain/resumes/resume-fragment.types.js";
import type { EmbeddingProvider } from "../../../../src/integrations/embeddings/embedding-provider.interface.js";
import type { ResumeFragmentRepository } from "../../../../src/repositories/resume-fragment.repository.js";
import { ResumeIntelligenceService } from "../../../../src/services/resume-intelligence/resume-intelligence.service.js";

describe("ResumeIntelligenceService", () => {
  it("embeds and stores atomic fragments through the repository", async () => {
    const embedding = buildEmbedding();
    const savedFragment = buildFragment({ embedding });
    const create = vi.fn().mockResolvedValue(savedFragment);
    const repository: ResumeFragmentRepository = {
      create,
      findByUserProfileId: vi.fn(),
      matchResumeFragments: vi.fn()
    };
    const service = new ResumeIntelligenceService(repository, {
      embed: vi.fn().mockResolvedValue(embedding)
    } satisfies EmbeddingProvider);

    const result = await service.createFragment({
      userProfileId: "user_1",
      fragmentText: "Built Playwright framework.",
      fragmentType: "project"
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        userProfileId: "user_1",
        fragmentText: "Built Playwright framework.",
        embedding
      })
    );
    expect(result).toEqual(savedFragment);
  });

  it("retrieves fragments and builds prompt-ready context without generating documents", async () => {
    const fragment = buildFragment({ similarity: 0.91 });
    const repository: ResumeFragmentRepository = {
      create: vi.fn(),
      findByUserProfileId: vi.fn(),
      matchResumeFragments: vi.fn().mockResolvedValue([fragment])
    };
    const service = new ResumeIntelligenceService(repository, {
      embed: vi.fn().mockResolvedValue([0.1, 0.2])
    } satisfies EmbeddingProvider);

    const result = await service.retrieveContext(buildParsedProfile());

    expect(result.fragments).toEqual([fragment]);
    expect(result.contextText).toBe("- [project] Built Playwright framework.");
  });
});

function buildEmbedding(): number[] {
  return Array.from({ length: 1536 }, () => 0.1);
}

function buildFragment(overrides: Partial<ResumeFragment> = {}): ResumeFragment {
  return {
    id: "fragment_1",
    userProfileId: "user_1",
    fragmentText: "Built Playwright framework.",
    fragmentType: "project",
    metadata: {},
    embedding: [],
    ...overrides
  };
}

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
