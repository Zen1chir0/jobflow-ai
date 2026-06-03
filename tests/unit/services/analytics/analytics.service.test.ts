import { describe, expect, it, vi } from "vitest";

import { AnalyticsService } from "../../../../src/services/analytics/analytics.service.js";

describe("AnalyticsService", () => {
  it("orchestrates calculators over repository data", async () => {
    const getDataset = vi.fn().mockResolvedValue(buildDataset());
    const service = new AnalyticsService({ getDataset });

    const summary = await service.getPlatformSummary();

    expect(getDataset).toHaveBeenCalledOnce();
    expect(summary.lifecycle.totalApplications).toBe(1);
    expect(summary.jobPipeline.jobsDiscovered).toBe(1);
  });
});

function buildDataset() {
  return {
    applications: [
      {
        id: "application_1",
        currentState: "HIRED",
        createdAt: "2026-06-03T00:00:00.000Z",
        updatedAt: "2026-06-03T00:00:00.000Z"
      }
    ],
    applicationEvents: [],
    executionLogs: [],
    automationCheckpoints: [],
    jobs: [{ id: "job_1", discoveredAt: "2026-06-03T00:00:00.000Z" }],
    parsedJobProfiles: [],
    jobMatchScores: [],
    generatedDocuments: [],
    generatedResumes: [],
    applicationSummary: [],
    applicationStateCounts: [],
    platformPerformance: []
  };
}
