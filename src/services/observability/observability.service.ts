import type {
  AutomationCheckpoint,
  ExecutionLog,
  ExecutionLogStatus,
  ExecutionServiceName,
  NewAutomationCheckpoint,
} from "../../domain/observability/observability.types.js";
import type { ExecutionLogRepository } from "../../repositories/execution-log.repository.js";
import type { AutomationCheckpointRepository } from "../../repositories/automation-checkpoint.repository.js";
import { ApplicationError } from "../../domain/errors/application-error.js";
import { CheckpointNormalizer } from "./checkpoint-normalizer.js";
import { FailureContextNormalizer, sanitizeMetadata } from "./failure-context-normalizer.js";

export type RecordExecutionLogRequest = {
  executionId: string;
  service: ExecutionServiceName;
  step: string;
  status: ExecutionLogStatus;
  metadata?: Record<string, unknown>;
  jobId?: string;
  applicationId?: string;
  atsType?: string;
};

export type RecordFailureRequest = {
  executionId: string;
  service: ExecutionServiceName;
  step: string;
  error: unknown;
  metadata?: Record<string, unknown>;
  jobId?: string;
  applicationId?: string;
  atsType?: string;
};

export type RecordCheckpointRequest = NewAutomationCheckpoint;

export class ObservabilityService {
  constructor(
    private readonly executionLogRepository: ExecutionLogRepository,
    private readonly automationCheckpointRepository: AutomationCheckpointRepository,
    private readonly failureContextNormalizer = new FailureContextNormalizer(),
    private readonly checkpointNormalizer = new CheckpointNormalizer()
  ) {}

  async recordExecutionLog(request: RecordExecutionLogRequest): Promise<ExecutionLog> {
    validateBaseRequest(request.executionId, request.service, request.step);

    return this.executionLogRepository.create({
      executionId: request.executionId,
      service: request.service,
      step: request.step,
      status: request.status,
      metadata: sanitizeMetadata(request.metadata ?? {}),
      ...(request.jobId ? { jobId: request.jobId } : {}),
      ...(request.applicationId ? { applicationId: request.applicationId } : {}),
      ...(request.atsType ? { atsType: request.atsType } : {})
    });
  }

  async recordFailure(request: RecordFailureRequest): Promise<ExecutionLog> {
    validateBaseRequest(request.executionId, request.service, request.step);

    const normalized = this.failureContextNormalizer.normalize({
      error: request.error,
      ...(request.metadata ? { metadata: request.metadata } : {})
    });

    return this.executionLogRepository.create({
      executionId: request.executionId,
      service: request.service,
      step: request.step,
      status: "failed",
      errorMessage: normalized.errorMessage,
      metadata: normalized.metadata,
      ...(normalized.errorStack ? { errorStack: normalized.errorStack } : {}),
      ...(request.jobId ? { jobId: request.jobId } : {}),
      ...(request.applicationId ? { applicationId: request.applicationId } : {}),
      ...(request.atsType ? { atsType: request.atsType } : {})
    });
  }

  async recordCheckpoint(request: RecordCheckpointRequest): Promise<AutomationCheckpoint> {
    if (!request.applicationId || !request.executionId || !request.atsType || !request.currentStep) {
      throw new ApplicationError("INVALID_OBSERVABILITY_REQUEST", "Checkpoint requires application, execution, ATS, and step");
    }

    return this.automationCheckpointRepository.create({
      applicationId: request.applicationId,
      executionId: request.executionId,
      atsType: request.atsType,
      currentStep: request.currentStep,
      checkpointData: this.checkpointNormalizer.normalize(request.checkpointData),
      isCompleted: request.isCompleted ?? false
    });
  }

  async getExecutionLogs(executionId: string): Promise<ExecutionLog[]> {
    if (!executionId) {
      throw new ApplicationError("INVALID_OBSERVABILITY_REQUEST", "Execution log lookup requires an execution id");
    }

    return this.executionLogRepository.findByExecutionId(executionId);
  }
}

function validateBaseRequest(executionId: string, service: string, step: string): void {
  if (!executionId || !service || !step) {
    throw new ApplicationError("INVALID_OBSERVABILITY_REQUEST", "Execution log requires execution id, service, and step");
  }
}
