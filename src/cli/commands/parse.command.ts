import { Command } from "commander";

import { SupabaseJobRepository } from "../../repositories/job.repository.js";
import { SupabaseParsedJobProfileRepository } from "../../repositories/parsed-job-profile.repository.js";
import { HtmlCleaner } from "../../services/parsing/html-cleaner.js";
import { JobParsingService } from "../../services/parsing/job-parsing.service.js";
import { SalaryParser } from "../../services/parsing/salary-parser.js";
import { SectionExtractor } from "../../services/parsing/section-extractor.js";
import { SeniorityExtractor } from "../../services/parsing/seniority-extractor.js";
import { SkillExtractor } from "../../services/parsing/skill-extractor.js";
import { ParseJobUseCase, type ParseJobResult } from "../../use-cases/parse-job.use-case.js";

type ParseCommandOptions = {
  jobId?: string;
  all?: boolean;
  limit?: string;
};

type ParseUseCaseFactory = () => ParseJobUseCase;

export function createParseCommand(createUseCase: ParseUseCaseFactory = createDefaultParseUseCase): Command {
  return new Command("parse")
    .description("Parse discovered job descriptions into structured job profiles")
    .option("--job-id <jobId>", "job id to parse")
    .option("--all", "parse all unparsed jobs")
    .option("--limit <limit>", "maximum unparsed jobs to parse")
    .action(async (options: ParseCommandOptions) => {
      const useCase = createUseCase();
      const result = await useCase.execute(toParseRequest(options));
      displayParseResult(result);
    });
}

function createDefaultParseUseCase(): ParseJobUseCase {
  const parsingService = new JobParsingService(
    new HtmlCleaner(),
    new SectionExtractor(),
    new SkillExtractor(),
    new SalaryParser(),
    new SeniorityExtractor()
  );

  return new ParseJobUseCase(
    new SupabaseJobRepository(),
    new SupabaseParsedJobProfileRepository(),
    parsingService
  );
}

function toParseRequest(options: ParseCommandOptions) {
  if (options.all) {
    return {
      all: true as const,
      ...(options.limit ? { limit: Number(options.limit) } : {})
    };
  }

  if (!options.jobId) {
    throw new Error("Parse requires --job-id <jobId> or --all");
  }

  return {
    jobId: options.jobId
  };
}

function displayParseResult(result: ParseJobResult): void {
  console.log(`Parsed ${result.parsedCount} job(s)`);

  for (const profile of result.parsedProfiles) {
    console.log(`${profile.jobId} ${profile.seniority} ${profile.requiredSkills.length} required skill(s)`);
  }
}
