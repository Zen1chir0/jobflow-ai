import { createExecutionId } from "../domain/observability/execution-id.js";
import type { ExecutionLog, ExecutionServiceName } from "../domain/observability/observability.types.js";
import type { ObservabilityService } from "../services/observability/observability.service.js";

export type RecordFailureRequest = {
  service: ExecutionServiceName;
  step: string;
  error: unknown;
  executionId?: string;
  metadata?: Record<string, unknown>;
  jobId?: string;
  applicationId?: string;
  atsType?: string;
};

export type RecordFailureResult = {
  executionId: string;
  log: ExecutionLog;
};

export class RecordFailureUseCase {
  constructor(
    private readonly observabilityService: ObservabilityService,
    private readonly executionIdFactory: () => string = createExecutionId
  ) {}

  async execute(request: RecordFailureRequest): Promise<RecordFailureResult> {
    const executionId = request.executionId ?? this.executionIdFactory();
    const log = await this.observabilityService.recordFailure({
      executionId,
      service: request.service,
      step: request.step,
      error: request.error,
      ...(request.metadata ? { metadata: request.metadata } : {}),
      ...(request.jobId ? { jobId: request.jobId } : {}),
      ...(request.applicationId ? { applicationId: request.applicationId } : {}),
      ...(request.atsType ? { atsType: request.atsType } : {})
    });

    return { executionId, log };
  }
}
