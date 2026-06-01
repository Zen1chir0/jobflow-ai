import { ApplicationError } from "../../../domain/errors/application-error.js";
import type { CrawlRequest, JobCrawler, RawJobListing } from "./crawler.interface.js";

export class ManualCrawler implements JobCrawler {
  readonly source = "manual";

  crawl(request: CrawlRequest): Promise<RawJobListing[]> {
    if (!request.manualJob) {
      throw new ApplicationError("INVALID_DISCOVERY_REQUEST", "Manual discovery requires manual job details");
    }

    const manualJob = request.manualJob;

    return Promise.resolve([
      {
        source: this.source,
        title: manualJob.title,
        company: manualJob.company,
        applicationUrl: manualJob.applicationUrl,
        descriptionRaw: manualJob.descriptionRaw,
        ...(manualJob.location ? { location: manualJob.location } : {}),
        ...(manualJob.sourceJobId ? { sourceJobId: manualJob.sourceJobId } : {}),
        ...(manualJob.salaryRaw ? { salaryRaw: manualJob.salaryRaw } : {})
      }
    ]);
  }
}
