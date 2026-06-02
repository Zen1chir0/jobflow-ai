import { createExecutionId } from "../domain/observability/execution-id.js";
import type { ExecutionLog, ExecutionLogStatus, ExecutionServiceName } from "../domain/observability/observability.types.js";
import type { ObservabilityService } from "../services/observability/observability.service.js";

export type RecordExecutionLogRequest = {
  service: ExecutionServiceName;
  step: string;
  status: ExecutionLogStatus;
  executionId?: string;
  metadata?: Record<string, unknown>;
  jobId?: string;
  applicationId?: string;
  atsType?: string;
};

export type RecordExecutionLogResult = {
  executionId: string;
  log: ExecutionLog;
};

export class RecordExecutionLogUseCase {
  constructor(
    private readonly observabilityService: ObservabilityService,
    private readonly executionIdFactory: () => string = createExecutionId
  ) {}

  async execute(request: RecordExecutionLogRequest): Promise<RecordExecutionLogResult> {
    const executionId = request.executionId ?? this.executionIdFactory();
    const log = await this.observabilityService.recordExecutionLog({
      executionId,
      service: request.service,
      step: request.step,
      status: request.status,
      ...(request.metadata ? { metadata: request.metadata } : {}),
      ...(request.jobId ? { jobId: request.jobId } : {}),
      ...(request.applicationId ? { applicationId: request.applicationId } : {}),
      ...(request.atsType ? { atsType: request.atsType } : {})
    });

    return { executionId, log };
  }
}
