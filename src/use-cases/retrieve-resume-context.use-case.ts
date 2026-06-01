import { ApplicationError } from "../domain/errors/application-error.js";
import type { RetrievedResumeContext } from "../domain/resumes/resume-fragment.types.js";
import type { ParsedJobProfileRepository } from "../repositories/parsed-job-profile.repository.js";
import type { ResumeIntelligenceService } from "../services/resume-intelligence/resume-intelligence.service.js";

export type RetrieveResumeContextRequest = {
  jobId: string;
  topK?: number;
  threshold?: number;
};

export type RetrieveResumeContextResult = RetrievedResumeContext;

export class RetrieveResumeContextUseCase {
  constructor(
    private readonly parsedJobProfileRepository: ParsedJobProfileRepository,
    private readonly resumeIntelligenceService: ResumeIntelligenceService
  ) {}

  async execute(request: RetrieveResumeContextRequest): Promise<RetrieveResumeContextResult> {
    if (!request.jobId) {
      throw new ApplicationError("INVALID_RESUME_INTELLIGENCE_REQUEST", "Resume context retrieval requires a job id");
    }

    const parsedJobProfile = await this.parsedJobProfileRepository.findByJobId(request.jobId);

    if (!parsedJobProfile) {
      throw new ApplicationError("PARSED_JOB_PROFILE_NOT_FOUND", "Parsed job profile not found");
    }

    const context = await this.resumeIntelligenceService.retrieveContext(parsedJobProfile, {
      ...(request.topK !== undefined ? { topK: request.topK } : {}),
      ...(request.threshold !== undefined ? { threshold: request.threshold } : {})
    });

    if (context.fragments.length === 0) {
      throw new ApplicationError("RESUME_CONTEXT_NOT_FOUND", "No matching resume fragments found");
    }

    return context;
  }
}
