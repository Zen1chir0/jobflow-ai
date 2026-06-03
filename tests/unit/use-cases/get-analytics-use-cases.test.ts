import { describe, expect, it, vi } from "vitest";

import { GetApplicationFunnelAnalyticsUseCase } from "../../../src/use-cases/get-application-funnel-analytics.use-case.js";
import { GetATSReliabilityAnalyticsUseCase } from "../../../src/use-cases/get-ats-reliability-analytics.use-case.js";
import { GetExecutionAnalyticsUseCase } from "../../../src/use-cases/get-execution-analytics.use-case.js";
import { GetJobPipelineAnalyticsUseCase } from "../../../src/use-cases/get-job-pipeline-analytics.use-case.js";
import { GetLifecycleAnalyticsUseCase } from "../../../src/use-cases/get-lifecycle-analytics.use-case.js";
import { GetPlatformAnalyticsSummaryUseCase } from "../../../src/use-cases/get-platform-analytics-summary.use-case.js";

describe("analytics use cases", () => {
  it("delegate analytics retrieval to the analytics service", async () => {
    const service = {
      getFunnelAnalytics: vi.fn().mockResolvedValue({ totalApplications: 1, steps: [] }),
      getLifecycleAnalytics: vi.fn().mockResolvedValue({ totalApplications: 1 }),
      getExecutionAnalytics: vi.fn().mockResolvedValue({ totalLogRecords: 1 }),
      getATSReliabilityAnalytics: vi.fn().mockResolvedValue({ checkpointCount: 1 }),
      getJobPipelineAnalytics: vi.fn().mockResolvedValue({ jobsDiscovered: 1 }),
      getPlatformSummary: vi.fn().mockResolvedValue({ lifecycle: { totalApplications: 1 } })
    };

    await expect(new GetApplicationFunnelAnalyticsUseCase(service as never).execute()).resolves.toEqual({
      funnel: { totalApplications: 1, steps: [] }
    });
    await expect(new GetLifecycleAnalyticsUseCase(service as never).execute()).resolves.toEqual({
      lifecycle: { totalApplications: 1 }
    });
    await expect(new GetExecutionAnalyticsUseCase(service as never).execute()).resolves.toEqual({
      executions: { totalLogRecords: 1 }
    });
    await expect(new GetATSReliabilityAnalyticsUseCase(service as never).execute()).resolves.toEqual({
      atsReliability: { checkpointCount: 1 }
    });
    await expect(new GetJobPipelineAnalyticsUseCase(service as never).execute()).resolves.toEqual({
      jobPipeline: { jobsDiscovered: 1 }
    });
    await expect(new GetPlatformAnalyticsSummaryUseCase(service as never).execute()).resolves.toEqual({
      summary: { lifecycle: { totalApplications: 1 } }
    });
  });
});
