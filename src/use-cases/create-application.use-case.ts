import type { Application } from "../domain/applications/application.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { LifecycleService } from "../services/lifecycle/lifecycle.service.js";

export type CreateApplicationRequest = {
  jobId: string;
  selectedResumeId?: string;
  applicationUrl?: string;
  atsType?: string;
  notes?: string;
  executionId?: string;
};

export type CreateApplicationResult = {
  application: Application;
};

export class CreateApplicationUseCase {
  constructor(private readonly lifecycleService: LifecycleService) {}

  async execute(request: CreateApplicationRequest): Promise<CreateApplicationResult> {
    if (!request.jobId) {
      throw new ApplicationError("INVALID_LIFECYCLE_REQUEST", "Application creation requires a job id");
    }

    const application = await this.lifecycleService.createApplication({
      jobId: request.jobId,
      ...(request.selectedResumeId ? { selectedResumeId: request.selectedResumeId } : {}),
      ...(request.applicationUrl ? { applicationUrl: request.applicationUrl } : {}),
      ...(request.atsType ? { atsType: request.atsType } : {}),
      ...(request.notes ? { notes: request.notes } : {}),
      ...(request.executionId ? { executionId: request.executionId } : {})
    });

    return { application };
  }
}
