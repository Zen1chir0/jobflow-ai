import { ApplicationError } from "../domain/errors/application-error.js";
import type { MatchScore } from "../domain/scoring/scoring.types.js";
import type { JobRepository } from "../repositories/job.repository.js";
import type { JobMatchScoreRepository } from "../repositories/job-match-score.repository.js";
import type { ParsedJobProfileRepository } from "../repositories/parsed-job-profile.repository.js";
import type { UserProfileRepository } from "../repositories/user-profile.repository.js";
import type { MatchScoringService } from "../services/scoring/match-scoring.service.js";

export type ScoreJobRequest = {
  jobId: string;
};

export type ScoreJobResult = {
  score: MatchScore;
};

export class ScoreJobUseCase {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly parsedJobProfileRepository: ParsedJobProfileRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly jobMatchScoreRepository: JobMatchScoreRepository,
    private readonly matchScoringService: MatchScoringService
  ) {}

  async execute(request: ScoreJobRequest): Promise<ScoreJobResult> {
    if (!request.jobId) {
      throw new ApplicationError("INVALID_SCORE_REQUEST", "Score requires a job id");
    }

    const job = await this.jobRepository.findById(request.jobId);

    if (!job) {
      throw new ApplicationError("JOB_NOT_FOUND", "Job not found");
    }

    const parsedProfile = await this.parsedJobProfileRepository.findByJobId(job.id);

    if (!parsedProfile) {
      throw new ApplicationError("PARSED_JOB_PROFILE_NOT_FOUND", "Parsed job profile not found");
    }

    const userProfile = await this.userProfileRepository.findDefault();

    if (!userProfile) {
      throw new ApplicationError("USER_PROFILE_NOT_FOUND", "User profile not found");
    }

    const score = this.matchScoringService.score(job, parsedProfile, userProfile);
    const savedScore = await this.jobMatchScoreRepository.upsert(score);

    return {
      score: savedScore
    };
  }
}
