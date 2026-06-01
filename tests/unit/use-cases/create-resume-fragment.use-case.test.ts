import { describe, expect, it, vi } from "vitest";

import type { UserProfile } from "../../../src/domain/user-profile/user-profile.types.js";
import type { UserProfileRepository } from "../../../src/repositories/user-profile.repository.js";
import type { ResumeIntelligenceService } from "../../../src/services/resume-intelligence/resume-intelligence.service.js";
import { CreateResumeFragmentUseCase } from "../../../src/use-cases/create-resume-fragment.use-case.js";

describe("CreateResumeFragmentUseCase", () => {
  it("uses the default user profile and delegates fragment creation to the service", async () => {
    const fragment = {
      id: "fragment_1",
      userProfileId: "user_1",
      fragmentText: "Built Playwright framework.",
      fragmentType: "project" as const,
      metadata: {},
      embedding: []
    };
    const createFragment = vi.fn().mockResolvedValue(fragment);
    const useCase = new CreateResumeFragmentUseCase(
      {
        findDefault: vi.fn().mockResolvedValue(buildUserProfile())
      } satisfies UserProfileRepository,
      {
        createFragment,
        retrieveContext: vi.fn()
      } as unknown as ResumeIntelligenceService
    );

    const result = await useCase.execute({
      fragmentText: "Built Playwright framework.",
      fragmentType: "project",
      sourceLabel: "FlowSentinel"
    });

    expect(createFragment).toHaveBeenCalledWith({
      userProfileId: "user_1",
      fragmentText: "Built Playwright framework.",
      fragmentType: "project",
      sourceLabel: "FlowSentinel"
    });
    expect(result).toEqual({ fragment });
  });
});

function buildUserProfile(): UserProfile {
  return {
    id: "user_1",
    fullName: "Kenneth Flororita",
    targetRoles: [],
    targetIndustries: [],
    verifiedSkills: [],
    preferredRemoteTypes: ["remote"],
    salaryCurrency: "PHP",
    baselineSeniority: "mid"
  };
}
