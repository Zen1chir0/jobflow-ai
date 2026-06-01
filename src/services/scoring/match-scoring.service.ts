import type { Job } from "../../domain/jobs/job.types.js";
import type { ParsedJobProfile } from "../../domain/jobs/parsed-job-profile.types.js";
import type { MatchScore } from "../../domain/scoring/scoring.types.js";
import type { UserProfile } from "../../domain/user-profile/user-profile.types.js";
import { CompensationMatchScorer } from "./compensation-match.scorer.js";
import { ExperienceMatchScorer } from "./experience-match.scorer.js";
import { IndustryMatchScorer } from "./industry-match.scorer.js";
import { LocationMatchScorer } from "./location-match.scorer.js";
import { roundScore } from "./score-utils.js";
import { SkillMatchScorer } from "./skill-match.scorer.js";

export class MatchScoringService {
  constructor(
    private readonly skillMatchScorer = new SkillMatchScorer(),
    private readonly experienceMatchScorer = new ExperienceMatchScorer(),
    private readonly industryMatchScorer = new IndustryMatchScorer(),
    private readonly locationMatchScorer = new LocationMatchScorer(),
    private readonly compensationMatchScorer = new CompensationMatchScorer()
  ) {}

  score(job: Job, profile: ParsedJobProfile, userProfile: UserProfile): MatchScore {
    const skillMatch = this.skillMatchScorer.score(profile.requiredSkills, userProfile.verifiedSkills);
    const experienceMatch = this.experienceMatchScorer.score(profile.seniority, userProfile.baselineSeniority);
    const industryMatch = this.industryMatchScorer.score(profile.industry, userProfile.targetIndustries);
    const locationMatch = this.locationMatchScorer.score(job.remoteType, userProfile.preferredRemoteTypes);
    const compensationMatch = this.compensationMatchScorer.score(
      profile.compensation,
      userProfile.minimumSalary,
      userProfile.salaryCurrency
    );

    const finalScore = roundScore(
      skillMatch.score * 0.4 +
        experienceMatch.score * 0.25 +
        industryMatch.score * 0.1 +
        locationMatch.score * 0.1 +
        compensationMatch.score * 0.15
    );

    return {
      jobId: job.id,
      skillMatch: skillMatch.score,
      experienceMatch: experienceMatch.score,
      industryMatch: industryMatch.score,
      locationMatch: locationMatch.score,
      compensationMatch: compensationMatch.score,
      finalScore,
      scoringMetadata: {
        skillMatch: skillMatch.metadata,
        experienceMatch: experienceMatch.metadata,
        industryMatch: industryMatch.metadata,
        locationMatch: locationMatch.metadata,
        compensationMatch: compensationMatch.metadata
      }
    };
  }
}
