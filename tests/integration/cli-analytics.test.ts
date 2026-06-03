import { describe, expect, it, vi } from "vitest";

import { createAnalyticsCommand } from "../../src/cli/commands/analytics.command.js";
import type { GetApplicationFunnelAnalyticsUseCase } from "../../src/use-cases/get-application-funnel-analytics.use-case.js";
import type { GetATSReliabilityAnalyticsUseCase } from "../../src/use-cases/get-ats-reliability-analytics.use-case.js";
import type { GetExecutionAnalyticsUseCase } from "../../src/use-cases/get-execution-analytics.use-case.js";
import type { GetJobPipelineAnalyticsUseCase } from "../../src/use-cases/get-job-pipeline-analytics.use-case.js";
import type { GetLifecycleAnalyticsUseCase } from "../../src/use-cases/get-lifecycle-analytics.use-case.js";
import type { GetPlatformAnalyticsSummaryUseCase } from "../../src/use-cases/get-platform-analytics-summary.use-case.js";

describe("analytics command", () => {
  it("parses analytics commands and renders safe aggregate output", async () => {
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createAnalyticsCommand(() => ({
      getApplicationFunnelAnalyticsUseCase: { execute: vi.fn().mockResolvedValue(buildFunnel()) } as unknown as GetApplicationFunnelAnalyticsUseCase,
      getLifecycleAnalyticsUseCase: { execute: vi.fn().mockResolvedValue(buildLifecycle()) } as unknown as GetLifecycleAnalyticsUseCase,
      getExecutionAnalyticsUseCase: { execute: vi.fn().mockResolvedValue(buildExecutions()) } as unknown as GetExecutionAnalyticsUseCase,
      getATSReliabilityAnalyticsUseCase: { execute: vi.fn().mockResolvedValue(buildAts()) } as unknown as GetATSReliabilityAnalyticsUseCase,
      getJobPipelineAnalyticsUseCase: { execute: vi.fn().mockResolvedValue(buildPipeline()) } as unknown as GetJobPipelineAnalyticsUseCase,
      getPlatformAnalyticsSummaryUseCase: { execute: vi.fn().mockResolvedValue(buildSummary()) } as unknown as GetPlatformAnalyticsSummaryUseCase
    }));

    await command.parseAsync(["summary"], { from: "user" });
    await command.parseAsync(["funnel"], { from: "user" });
    await command.parseAsync(["lifecycle"], { from: "user" });
    await command.parseAsync(["executions"], { from: "user" });
    await command.parseAsync(["ats"], { from: "user" });
    await command.parseAsync(["pipeline"], { from: "user" });

    const rendered = output.mock.calls.flat().join("\n");
    expect(rendered).toContain("Platform analytics summary");
    expect(rendered).toContain("Funnel applications 1");
    expect(rendered).toContain("Unknown coverage yes");
    expect(rendered).not.toContain("metadata");
    expect(rendered).not.toContain("token");
    expect(rendered).not.toContain("cookie");
  });
});

function buildFunnel() {
  return {
    funnel: {
      totalApplications: 1,
      steps: [
        {
          fromState: "DISCOVERED",
          toState: "PARSED",
          fromCount: 1,
          toCount: 1,
          transitionCount: 1,
          conversionRate: 100,
          dropOffRate: 0
        }
      ]
    }
  };
}

function buildLifecycle() {
  return {
    lifecycle: {
      totalApplications: 1,
      stateCounts: { HIRED: 1 },
      transitionCounts: { "OFFER->HIRED": 1 },
      hiredCount: 1,
      rejectedCount: 0,
      withdrawnCount: 0
    }
  };
}

function buildExecutions() {
  return {
    executions: {
      totalLogRecords: 1,
      trackedExecutionCount: 1,
      untrackedRecordCount: 1,
      successCount: 1,
      failureCount: 0,
      warningCount: 0,
      successRate: 100,
      failureRate: 0,
      failureCategories: {},
      executionVolumeByService: { ats: 1 },
      coverage: { trackedRecords: 1, untrackedRecords: 1, unknownCoverage: true }
    }
  };
}

function buildAts() {
  return {
    atsReliability: {
      checkpointCount: 1,
      completedCheckpointCount: 1,
      failureCount: 0,
      atsTypeDistribution: { greenhouse: 1 },
      failureCountsByAtsType: {}
    }
  };
}

function buildPipeline() {
  return {
    jobPipeline: {
      jobsDiscovered: 1,
      jobsParsed: 1,
      jobsScored: 1,
      generatedDocuments: 1,
      generatedResumes: 1,
      documentsByType: { resume_json: 1 },
      renderedResumesByTemplate: { ats: 1 }
    }
  };
}

function buildSummary() {
  return {
    summary: {
      funnel: buildFunnel().funnel,
      lifecycle: buildLifecycle().lifecycle,
      executions: buildExecutions().executions,
      atsReliability: buildAts().atsReliability,
      jobPipeline: buildPipeline().jobPipeline
    }
  };
}
