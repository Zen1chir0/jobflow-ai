import { ApplicationError } from "../../../domain/errors/application-error.js";
import type { ATSType, NewJob, RemoteType } from "../../../domain/jobs/job.types.js";
import type { RawJobListing } from "../crawlers/crawler.interface.js";

export class JobNormalizer {
  normalize(rawJob: RawJobListing): NewJob {
    const title = normalizeRequiredText(rawJob.title, "title");
    const company = normalizeRequiredText(rawJob.company, "company");
    const descriptionRaw = normalizeRequiredText(rawJob.descriptionRaw, "descriptionRaw");
    const applicationUrl = normalizeApplicationUrl(rawJob.applicationUrl);
    const location = normalizeOptionalText(rawJob.location);

    return {
      source: rawJob.source,
      title,
      company,
      applicationUrl,
      descriptionRaw,
      remoteType: inferRemoteType(location),
      atsType: inferAtsType(applicationUrl),
      discoveredAt: rawJob.discoveredAt ?? new Date().toISOString(),
      ...(location ? { location } : {}),
      ...(rawJob.sourceJobId ? { sourceJobId: rawJob.sourceJobId.trim() } : {}),
      ...(rawJob.salaryRaw ? { salaryRaw: rawJob.salaryRaw.trim() } : {})
    };
  }
}

function normalizeRequiredText(value: string, field: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new ApplicationError("INVALID_JOB_DATA", `Job ${field} is required`);
  }

  return normalized;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");

  return normalized ? normalized : undefined;
}

function normalizeApplicationUrl(value: string): string {
  const normalized = normalizeRequiredText(value, "applicationUrl");

  try {
    const url = new URL(normalized);
    url.hash = "";
    url.searchParams.sort();
    return url.toString();
  } catch (error) {
    throw new ApplicationError("INVALID_JOB_DATA", `Invalid application URL: ${normalized}`, { cause: error });
  }
}

function inferRemoteType(location: string | undefined): RemoteType {
  const value = location?.toLowerCase() ?? "";

  if (value.includes("remote")) {
    return "remote";
  }

  if (value.includes("hybrid")) {
    return "hybrid";
  }

  if (value.length > 0) {
    return "onsite";
  }

  return "unknown";
}

function inferAtsType(applicationUrl: string): ATSType {
  const value = applicationUrl.toLowerCase();

  if (value.includes("greenhouse.io") || value.includes("boards.greenhouse.io")) {
    return "greenhouse";
  }

  if (value.includes("jobs.lever.co")) {
    return "lever";
  }

  if (value.includes("myworkdayjobs.com") || value.includes("workday") || value.includes("wd1.myworkdaysite.com")) {
    return "workday";
  }

  return "unknown";
}
