import type { Application, ApplicationEvent, ApplicationState } from "../domain/applications/application.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { LifecycleService } from "../services/lifecycle/lifecycle.service.js";

export type TransitionApplicationStateRequest = {
  applicationId: string;
  toState: ApplicationState;
  executionId?: string;
  metadata?: Record<string, unknown>;
  manualOverrideReason?: string;
};

export type TransitionApplicationStateResult = {
  application: Application;
  event: ApplicationEvent;
};

export class TransitionApplicationStateUseCase {
  constructor(private readonly lifecycleService: LifecycleService) {}

  async execute(request: TransitionApplicationStateRequest): Promise<TransitionApplicationStateResult> {
    if (!request.applicationId) {
      throw new ApplicationError("INVALID_LIFECYCLE_REQUEST", "Application transition requires an application id");
    }

    if (!request.toState) {
      throw new ApplicationError("INVALID_LIFECYCLE_REQUEST", "Application transition requires a target state");
    }

    return this.lifecycleService.transitionApplication(request);
  }
}
