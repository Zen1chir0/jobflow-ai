import { Command } from "commander";

import type { ApplicationEvent, ApplicationState } from "../../domain/applications/application.types.js";
import { SupabaseApplicationEventRepository } from "../../repositories/application-event.repository.js";
import { SupabaseApplicationRepository } from "../../repositories/application.repository.js";
import { LifecycleService } from "../../services/lifecycle/lifecycle.service.js";
import { CreateApplicationUseCase, type CreateApplicationResult } from "../../use-cases/create-application.use-case.js";
import {
  GetApplicationTimelineUseCase,
  type GetApplicationTimelineResult
} from "../../use-cases/get-application-timeline.use-case.js";
import {
  TransitionApplicationStateUseCase,
  type TransitionApplicationStateResult
} from "../../use-cases/transition-application-state.use-case.js";

type CreateOptions = {
  jobId: string;
  selectedResumeId?: string;
  applicationUrl?: string;
  atsType?: string;
  notes?: string;
  executionId?: string;
};

type TransitionOptions = {
  applicationId: string;
  to: ApplicationState;
  executionId?: string;
  reason?: string;
};

type TimelineOptions = {
  applicationId: string;
};

type LifecycleUseCaseFactory = () => {
  createApplicationUseCase: CreateApplicationUseCase;
  transitionApplicationStateUseCase: TransitionApplicationStateUseCase;
  getApplicationTimelineUseCase: GetApplicationTimelineUseCase;
};

export function createLifecycleCommand(createUseCases: LifecycleUseCaseFactory = createDefaultUseCases): Command {
  const lifecycle = new Command("lifecycle").description("Manage application lifecycle state and timeline");

  lifecycle
    .command("create")
    .description("Create an application lifecycle snapshot")
    .requiredOption("--job-id <jobId>", "job id")
    .option("--selected-resume-id <selectedResumeId>", "selected generated resume id")
    .option("--application-url <applicationUrl>", "application URL")
    .option("--ats-type <atsType>", "ATS type")
    .option("--notes <notes>", "safe lifecycle notes")
    .option("--execution-id <executionId>", "execution id")
    .action(async (options: CreateOptions) => {
      const result = await createUseCases().createApplicationUseCase.execute(options);
      displayCreateResult(result);
    });

  lifecycle
    .command("transition")
    .description("Transition an application to a new lifecycle state")
    .requiredOption("--application-id <applicationId>", "application id")
    .requiredOption("--to <state>", "target lifecycle state")
    .option("--execution-id <executionId>", "execution id")
    .option("--reason <reason>", "manual override reason")
    .action(async (options: TransitionOptions) => {
      const result = await createUseCases().transitionApplicationStateUseCase.execute({
        applicationId: options.applicationId,
        toState: options.to,
        ...(options.executionId ? { executionId: options.executionId } : {}),
        ...(options.reason ? { manualOverrideReason: options.reason } : {})
      });
      displayTransitionResult(result);
    });

  lifecycle
    .command("timeline")
    .description("Show application lifecycle event timeline")
    .requiredOption("--application-id <applicationId>", "application id")
    .action(async (options: TimelineOptions) => {
      const result = await createUseCases().getApplicationTimelineUseCase.execute(options);
      displayTimelineResult(result);
    });

  return lifecycle;
}

function createDefaultUseCases(): ReturnType<LifecycleUseCaseFactory> {
  const lifecycleService = new LifecycleService(
    new SupabaseApplicationRepository(),
    new SupabaseApplicationEventRepository()
  );

  return {
    createApplicationUseCase: new CreateApplicationUseCase(lifecycleService),
    transitionApplicationStateUseCase: new TransitionApplicationStateUseCase(lifecycleService),
    getApplicationTimelineUseCase: new GetApplicationTimelineUseCase(lifecycleService)
  };
}

function displayCreateResult(result: CreateApplicationResult): void {
  console.log(`Created application ${result.application.id}`);
  console.log(`State ${result.application.currentState}`);
}

function displayTransitionResult(result: TransitionApplicationStateResult): void {
  console.log(`Transitioned application ${result.application.id}`);
  console.log(`State ${result.application.currentState}`);
  console.log(`Event ${result.event.id}`);
}

function displayTimelineResult(result: GetApplicationTimelineResult): void {
  console.log(`Application ${result.timeline.application.id}`);
  console.log(`Current state ${result.timeline.application.currentState}`);
  console.log(`Reconstructed state ${result.timeline.reconstructedState}`);

  for (const event of result.timeline.events) {
    console.log(formatEvent(event));
  }
}

function formatEvent(event: ApplicationEvent): string {
  const fromState = event.fromState ?? "START";
  return `${event.createdAt} ${event.eventType} ${fromState} -> ${event.toState}`;
}
