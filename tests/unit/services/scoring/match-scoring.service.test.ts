import { describe, expect, it } from "vitest";

import type { Job } from "../../../../src/domain/jobs/job.types.js";
import type { ParsedJobProfile } from "../../../../src/domain/jobs/parsed-job-profile.types.js";
import type { UserProfile } from "../../../../src/domain/user-profile/user-profile.types.js";
import { MatchScoringService } from "../../../../src/services/scoring/match-scoring.service.js";

describe("MatchScoringService", () => {
  it("calculates the required weighted final score and preserves breakdown metadata", () => {
    const service = new MatchScoringService();

    const score = service.score(buildJob(), buildParsedProfile(), buildUserProfile());

    expect(score).toEqual(
      expect.objectContaining({
        jobId: "job_1",
        skillMatch: 66.67,
        experienceMatch: 50,
        industryMatch: 100,
        locationMatch: 100,
        compensationMatch: 75,
        finalScore: 70.42
      })
    );
    expect(Object.keys(score.scoringMetadata).sort()).toEqual([
      "compensationMatch",
      "experienceMatch",
      "industryMatch",
      "locationMatch",
      "skillMatch"
    ]);
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
    requiredSkills: ["TypeScript", "Playwright", "Supabase"],
    preferredSkills: [],
    seniority: "senior",
    industry: "SaaS",
    compensation: { min: 50000, max: 90000, currency: "PHP" },
    rawMetadata: {}
  };
}

function buildUserProfile(): UserProfile {
  return {
    id: "user_1",
    fullName: "Kenneth Flororita",
    targetRoles: ["QA Automation Engineer"],
    targetIndustries: ["SaaS"],
    verifiedSkills: ["TypeScript", "Playwright"],
    preferredRemoteTypes: ["remote"],
    minimumSalary: 80000,
    salaryCurrency: "PHP",
    baselineSeniority: "mid"
  };
}
