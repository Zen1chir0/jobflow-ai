import type { JobPipelineAnalytics } from "../domain/analytics/analytics.types.js";
import type { AnalyticsService } from "../services/analytics/analytics.service.js";

export type GetJobPipelineAnalyticsResult = {
  jobPipeline: JobPipelineAnalytics;
};

export class GetJobPipelineAnalyticsUseCase {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async execute(): Promise<GetJobPipelineAnalyticsResult> {
    return {
      jobPipeline: await this.analyticsService.getJobPipelineAnalytics()
    };
  }
}
