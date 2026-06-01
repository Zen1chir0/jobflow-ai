import { Command } from "commander";

import { ManualCrawler } from "../../services/discovery/crawlers/manual.crawler.js";
import { JobDeduplicator } from "../../services/discovery/deduplicators/job-deduplicator.js";
import { JobDiscoveryService } from "../../services/discovery/job-discovery.service.js";
import { JobNormalizer } from "../../services/discovery/normalizers/job-normalizer.js";
import { SupabaseJobRepository } from "../../repositories/job.repository.js";
import { DiscoverJobsUseCase, type DiscoverJobsResult } from "../../use-cases/discover-jobs.use-case.js";
import type { CrawlRequest, ManualJobInput } from "../../services/discovery/crawlers/crawler.interface.js";
import type { JobSource } from "../../domain/jobs/job.types.js";

type DiscoverCommandOptions = {
  source: JobSource;
  query?: string;
  limit?: string;
  title?: string;
  company?: string;
  url?: string;
  description?: string;
  location?: string;
  sourceJobId?: string;
  salary?: string;
};

type DiscoverUseCaseFactory = () => DiscoverJobsUseCase;

export function createDiscoverCommand(createUseCase: DiscoverUseCaseFactory = createDefaultDiscoverUseCase): Command {
  return new Command("discover")
    .description("Discover jobs from a supported source")
    .requiredOption("--source <source>", "job source")
    .option("--query <query>", "source-specific search query")
    .option("--limit <limit>", "maximum jobs to discover")
    .option("--title <title>", "manual job title")
    .option("--company <company>", "manual company name")
    .option("--url <url>", "manual application URL")
    .option("--description <description>", "manual raw job description")
    .option("--location <location>", "manual job location")
    .option("--source-job-id <sourceJobId>", "manual source job id")
    .option("--salary <salary>", "manual raw salary text")
    .action(async (options: DiscoverCommandOptions) => {
      const useCase = createUseCase();
      const result = await useCase.execute(toCrawlRequest(options));
      displayDiscoverResult(result);
    });
}

function createDefaultDiscoverUseCase(): DiscoverJobsUseCase {
  const discoveryService = new JobDiscoveryService([new ManualCrawler()], new JobNormalizer(), new JobDeduplicator());

  return new DiscoverJobsUseCase(discoveryService, new SupabaseJobRepository());
}

function toCrawlRequest(options: DiscoverCommandOptions): CrawlRequest {
  return {
    source: options.source,
    ...(options.query ? { query: options.query } : {}),
    ...(options.limit ? { limit: Number(options.limit) } : {}),
    ...(options.source === "manual" ? { manualJob: toManualJobInput(options) } : {})
  };
}

function toManualJobInput(options: DiscoverCommandOptions): ManualJobInput {
  return {
    title: requiredOption(options.title, "title"),
    company: requiredOption(options.company, "company"),
    applicationUrl: requiredOption(options.url, "url"),
    descriptionRaw: requiredOption(options.description, "description"),
    ...(options.location ? { location: options.location } : {}),
    ...(options.sourceJobId ? { sourceJobId: options.sourceJobId } : {}),
    ...(options.salary ? { salaryRaw: options.salary } : {})
  };
}

function requiredOption(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required option for manual discovery: --${name}`);
  }

  return value;
}

function displayDiscoverResult(result: DiscoverJobsResult): void {
  console.log(`Discovered ${result.crawledCount} job(s), stored ${result.storedCount}, duplicates ${result.duplicateCount}`);

  for (const job of result.jobs) {
    console.log(`${job.id} ${job.company} - ${job.title}`);
  }
}
