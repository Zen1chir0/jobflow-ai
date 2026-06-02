import { Command } from "commander";

import { SupabaseAutomationCheckpointRepository } from "../../repositories/automation-checkpoint.repository.js";
import { SupabaseExecutionLogRepository } from "../../repositories/execution-log.repository.js";
import { ObservabilityService } from "../../services/observability/observability.service.js";
import {
  GetExecutionLogsUseCase,
  type GetExecutionLogsResult
} from "../../use-cases/get-execution-logs.use-case.js";
import {
  RecordCheckpointUseCase,
  type RecordCheckpointResult
} from "../../use-cases/record-checkpoint.use-case.js";
import {
  RecordExecutionLogUseCase,
  type RecordExecutionLogResult
} from "../../use-cases/record-execution-log.use-case.js";
import { RecordFailureUseCase, type RecordFailureResult } from "../../use-cases/record-failure.use-case.js";
import type {
  ExecutionLogStatus,
  ExecutionServiceName
} from "../../domain/observability/observability.types.js";

type LogsOptions = {
  executionId: string;
};

type RecordLogOptions = {
  service: ExecutionServiceName;
  step: string;
  status: ExecutionLogStatus;
  executionId?: string;
  jobId?: string;
  applicationId?: string;
  atsType?: string;
};

type RecordFailureOptions = {
  service: ExecutionServiceName;
  step: string;
  message: string;
  executionId?: string;
  jobId?: string;
  applicationId?: string;
  atsType?: string;
};

type RecordCheckpointOptions = {
  applicationId: string;
  atsType: string;
  currentStep: string;
  executionId?: string;
  completed?: boolean;
};

type ObservabilityUseCaseFactory = () => {
  getExecutionLogsUseCase: GetExecutionLogsUseCase;
  recordExecutionLogUseCase: RecordExecutionLogUseCase;
  recordFailureUseCase: RecordFailureUseCase;
  recordCheckpointUseCase: RecordCheckpointUseCase;
};

export function createObservabilityCommand(createUseCases: ObservabilityUseCaseFactory = createDefaultUseCases): Command {
  const observability = new Command("observability").description("Inspect and record execution trace data");

  observability
    .command("logs")
    .description("Show execution logs for an execution id")
    .requiredOption("--execution-id <executionId>", "execution id")
    .action(async (options: LogsOptions) => {
      const result = await createUseCases().getExecutionLogsUseCase.execute(options);
      displayLogsResult(result);
    });

  observability
    .command("record-log")
    .description("Record a safe execution log entry")
    .requiredOption("--service <service>", "service name")
    .requiredOption("--step <step>", "execution step")
    .requiredOption("--status <status>", "started, success, failed, or warning")
    .option("--execution-id <executionId>", "execution id")
    .option("--job-id <jobId>", "job id")
    .option("--application-id <applicationId>", "application id")
    .option("--ats-type <atsType>", "ATS type")
    .action(async (options: RecordLogOptions) => {
      const result = await createUseCases().recordExecutionLogUseCase.execute(options);
      displayRecordLogResult(result);
    });

  observability
    .command("record-failure")
    .description("Record a sanitized failure log entry")
    .requiredOption("--service <service>", "service name")
    .requiredOption("--step <step>", "execution step")
    .requiredOption("--message <message>", "safe failure message")
    .option("--execution-id <executionId>", "execution id")
    .option("--job-id <jobId>", "job id")
    .option("--application-id <applicationId>", "application id")
    .option("--ats-type <atsType>", "ATS type")
    .action(async (options: RecordFailureOptions) => {
      const result = await createUseCases().recordFailureUseCase.execute({
        service: options.service,
        step: options.step,
        error: options.message,
        ...(options.executionId ? { executionId: options.executionId } : {}),
        ...(options.jobId ? { jobId: options.jobId } : {}),
        ...(options.applicationId ? { applicationId: options.applicationId } : {}),
        ...(options.atsType ? { atsType: options.atsType } : {})
      });
      displayRecordFailureResult(result);
    });

  observability
    .command("record-checkpoint")
    .description("Record an automation checkpoint reference")
    .requiredOption("--application-id <applicationId>", "application id")
    .requiredOption("--ats-type <atsType>", "ATS type")
    .requiredOption("--current-step <currentStep>", "current automation step")
    .option("--execution-id <executionId>", "execution id")
    .option("--completed", "mark checkpoint as completed")
    .action(async (options: RecordCheckpointOptions) => {
      const result = await createUseCases().recordCheckpointUseCase.execute({
        applicationId: options.applicationId,
        atsType: options.atsType,
        currentStep: options.currentStep,
        ...(options.executionId ? { executionId: options.executionId } : {}),
        ...(options.completed !== undefined ? { isCompleted: options.completed } : {})
      });
      displayRecordCheckpointResult(result);
    });

  return observability;
}

function createDefaultUseCases(): ReturnType<ObservabilityUseCaseFactory> {
  const observabilityService = new ObservabilityService(
    new SupabaseExecutionLogRepository(),
    new SupabaseAutomationCheckpointRepository()
  );

  return {
    getExecutionLogsUseCase: new GetExecutionLogsUseCase(observabilityService),
    recordExecutionLogUseCase: new RecordExecutionLogUseCase(observabilityService),
    recordFailureUseCase: new RecordFailureUseCase(observabilityService),
    recordCheckpointUseCase: new RecordCheckpointUseCase(observabilityService)
  };
}

function displayLogsResult(result: GetExecutionLogsResult): void {
  console.log(`Execution logs ${result.logs.length}`);

  for (const log of result.logs) {
    console.log(`${log.createdAt} ${log.service} ${log.step} ${log.status}`);
  }
}

function displayRecordLogResult(result: RecordExecutionLogResult): void {
  console.log(`Recorded execution log ${result.log.id}`);
  console.log(`Execution ${result.executionId}`);
}

function displayRecordFailureResult(result: RecordFailureResult): void {
  console.log(`Recorded failure log ${result.log.id}`);
  console.log(`Execution ${result.executionId}`);
}

function displayRecordCheckpointResult(result: RecordCheckpointResult): void {
  console.log(`Recorded checkpoint ${result.checkpoint.id}`);
  console.log(`Execution ${result.executionId}`);
}
