import { describe, expect, it } from "vitest";

import type { NewJob } from "../../../../src/domain/jobs/job.types.js";
import { JobDeduplicator } from "../../../../src/services/discovery/deduplicators/job-deduplicator.js";

describe("JobDeduplicator", () => {
  it("deduplicates jobs by normalized application URL", () => {
    const deduplicator = new JobDeduplicator();
    const jobs = [buildJob("https://example.com/jobs/1?b=2&a=1#apply"), buildJob("https://example.com/jobs/1?a=1&b=2")];

    const result = deduplicator.deduplicate(jobs);

    expect(result.uniqueJobs).toHaveLength(1);
    expect(result.duplicateCount).toBe(1);
  });

  it("preserves first-seen unique jobs", () => {
    const deduplicator = new JobDeduplicator();
    const first = buildJob("https://example.com/jobs/1", "First");
    const second = buildJob("https://example.com/jobs/2", "Second");

    const result = deduplicator.deduplicate([first, second]);

    expect(result.uniqueJobs).toEqual([first, second]);
    expect(result.duplicateCount).toBe(0);
  });
});

function buildJob(applicationUrl: string, title = "QA Engineer"): NewJob {
  return {
    source: "manual",
    title,
    company: "Example Co",
    remoteType: "remote",
    descriptionRaw: "Description",
    applicationUrl,
    atsType: "unknown",
    discoveredAt: "2026-06-01T00:00:00.000Z"
  };
}
