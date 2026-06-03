import type { ATSReliabilityAnalytics } from "../domain/analytics/analytics.types.js";
import type { AnalyticsService } from "../services/analytics/analytics.service.js";

export type GetATSReliabilityAnalyticsResult = {
  atsReliability: ATSReliabilityAnalytics;
};

export class GetATSReliabilityAnalyticsUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(): Promise<GetATSReliabilityAnalyticsResult> {
    return {
      atsReliability: await this.analyticsService.getATSReliabilityAnalytics()
    };
  }
}
