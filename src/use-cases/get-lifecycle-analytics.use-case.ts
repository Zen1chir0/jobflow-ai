import type { LifecycleAnalytics } from "../domain/analytics/analytics.types.js";
import type { AnalyticsService } from "../services/analytics/analytics.service.js";

export type GetLifecycleAnalyticsResult = {
  lifecycle: LifecycleAnalytics;
};

export class GetLifecycleAnalyticsUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(): Promise<GetLifecycleAnalyticsResult> {
    return {
      lifecycle: await this.analyticsService.getLifecycleAnalytics()
    };
  }
}
