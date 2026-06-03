import { Command } from "commander";

import { SupabaseAnalyticsRepository } from "../../repositories/analytics.repository.js";
import { AnalyticsService } from "../../services/analytics/analytics.service.js";
import {
  GetApplicationFunnelAnalyticsUseCase,
  type GetApplicationFunnelAnalyticsResult
} from "../../use-cases/get-application-funnel-analytics.use-case.js";
import {
  GetATSReliabilityAnalyticsUseCase,
  type GetATSReliabilityAnalyticsResult
} from "../../use-cases/get-ats-reliability-analytics.use-case.js";
import {
  GetExecutionAnalyticsUseCase,
  type GetExecutionAnalyticsResult
} from "../../use-cases/get-execution-analytics.use-case.js";
import {
  GetJobPipelineAnalyticsUseCase,
  type GetJobPipelineAnalyticsResult
} from "../../use-cases/get-job-pipeline-analytics.use-case.js";
import {
  GetLifecycleAnalyticsUseCase,
  type GetLifecycleAnalyticsResult
} from "../../use-cases/get-lifecycle-analytics.use-case.js";
import {
  GetPlatformAnalyticsSummaryUseCase,
  type GetPlatformAnalyticsSummaryResult
} from "../../use-cases/get-platform-analytics-summary.use-case.js";

type AnalyticsUseCaseFactory = () => {
  getApplicationFunnelAnalyticsUseCase: GetApplicationFunnelAnalyticsUseCase;
  getLifecycleAnalyticsUseCase: GetLifecycleAnalyticsUseCase;
  getExecutionAnalyticsUseCase: GetExecutionAnalyticsUseCase;
  getATSReliabilityAnalyticsUseCase: GetATSReliabilityAnalyticsUseCase;
  getJobPipelineAnalyticsUseCase: GetJobPipelineAnalyticsUseCase;
  getPlatformAnalyticsSummaryUseCase: GetPlatformAnalyticsSummaryUseCase;
};

export function createAnalyticsCommand(createUseCases: AnalyticsUseCaseFactory = createDefaultUseCases): Command {
  const analytics = new Command("analytics").description("Show read-only platform analytics summaries");

  analytics.command("summary").description("Show platform analytics summary").action(async () => {
    displaySummary(await createUseCases().getPlatformAnalyticsSummaryUseCase.execute());
  });

  analytics.command("funnel").description("Show application funnel analytics").action(async () => {
    displayFunnel(await createUseCases().getApplicationFunnelAnalyticsUseCase.execute());
  });

  analytics.command("lifecycle").description("Show lifecycle analytics").action(async () => {
    displayLifecycle(await createUseCases().getLifecycleAnalyticsUseCase.execute());
  });

  analytics.command("executions").description("Show execution analytics").action(async () => {
    displayExecutions(await createUseCases().getExecutionAnalyticsUseCase.execute());
  });

  analytics.command("ats").description("Show ATS reliability analytics").action(async () => {
    displayATSReliability(await createUseCases().getATSReliabilityAnalyticsUseCase.execute());
  });

  analytics.command("pipeline").description("Show job pipeline analytics").action(async () => {
    displayJobPipeline(await createUseCases().getJobPipelineAnalyticsUseCase.execute());
  });

  return analytics;
}

function createDefaultUseCases(): ReturnType<AnalyticsUseCaseFactory> {
  const analyticsService = new AnalyticsService(new SupabaseAnalyticsRepository());

  return {
    getApplicationFunnelAnalyticsUseCase: new GetApplicationFunnelAnalyticsUseCase(analyticsService),
    getLifecycleAnalyticsUseCase: new GetLifecycleAnalyticsUseCase(analyticsService),
    getExecutionAnalyticsUseCase: new GetExecutionAnalyticsUseCase(analyticsService),
    getATSReliabilityAnalyticsUseCase: new GetATSReliabilityAnalyticsUseCase(analyticsService),
    getJobPipelineAnalyticsUseCase: new GetJobPipelineAnalyticsUseCase(analyticsService),
    getPlatformAnalyticsSummaryUseCase: new GetPlatformAnalyticsSummaryUseCase(analyticsService)
  };
}

function displaySummary(result: GetPlatformAnalyticsSummaryResult): void {
  console.log("Platform analytics summary");
  console.log(`Applications ${result.summary.lifecycle.totalApplications}`);
  console.log(`Jobs discovered ${result.summary.jobPipeline.jobsDiscovered}`);
  console.log(`Execution records ${result.summary.executions.totalLogRecords}`);
  console.log(`ATS checkpoints ${result.summary.atsReliability.checkpointCount}`);
}

function displayFunnel(result: GetApplicationFunnelAnalyticsResult): void {
  console.log(`Funnel applications ${result.funnel.totalApplications}`);

  for (const step of result.funnel.steps) {
    console.log(`${step.fromState} -> ${step.toState}: ${step.conversionRate}% conversion`);
  }
}

function displayLifecycle(result: GetLifecycleAnalyticsResult): void {
  console.log(`Lifecycle applications ${result.lifecycle.totalApplications}`);
  console.log(`Hired ${result.lifecycle.hiredCount}`);
  console.log(`Rejected ${result.lifecycle.rejectedCount}`);
  console.log(`Withdrawn ${result.lifecycle.withdrawnCount}`);
}

function displayExecutions(result: GetExecutionAnalyticsResult): void {
  console.log(`Execution records ${result.executions.totalLogRecords}`);
  console.log(`Tracked executions ${result.executions.trackedExecutionCount}`);
  console.log(`Success rate ${result.executions.successRate}%`);
  console.log(`Failure rate ${result.executions.failureRate}%`);
  console.log(`Unknown coverage ${result.executions.coverage.unknownCoverage ? "yes" : "no"}`);
}

function displayATSReliability(result: GetATSReliabilityAnalyticsResult): void {
  console.log(`ATS checkpoints ${result.atsReliability.checkpointCount}`);
  console.log(`Completed checkpoints ${result.atsReliability.completedCheckpointCount}`);
  console.log(`ATS failures ${result.atsReliability.failureCount}`);
}

function displayJobPipeline(result: GetJobPipelineAnalyticsResult): void {
  console.log(`Jobs discovered ${result.jobPipeline.jobsDiscovered}`);
  console.log(`Jobs parsed ${result.jobPipeline.jobsParsed}`);
  console.log(`Jobs scored ${result.jobPipeline.jobsScored}`);
  console.log(`Generated documents ${result.jobPipeline.generatedDocuments}`);
  console.log(`Rendered resumes ${result.jobPipeline.generatedResumes}`);
}
