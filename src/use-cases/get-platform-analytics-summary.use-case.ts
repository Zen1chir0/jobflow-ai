import type { PlatformAnalyticsSummary } from "../domain/analytics/analytics.types.js";
import type { AnalyticsService } from "../services/analytics/analytics.service.js";

export type GetPlatformAnalyticsSummaryResult = {
  summary: PlatformAnalyticsSummary;
};

export class GetPlatformAnalyticsSummaryUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(): Promise<GetPlatformAnalyticsSummaryResult> {
    return {
      summary: await this.analyticsService.getPlatformSummary()
    };
  }
}
