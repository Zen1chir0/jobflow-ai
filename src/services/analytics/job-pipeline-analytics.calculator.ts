import type { AnalyticsDataset, JobPipelineAnalytics } from "../../domain/analytics/analytics.types.js";

export class JobPipelineAnalyticsCalculator {
  calculate(dataset: Pick<
    AnalyticsDataset,
    "jobs" | "parsedJobProfiles" | "jobMatchScores" | "generatedDocuments" | "generatedResumes"
  >): JobPipelineAnalytics {
    return {
      jobsDiscovered: dataset.jobs.length,
      jobsParsed: new Set([
        ...dataset.jobs.filter((job) => job.parsedAt).map((job) => job.id),
        ...dataset.parsedJobProfiles.map((profile) => profile.jobId)
      ]).size,
      jobsScored: new Set(dataset.jobMatchScores.map((score) => score.jobId)).size,
      generatedDocuments: dataset.generatedDocuments.length,
      generatedResumes: dataset.generatedResumes.length,
      documentsByType: countBy(dataset.generatedDocuments.map((document) => document.documentType)),
      renderedResumesByTemplate: countBy(dataset.generatedResumes.map((resume) => resume.template))
    };
  }
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
