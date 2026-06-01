import { Command } from "commander";

import { OpenAICompatibleEmbeddingProvider } from "../../integrations/embeddings/openai-compatible-embedding.provider.js";
import { OpenAICompatibleGenerationProvider } from "../../integrations/generation/openai-compatible-generation.provider.js";
import { SupabaseGeneratedDocumentRepository } from "../../repositories/generated-document.repository.js";
import { SupabaseJobRepository } from "../../repositories/job.repository.js";
import { SupabaseJobMatchScoreRepository } from "../../repositories/job-match-score.repository.js";
import { SupabaseParsedJobProfileRepository } from "../../repositories/parsed-job-profile.repository.js";
import { SupabaseResumeFragmentRepository } from "../../repositories/resume-fragment.repository.js";
import { SupabaseUserProfileRepository } from "../../repositories/user-profile.repository.js";
import { DocumentGenerationService } from "../../services/document-generation/document-generation.service.js";
import { ResumeIntelligenceService } from "../../services/resume-intelligence/resume-intelligence.service.js";
import type { GenerateDocumentResult, GenerateDocumentUseCase } from "../../use-cases/generate-document.use-case.js";
import { GenerateCoverLetterUseCase } from "../../use-cases/generate-cover-letter.use-case.js";
import { GenerateRecruiterMessageUseCase } from "../../use-cases/generate-recruiter-message.use-case.js";
import { GenerateResumeJsonUseCase } from "../../use-cases/generate-resume-json.use-case.js";
import { GenerateScreeningResponseUseCase } from "../../use-cases/generate-screening-response.use-case.js";

type GenerateOptions = {
  jobId: string;
  topK?: string;
  threshold?: string;
  question?: string;
};

type GenerateUseCaseFactory = () => GenerateDocumentUseCase;

export function createGenerateCommand(
  factories: {
    resume?: GenerateUseCaseFactory;
    coverLetter?: GenerateUseCaseFactory;
    recruiterMessage?: GenerateUseCaseFactory;
    screeningResponse?: GenerateUseCaseFactory;
  } = {}
): Command {
  const command = new Command("generate").description("Generate structured application artifacts");

  command
    .command("resume")
    .description("Generate structured resume JSON")
    .requiredOption("--job-id <jobId>", "job id")
    .option("--top-k <topK>", "maximum fragments to retrieve")
    .option("--threshold <threshold>", "minimum similarity threshold")
    .action(async (options: GenerateOptions) => {
      displayGenerateResult(await (factories.resume ?? createDefaultResumeUseCase)().execute(toRequest(options)));
    });

  command
    .command("cover-letter")
    .description("Generate a structured cover letter draft")
    .requiredOption("--job-id <jobId>", "job id")
    .option("--top-k <topK>", "maximum fragments to retrieve")
    .option("--threshold <threshold>", "minimum similarity threshold")
    .action(async (options: GenerateOptions) => {
      displayGenerateResult(await (factories.coverLetter ?? createDefaultCoverLetterUseCase)().execute(toRequest(options)));
    });

  command
    .command("recruiter-message")
    .description("Generate a structured recruiter message draft")
    .requiredOption("--job-id <jobId>", "job id")
    .option("--top-k <topK>", "maximum fragments to retrieve")
    .option("--threshold <threshold>", "minimum similarity threshold")
    .action(async (options: GenerateOptions) => {
      displayGenerateResult(
        await (factories.recruiterMessage ?? createDefaultRecruiterMessageUseCase)().execute(toRequest(options))
      );
    });

  command
    .command("screening-response")
    .description("Generate a structured screening response draft")
    .requiredOption("--job-id <jobId>", "job id")
    .requiredOption("--question <question>", "screening question")
    .option("--top-k <topK>", "maximum fragments to retrieve")
    .option("--threshold <threshold>", "minimum similarity threshold")
    .action(async (options: GenerateOptions) => {
      displayGenerateResult(
        await (factories.screeningResponse ?? createDefaultScreeningResponseUseCase)().execute(toRequest(options))
      );
    });

  return command;
}

function toRequest(options: GenerateOptions) {
  return {
    jobId: options.jobId,
    ...(options.topK ? { topK: Number(options.topK) } : {}),
    ...(options.threshold ? { threshold: Number(options.threshold) } : {}),
    ...(options.question ? { screeningQuestion: options.question } : {})
  };
}

function createDefaultResumeUseCase(): GenerateResumeJsonUseCase {
  return new GenerateResumeJsonUseCase(...buildDependencies());
}

function createDefaultCoverLetterUseCase(): GenerateCoverLetterUseCase {
  return new GenerateCoverLetterUseCase(...buildDependencies());
}

function createDefaultRecruiterMessageUseCase(): GenerateRecruiterMessageUseCase {
  return new GenerateRecruiterMessageUseCase(...buildDependencies());
}

function createDefaultScreeningResponseUseCase(): GenerateScreeningResponseUseCase {
  return new GenerateScreeningResponseUseCase(...buildDependencies());
}

function buildDependencies() {
  const resumeFragmentRepository = new SupabaseResumeFragmentRepository();
  const resumeIntelligenceService = new ResumeIntelligenceService(
    resumeFragmentRepository,
    new OpenAICompatibleEmbeddingProvider()
  );
  const documentGenerationService = new DocumentGenerationService(new OpenAICompatibleGenerationProvider());

  return [
    new SupabaseJobRepository(),
    new SupabaseParsedJobProfileRepository(),
    new SupabaseJobMatchScoreRepository(),
    new SupabaseUserProfileRepository(),
    resumeIntelligenceService,
    documentGenerationService,
    new SupabaseGeneratedDocumentRepository()
  ] as const;
}

function displayGenerateResult(result: GenerateDocumentResult): void {
  console.log(`Generated ${result.document.documentType} ${result.document.id}`);
  console.log(`Stored ${result.document.contextFragmentIds.length} evidence fragment(s)`);
}

