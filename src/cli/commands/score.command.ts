import { Command } from "commander";

import { SupabaseJobRepository } from "../../repositories/job.repository.js";
import { SupabaseJobMatchScoreRepository } from "../../repositories/job-match-score.repository.js";
import { SupabaseParsedJobProfileRepository } from "../../repositories/parsed-job-profile.repository.js";
import { SupabaseUserProfileRepository } from "../../repositories/user-profile.repository.js";
import { MatchScoringService } from "../../services/scoring/match-scoring.service.js";
import { ScoreJobUseCase, type ScoreJobResult } from "../../use-cases/score-job.use-case.js";

type ScoreCommandOptions = {
  jobId?: string;
};

type ScoreUseCaseFactory = () => ScoreJobUseCase;

export function createScoreCommand(createUseCase: ScoreUseCaseFactory = createDefaultScoreUseCase): Command {
  return new Command("score")
    .description("Score a parsed job against the default user profile")
    .requiredOption("--job-id <jobId>", "job id to score")
    .action(async (options: ScoreCommandOptions) => {
      const useCase = createUseCase();
      const result = await useCase.execute({
        jobId: options.jobId ?? ""
      });
      displayScoreResult(result);
    });
}

function createDefaultScoreUseCase(): ScoreJobUseCase {
  return new ScoreJobUseCase(
    new SupabaseJobRepository(),
    new SupabaseParsedJobProfileRepository(),
    new SupabaseUserProfileRepository(),
    new SupabaseJobMatchScoreRepository(),
    new MatchScoringService()
  );
}

function displayScoreResult(result: ScoreJobResult): void {
  const { score } = result;

  console.log(`Scored job ${score.jobId}: ${score.finalScore}`);
  console.log(
    `skill=${score.skillMatch} experience=${score.experienceMatch} industry=${score.industryMatch} location=${score.locationMatch} compensation=${score.compensationMatch}`
  );
}
