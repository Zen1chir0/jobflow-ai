import { describe, expect, it } from "vitest";

import { JobPipelineAnalyticsCalculator } from "../../../../src/services/analytics/job-pipeline-analytics.calculator.js";
import type { AnalyticsDataset } from "../../../../src/domain/analytics/analytics.types.js";

describe("JobPipelineAnalyticsCalculator", () => {
  it("calculates job, document, and rendered resume counts", () => {
    const dataset: Pick<
      AnalyticsDataset,
      "jobs" | "parsedJobProfiles" | "jobMatchScores" | "generatedDocuments" | "generatedResumes"
    > = {
      jobs: [
        { id: "job_1", discoveredAt: "2026-06-03T00:00:00.000Z", parsedAt: "2026-06-03T01:00:00.000Z" },
        { id: "job_2", discoveredAt: "2026-06-03T00:00:00.000Z" }
      ],
      parsedJobProfiles: [{ id: "profile_1", jobId: "job_1" }],
      jobMatchScores: [{ id: "score_1", jobId: "job_1", finalScore: 88 }],
      generatedDocuments: [
        { id: "doc_1", jobId: "job_1", documentType: "resume_json", createdAt: "2026-06-03T00:00:00.000Z" },
        { id: "doc_2", jobId: "job_1", documentType: "cover_letter", createdAt: "2026-06-03T00:00:00.000Z" }
      ],
      generatedResumes: [{ id: "resume_1", jobId: "job_1", template: "ats", createdAt: "2026-06-03T00:00:00.000Z" }]
    };

    const result = new JobPipelineAnalyticsCalculator().calculate(dataset);

    expect(result.jobsDiscovered).toBe(2);
    expect(result.jobsParsed).toBe(1);
    expect(result.jobsScored).toBe(1);
    expect(result.documentsByType).toEqual({ resume_json: 1, cover_letter: 1 });
    expect(result.renderedResumesByTemplate).toEqual({ ats: 1 });
  });
});
