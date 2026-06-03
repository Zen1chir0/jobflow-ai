import type { ExecutionAnalytics } from "../domain/analytics/analytics.types.js";
import type { AnalyticsService } from "../services/analytics/analytics.service.js";

export type GetExecutionAnalyticsResult = {
  executions: ExecutionAnalytics;
};

export class GetExecutionAnalyticsUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(): Promise<GetExecutionAnalyticsResult> {
    return {
      executions: await this.analyticsService.getExecutionAnalytics()
    };
  }
}
