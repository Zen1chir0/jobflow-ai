import type { GeneratedDocument, GeneratedDocumentType } from "../domain/documents/generated-document.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { JobRepository } from "../repositories/job.repository.js";
import type { JobMatchScoreRepository } from "../repositories/job-match-score.repository.js";
import type { ParsedJobProfileRepository } from "../repositories/parsed-job-profile.repository.js";
import type { UserProfileRepository } from "../repositories/user-profile.repository.js";
import type { GeneratedDocumentRepository } from "../repositories/generated-document.repository.js";
import type { ResumeIntelligenceService } from "../services/resume-intelligence/resume-intelligence.service.js";
import type { DocumentGenerationService } from "../services/document-generation/document-generation.service.js";

export type GenerateDocumentRequest = {
  jobId: string;
  topK?: number;
  threshold?: number;
  screeningQuestion?: string;
};

export type GenerateDocumentResult = {
  document: GeneratedDocument;
};

export class GenerateDocumentUseCase {
  constructor(
    private readonly documentType: GeneratedDocumentType,
    private readonly jobRepository: JobRepository,
    private readonly parsedJobProfileRepository: ParsedJobProfileRepository,
    private readonly jobMatchScoreRepository: JobMatchScoreRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly resumeIntelligenceService: ResumeIntelligenceService,
    private readonly documentGenerationService: DocumentGenerationService,
    private readonly generatedDocumentRepository: GeneratedDocumentRepository
  ) {}

  async execute(request: GenerateDocumentRequest): Promise<GenerateDocumentResult> {
    if (!request.jobId) {
      throw new ApplicationError("INVALID_GENERATION_REQUEST", "Document generation requires a job id");
    }

    const [job, parsedJobProfile, matchScore, userProfile] = await Promise.all([
      this.jobRepository.findById(request.jobId),
      this.parsedJobProfileRepository.findByJobId(request.jobId),
      this.jobMatchScoreRepository.findByJobId(request.jobId),
      this.userProfileRepository.findDefault()
    ]);

    if (!job) {
      throw new ApplicationError("JOB_NOT_FOUND", "Job not found");
    }

    if (!parsedJobProfile) {
      throw new ApplicationError("PARSED_JOB_PROFILE_NOT_FOUND", "Parsed job profile not found");
    }

    if (!matchScore) {
      throw new ApplicationError("INVALID_GENERATION_REQUEST", "Match score is required before document generation");
    }

    if (!userProfile) {
      throw new ApplicationError("USER_PROFILE_NOT_FOUND", "Default user profile not found");
    }

    const resumeContext = await this.resumeIntelligenceService.retrieveContext(parsedJobProfile, {
      ...(request.topK !== undefined ? { topK: request.topK } : {}),
      ...(request.threshold !== undefined ? { threshold: request.threshold } : {})
    });

    if (resumeContext.fragments.length === 0) {
      throw new ApplicationError("RESUME_CONTEXT_NOT_FOUND", "No matching resume fragments found");
    }

    const generated = await this.documentGenerationService.generate(this.documentType, {
      job,
      parsedJobProfile,
      matchScore,
      userProfile,
      resumeContext,
      ...(request.screeningQuestion ? { screeningQuestion: request.screeningQuestion } : {})
    });

    const document = await this.generatedDocumentRepository.create({
      jobId: request.jobId,
      documentType: generated.documentType,
      content: generated.content,
      prompt: generated.prompt,
      contextFragmentIds: generated.contextFragmentIds,
      model: generated.model,
      provider: generated.provider
    });

    return { document };
  }
}

