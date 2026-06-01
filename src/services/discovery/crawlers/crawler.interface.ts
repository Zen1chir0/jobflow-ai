import type { JobSource } from "../../../domain/jobs/job.types.js";

export type CrawlRequest = {
  source: JobSource;
  query?: string;
  limit?: number;
  manualJob?: ManualJobInput;
};

export type ManualJobInput = {
  title: string;
  company: string;
  applicationUrl: string;
  descriptionRaw: string;
  location?: string;
  sourceJobId?: string;
  salaryRaw?: string;
};

export type RawJobListing = {
  source: JobSource;
  sourceJobId?: string;
  title: string;
  company: string;
  location?: string;
  salaryRaw?: string;
  descriptionRaw: string;
  applicationUrl: string;
  discoveredAt?: string;
};

export interface JobCrawler {
  readonly source: JobSource;
  crawl(request: CrawlRequest): Promise<RawJobListing[]>;
}
