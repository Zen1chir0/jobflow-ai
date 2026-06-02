import type { ExecutionLog } from "../domain/observability/observability.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { ObservabilityService } from "../services/observability/observability.service.js";

export type GetExecutionLogsRequest = {
  executionId: string;
};

export type GetExecutionLogsResult = {
  logs: ExecutionLog[];
};

export class GetExecutionLogsUseCase {
  constructor(private readonly observabilityService: ObservabilityService) {}

  async execute(request: GetExecutionLogsRequest): Promise<GetExecutionLogsResult> {
    if (!request.executionId) {
      throw new ApplicationError("INVALID_OBSERVABILITY_REQUEST", "Execution logs require an execution id");
    }

    return {
      logs: await this.observabilityService.getExecutionLogs(request.executionId)
    };
  }
}
