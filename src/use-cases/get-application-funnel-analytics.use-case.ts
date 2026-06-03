import type { ApplicationFunnelAnalytics } from "../domain/analytics/analytics.types.js";
import type { AnalyticsService } from "../services/analytics/analytics.service.js";

export type GetApplicationFunnelAnalyticsResult = {
  funnel: ApplicationFunnelAnalytics;
};

export class GetApplicationFunnelAnalyticsUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(): Promise<GetApplicationFunnelAnalyticsResult> {
    return {
      funnel: await this.analyticsService.getFunnelAnalytics()
    };
  }
}
