import type { GeneratedDocumentRepository } from "../repositories/generated-document.repository.js";
import type { JobRepository } from "../repositories/job.repository.js";
import type { JobMatchScoreRepository } from "../repositories/job-match-score.repository.js";
import type { ParsedJobProfileRepository } from "../repositories/parsed-job-profile.repository.js";
import type { UserProfileRepository } from "../repositories/user-profile.repository.js";
import type { DocumentGenerationService } from "../services/document-generation/document-generation.service.js";
import type { ResumeIntelligenceService } from "../services/resume-intelligence/resume-intelligence.service.js";
import { GenerateDocumentUseCase } from "./generate-document.use-case.js";

export class GenerateResumeJsonUseCase extends GenerateDocumentUseCase {
  constructor(
    jobRepository: JobRepository,
    parsedJobProfileRepository: ParsedJobProfileRepository,
    jobMatchScoreRepository: JobMatchScoreRepository,
    userProfileRepository: UserProfileRepository,
    resumeIntelligenceService: ResumeIntelligenceService,
    documentGenerationService: DocumentGenerationService,
    generatedDocumentRepository: GeneratedDocumentRepository
  ) {
    super(
      "resume_json",
      jobRepository,
      parsedJobProfileRepository,
      jobMatchScoreRepository,
      userProfileRepository,
      resumeIntelligenceService,
      documentGenerationService,
      generatedDocumentRepository
    );
  }
}

