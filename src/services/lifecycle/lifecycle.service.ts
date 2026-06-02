import type {
  Application,
  ApplicationEvent,
  ApplicationEventType,
  ApplicationState,
  ApplicationTimeline,
  NewApplication
} from "../../domain/applications/application.types.js";
import type { ApplicationRepository } from "../../repositories/application.repository.js";
import type { ApplicationEventRepository } from "../../repositories/application-event.repository.js";
import { ApplicationError } from "../../domain/errors/application-error.js";
import { StateTransitionValidator } from "./state-transition.validator.js";
import { ApplicationStateMachine } from "../../domain/applications/application-state-machine.js";

export type CreateLifecycleApplicationRequest = NewApplication;

export type TransitionLifecycleApplicationRequest = {
  applicationId: string;
  toState: ApplicationState;
  executionId?: string;
  metadata?: Record<string, unknown>;
  manualOverrideReason?: string;
};

export class LifecycleService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly applicationEventRepository: ApplicationEventRepository,
    private readonly transitionValidator = new StateTransitionValidator(),
    private readonly stateMachine = new ApplicationStateMachine()
  ) {}

  async createApplication(request: CreateLifecycleApplicationRequest): Promise<Application> {
    const currentState = request.currentState ?? "DISCOVERED";
    const application = await this.applicationRepository.create({
      ...request,
      currentState
    });

    await this.applicationEventRepository.create({
      applicationId: application.id,
      toState: currentState,
      eventType: "APPLICATION_CREATED",
      metadata: {
        jobId: application.jobId,
        ...(request.selectedResumeId ? { selectedResumeId: request.selectedResumeId } : {})
      },
      ...(request.executionId ? { executionId: request.executionId } : {})
    });

    return application;
  }

  async transitionApplication(request: TransitionLifecycleApplicationRequest): Promise<{
    application: Application;
    event: ApplicationEvent;
  }> {
    const application = await this.applicationRepository.findById(request.applicationId);

    if (!application) {
      throw new ApplicationError("APPLICATION_NOT_FOUND", "Application not found");
    }

    this.transitionValidator.validate({
      fromState: application.currentState,
      toState: request.toState,
      ...(request.manualOverrideReason ? { manualOverrideReason: request.manualOverrideReason } : {})
    });

    const eventType: ApplicationEventType = request.manualOverrideReason ? "MANUAL_OVERRIDE" : "STATE_TRANSITION";
    const updatedApplication = await this.applicationRepository.updateState({
      applicationId: application.id,
      toState: request.toState,
      ...(request.executionId ? { executionId: request.executionId } : {})
    });
    const event = await this.applicationEventRepository.create({
      applicationId: application.id,
      fromState: application.currentState,
      toState: request.toState,
      eventType,
      metadata: {
        ...(request.metadata ?? {}),
        ...(request.manualOverrideReason ? { manualOverrideReason: request.manualOverrideReason } : {})
      },
      ...(request.executionId ? { executionId: request.executionId } : {})
    });

    return {
      application: updatedApplication,
      event
    };
  }

  async getTimeline(applicationId: string): Promise<ApplicationTimeline> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new ApplicationError("APPLICATION_NOT_FOUND", "Application not found");
    }

    const events = await this.applicationEventRepository.findByApplicationId(applicationId);

    return {
      application,
      events,
      reconstructedState: this.stateMachine.reconstructState(events)
    };
  }
}
