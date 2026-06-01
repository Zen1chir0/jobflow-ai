import type { NewJob } from "../../../domain/jobs/job.types.js";

export type DeduplicationResult = {
  uniqueJobs: NewJob[];
  duplicateCount: number;
};

export class JobDeduplicator {
  deduplicate(jobs: NewJob[]): DeduplicationResult {
    const seen = new Set<string>();
    const uniqueJobs: NewJob[] = [];

    for (const job of jobs) {
      const key = buildDeduplicationKey(job);

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      uniqueJobs.push(job);
    }

    return {
      uniqueJobs,
      duplicateCount: jobs.length - uniqueJobs.length
    };
  }
}

function buildDeduplicationKey(job: NewJob): string {
  if (job.applicationUrl) {
    return `url:${normalizeUrlForComparison(job.applicationUrl)}`;
  }

  return `source:${job.source}:${job.sourceJobId ?? ""}:${job.company.toLowerCase()}:${job.title.toLowerCase()}`;
}

function normalizeUrlForComparison(value: string): string {
  const url = new URL(value);
  url.hash = "";
  url.searchParams.sort();
  return url.toString().toLowerCase();
}
