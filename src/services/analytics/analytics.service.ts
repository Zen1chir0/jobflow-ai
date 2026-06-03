import type {
  ApplicationFunnelAnalytics,
  ATSReliabilityAnalytics,
  ExecutionAnalytics,
  JobPipelineAnalytics,
  LifecycleAnalytics,
  PlatformAnalyticsSummary
} from "../../domain/analytics/analytics.types.js";
import type { AnalyticsRepository } from "../../repositories/analytics.repository.js";
import { ATSReliabilityAnalyticsCalculator } from "./ats-reliability-analytics.calculator.js";
import { ExecutionAnalyticsCalculator } from "./execution-analytics.calculator.js";
import { FunnelAnalyticsCalculator } from "./funnel-analytics.calculator.js";
import { JobPipelineAnalyticsCalculator } from "./job-pipeline-analytics.calculator.js";
import { LifecycleAnalyticsCalculator } from "./lifecycle-analytics.calculator.js";

export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly funnelCalculator = new FunnelAnalyticsCalculator(),
    private readonly lifecycleCalculator = new LifecycleAnalyticsCalculator(),
    private readonly executionCalculator = new ExecutionAnalyticsCalculator(),
    private readonly atsReliabilityCalculator = new ATSReliabilityAnalyticsCalculator(),
    private readonly jobPipelineCalculator = new JobPipelineAnalyticsCalculator()
  ) {}

  async getFunnelAnalytics(): Promise<ApplicationFunnelAnalytics> {
    const dataset = await this.analyticsRepository.getDataset();
    return this.funnelCalculator.calculate(dataset);
  }

  async getLifecycleAnalytics(): Promise<LifecycleAnalytics> {
    const dataset = await this.analyticsRepository.getDataset();
    return this.lifecycleCalculator.calculate(dataset);
  }

  async getExecutionAnalytics(): Promise<ExecutionAnalytics> {
    const dataset = await this.analyticsRepository.getDataset();
    return this.executionCalculator.calculate(dataset.executionLogs);
  }

  async getATSReliabilityAnalytics(): Promise<ATSReliabilityAnalytics> {
    const dataset = await this.analyticsRepository.getDataset();
    return this.atsReliabilityCalculator.calculate(dataset);
  }

  async getJobPipelineAnalytics(): Promise<JobPipelineAnalytics> {
    const dataset = await this.analyticsRepository.getDataset();
    return this.jobPipelineCalculator.calculate(dataset);
  }

  async getPlatformSummary(): Promise<PlatformAnalyticsSummary> {
    const dataset = await this.analyticsRepository.getDataset();

    return {
      funnel: this.funnelCalculator.calculate(dataset),
      lifecycle: this.lifecycleCalculator.calculate(dataset),
      executions: this.executionCalculator.calculate(dataset.executionLogs),
      atsReliability: this.atsReliabilityCalculator.calculate(dataset),
      jobPipeline: this.jobPipelineCalculator.calculate(dataset)
    };
  }
}
