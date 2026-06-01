import { ApplicationError } from "../../domain/errors/application-error.js";
import type { JobSource, NewJob } from "../../domain/jobs/job.types.js";
import type { CrawlRequest, JobCrawler } from "./crawlers/crawler.interface.js";
import type { JobDeduplicator } from "./deduplicators/job-deduplicator.js";
import type { JobNormalizer } from "./normalizers/job-normalizer.js";

export type JobDiscoveryResult = {
  jobs: NewJob[];
  crawledCount: number;
  duplicateCount: number;
};

export class JobDiscoveryService {
  constructor(
    private readonly crawlers: JobCrawler[],
    private readonly normalizer: JobNormalizer,
    private readonly deduplicator: JobDeduplicator
  ) {}

  async discover(request: CrawlRequest): Promise<JobDiscoveryResult> {
    const crawler = this.resolveCrawler(request.source);
    const rawJobs = await crawler.crawl(request);
    const normalizedJobs = rawJobs.map((rawJob) => this.normalizer.normalize(rawJob));
    const deduped = this.deduplicator.deduplicate(normalizedJobs);

    return {
      jobs: deduped.uniqueJobs,
      crawledCount: rawJobs.length,
      duplicateCount: deduped.duplicateCount
    };
  }

  private resolveCrawler(source: JobSource): JobCrawler {
    const crawler = this.crawlers.find((candidate) => candidate.source === source);

    if (!crawler) {
      throw new ApplicationError("UNSUPPORTED_JOB_SOURCE", `Unsupported job source: ${source}`);
    }

    return crawler;
  }
}
