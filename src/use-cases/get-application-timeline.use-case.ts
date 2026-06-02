import type { ApplicationTimeline } from "../domain/applications/application.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { LifecycleService } from "../services/lifecycle/lifecycle.service.js";

export type GetApplicationTimelineRequest = {
  applicationId: string;
};

export type GetApplicationTimelineResult = {
  timeline: ApplicationTimeline;
};

export class GetApplicationTimelineUseCase {
  constructor(private readonly lifecycleService: LifecycleService) {}

  async execute(request: GetApplicationTimelineRequest): Promise<GetApplicationTimelineResult> {
    if (!request.applicationId) {
      throw new ApplicationError("INVALID_LIFECYCLE_REQUEST", "Application timeline requires an application id");
    }

    return {
      timeline: await this.lifecycleService.getTimeline(request.applicationId)
    };
  }
}
