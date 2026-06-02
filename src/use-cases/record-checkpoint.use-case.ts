import { createExecutionId } from "../domain/observability/execution-id.js";
import type { AutomationCheckpoint } from "../domain/observability/observability.types.js";
import type { ObservabilityService } from "../services/observability/observability.service.js";

export type RecordCheckpointRequest = {
  applicationId: string;
  atsType: string;
  currentStep: string;
  executionId?: string;
  checkpointData?: Record<string, unknown>;
  isCompleted?: boolean;
};

export type RecordCheckpointResult = {
  executionId: string;
  checkpoint: AutomationCheckpoint;
};

export class RecordCheckpointUseCase {
  constructor(
    private readonly observabilityService: ObservabilityService,
    private readonly executionIdFactory: () => string = createExecutionId
  ) {}

  async execute(request: RecordCheckpointRequest): Promise<RecordCheckpointResult> {
    const executionId = request.executionId ?? this.executionIdFactory();
    const checkpoint = await this.observabilityService.recordCheckpoint({
      applicationId: request.applicationId,
      executionId,
      atsType: request.atsType,
      currentStep: request.currentStep,
      ...(request.checkpointData ? { checkpointData: request.checkpointData } : {}),
      ...(request.isCompleted !== undefined ? { isCompleted: request.isCompleted } : {})
    });

    return { executionId, checkpoint };
  }
}
