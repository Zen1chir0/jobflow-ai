import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../../src/domain/errors/application-error.js";
import type { JobCrawler } from "../../../../src/services/discovery/crawlers/crawler.interface.js";
import { JobDeduplicator } from "../../../../src/services/discovery/deduplicators/job-deduplicator.js";
import { JobDiscoveryService } from "../../../../src/services/discovery/job-discovery.service.js";
import { JobNormalizer } from "../../../../src/services/discovery/normalizers/job-normalizer.js";

describe("JobDiscoveryService", () => {
  it("crawls, normalizes, and deduplicates discovered jobs", async () => {
    const crawler: JobCrawler = {
      source: "manual",
      crawl: () =>
        Promise.resolve([
        {
          source: "manual",
          title: "QA Engineer",
          company: "Example Co",
          descriptionRaw: "Description",
          applicationUrl: "https://example.com/jobs/1"
        },
        {
          source: "manual",
          title: "QA Engineer",
          company: "Example Co",
          descriptionRaw: "Description",
          applicationUrl: "https://example.com/jobs/1#apply"
        }
      ])
    };

    const service = new JobDiscoveryService([crawler], new JobNormalizer(), new JobDeduplicator());

    const result = await service.discover({ source: "manual" });

    expect(result.crawledCount).toBe(2);
    expect(result.duplicateCount).toBe(1);
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]?.title).toBe("QA Engineer");
  });

  it("rejects unsupported sources before crawling", async () => {
    const service = new JobDiscoveryService([], new JobNormalizer(), new JobDeduplicator());

    await expect(service.discover({ source: "manual" })).rejects.toThrow(ApplicationError);
  });
});
