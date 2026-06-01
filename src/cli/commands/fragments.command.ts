import { Command } from "commander";

import type { ResumeFragmentType } from "../../domain/resumes/resume-fragment.types.js";
import { OpenAICompatibleEmbeddingProvider } from "../../integrations/embeddings/openai-compatible-embedding.provider.js";
import { SupabaseParsedJobProfileRepository } from "../../repositories/parsed-job-profile.repository.js";
import { SupabaseResumeFragmentRepository } from "../../repositories/resume-fragment.repository.js";
import { SupabaseUserProfileRepository } from "../../repositories/user-profile.repository.js";
import { ResumeIntelligenceService } from "../../services/resume-intelligence/resume-intelligence.service.js";
import {
  CreateResumeFragmentUseCase,
  type CreateResumeFragmentResult
} from "../../use-cases/create-resume-fragment.use-case.js";
import {
  RetrieveResumeContextUseCase,
  type RetrieveResumeContextResult
} from "../../use-cases/retrieve-resume-context.use-case.js";

type AddFragmentOptions = {
  type: ResumeFragmentType;
  text: string;
  sourceLabel?: string;
  userProfileId?: string;
};

type ContextOptions = {
  jobId: string;
  topK?: string;
  threshold?: string;
};

type CreateFragmentUseCaseFactory = () => CreateResumeFragmentUseCase;
type RetrieveContextUseCaseFactory = () => RetrieveResumeContextUseCase;

export function createFragmentsCommand(
  createFragmentUseCase: CreateFragmentUseCaseFactory = createDefaultCreateFragmentUseCase,
  createRetrieveContextUseCase: RetrieveContextUseCaseFactory = createDefaultRetrieveContextUseCase
): Command {
  const command = new Command("fragments").description("Manage and retrieve atomic resume intelligence fragments");

  command
    .command("add")
    .description("Create one atomic resume fragment")
    .requiredOption("--type <type>", "fragment type")
    .requiredOption("--text <text>", "atomic fragment text")
    .option("--source-label <sourceLabel>", "source label for traceability")
    .option("--user-profile-id <userProfileId>", "user profile id; defaults to the first profile")
    .action(async (options: AddFragmentOptions) => {
      const result = await createFragmentUseCase().execute({
        fragmentText: options.text,
        fragmentType: options.type,
        ...(options.sourceLabel ? { sourceLabel: options.sourceLabel } : {}),
        ...(options.userProfileId ? { userProfileId: options.userProfileId } : {})
      });
      displayCreateFragmentResult(result);
    });

  command
    .command("context")
    .description("Retrieve prompt-ready resume context for a parsed job")
    .requiredOption("--job-id <jobId>", "parsed job id")
    .option("--top-k <topK>", "maximum fragments to retrieve")
    .option("--threshold <threshold>", "minimum similarity threshold")
    .action(async (options: ContextOptions) => {
      const result = await createRetrieveContextUseCase().execute({
        jobId: options.jobId,
        ...(options.topK ? { topK: Number(options.topK) } : {}),
        ...(options.threshold ? { threshold: Number(options.threshold) } : {})
      });
      displayRetrieveContextResult(result);
    });

  return command;
}

function createDefaultCreateFragmentUseCase(): CreateResumeFragmentUseCase {
  const resumeFragmentRepository = new SupabaseResumeFragmentRepository();
  const resumeIntelligenceService = new ResumeIntelligenceService(
    resumeFragmentRepository,
    new OpenAICompatibleEmbeddingProvider()
  );

  return new CreateResumeFragmentUseCase(new SupabaseUserProfileRepository(), resumeIntelligenceService);
}

function createDefaultRetrieveContextUseCase(): RetrieveResumeContextUseCase {
  const resumeFragmentRepository = new SupabaseResumeFragmentRepository();
  const resumeIntelligenceService = new ResumeIntelligenceService(
    resumeFragmentRepository,
    new OpenAICompatibleEmbeddingProvider()
  );

  return new RetrieveResumeContextUseCase(new SupabaseParsedJobProfileRepository(), resumeIntelligenceService);
}

function displayCreateFragmentResult(result: CreateResumeFragmentResult): void {
  console.log(`Created fragment ${result.fragment.id}`);
  console.log(`${result.fragment.fragmentType} ${result.fragment.fragmentText.length} character(s)`);
}

function displayRetrieveContextResult(result: RetrieveResumeContextResult): void {
  console.log(`Retrieved ${result.fragments.length} fragment(s)`);
  console.log(result.contextText);
}
