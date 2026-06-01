import { describe, expect, it, vi } from "vitest";

import type { Job } from "../../../src/domain/jobs/job.types.js";
import type { ParsedJobProfile } from "../../../src/domain/jobs/parsed-job-profile.types.js";
import type { MatchScore } from "../../../src/domain/scoring/scoring.types.js";
import type { UserProfile } from "../../../src/domain/user-profile/user-profile.types.js";
import type { JobRepository } from "../../../src/repositories/job.repository.js";
import type { JobMatchScoreRepository } from "../../../src/repositories/job-match-score.repository.js";
import type { ParsedJobProfileRepository } from "../../../src/repositories/parsed-job-profile.repository.js";
import type { UserProfileRepository } from "../../../src/repositories/user-profile.repository.js";
import type { MatchScoringService } from "../../../src/services/scoring/match-scoring.service.js";
import { ScoreJobUseCase } from "../../../src/use-cases/score-job.use-case.js";

describe("ScoreJobUseCase", () => {
  it("loads score inputs, computes a deterministic score, and persists the full breakdown", async () => {
    const job = buildJob();
    const parsedProfile = buildParsedProfile();
    const userProfile = buildUserProfile();
    const score = buildScore();
    const scoringServiceScore = vi.fn().mockReturnValue(score);
    const scoreRepositoryUpsert = vi.fn().mockResolvedValue(score);
    const jobRepository: JobRepository = {
      upsert: vi.fn(),
      findById: vi.fn().mockResolvedValue(job),
      findUnparsed: vi.fn(),
      markParsed: vi.fn()
    };
    const parsedRepository: ParsedJobProfileRepository = {
      upsert: vi.fn(),
      findByJobId: vi.fn().mockResolvedValue(parsedProfile)
    };
    const userProfileRepository: UserProfileRepository = {
      findDefault: vi.fn().mockResolvedValue(userProfile)
    };
    const scoreRepository: JobMatchScoreRepository = {
      upsert: scoreRepositoryUpsert,
      findByJobId: vi.fn()
    };
    const scoringService = {
      score: scoringServiceScore
    } as unknown as MatchScoringService;
    const useCase = new ScoreJobUseCase(
      jobRepository,
      parsedRepository,
      userProfileRepository,
      scoreRepository,
      scoringService
    );

    const result = await useCase.execute({ jobId: job.id });

    expect(scoringServiceScore).toHaveBeenCalledWith(job, parsedProfile, userProfile);
    expect(scoreRepositoryUpsert).toHaveBeenCalledWith(score);
    expect(result).toEqual({ score });
  });
});

function buildJob(): Job {
  return {
    id: "job_1",
    source: "manual",
    title: "QA Engineer",
    company: "Example Co",
    remoteType: "remote",
    descriptionRaw: "Description",
    applicationUrl: "https://example.com/jobs/1",
    atsType: "unknown",
    discoveredAt: "2026-06-01T00:00:00.000Z"
  };
}

function buildParsedProfile(): ParsedJobProfile {
  return {
    jobId: "job_1",
    responsibilities: [],
    requiredSkills: ["Playwright"],
    preferredSkills: [],
    seniority: "mid",
    compensation: {},
    rawMetadata: {}
  };
}

function buildUserProfile(): UserProfile {
  return {
    id: "user_1",
    fullName: "Kenneth Flororita",
    targetRoles: [],
    targetIndustries: [],
    verifiedSkills: ["Playwright"],
    preferredRemoteTypes: ["remote"],
    salaryCurrency: "PHP",
    baselineSeniority: "mid"
  };
}

function buildScore(): MatchScore {
  return {
    jobId: "job_1",
    skillMatch: 100,
    experienceMatch: 100,
    industryMatch: 0,
    locationMatch: 100,
    compensationMatch: 100,
    finalScore: 90,
    scoringMetadata: {}
  };
}
