import type { Job } from "../domain/jobs/job.types.js";
import type { JobRepository } from "../repositories/job.repository.js";
import type { CrawlRequest } from "../services/discovery/crawlers/crawler.interface.js";
import type { JobDiscoveryService } from "../services/discovery/job-discovery.service.js";

export type DiscoverJobsResult = {
  jobs: Job[];
  crawledCount: number;
  storedCount: number;
  duplicateCount: number;
};

export class DiscoverJobsUseCase {
  constructor(
    private readonly discoveryService: JobDiscoveryService,
    private readonly jobRepository: JobRepository
  ) {}

  async execute(request: CrawlRequest): Promise<DiscoverJobsResult> {
    const discoveryResult = await this.discoveryService.discover(request);
    const jobs: Job[] = [];

    for (const job of discoveryResult.jobs) {
      jobs.push(await this.jobRepository.upsert(job));
    }

    return {
      jobs,
      crawledCount: discoveryResult.crawledCount,
      storedCount: jobs.length,
      duplicateCount: discoveryResult.duplicateCount
    };
  }
}
