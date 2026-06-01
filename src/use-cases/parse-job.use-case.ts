import { ApplicationError } from "../domain/errors/application-error.js";
import type { Job } from "../domain/jobs/job.types.js";
import type { ParsedJobProfile } from "../domain/jobs/parsed-job-profile.types.js";
import type { JobRepository } from "../repositories/job.repository.js";
import type { ParsedJobProfileRepository } from "../repositories/parsed-job-profile.repository.js";
import type { JobParsingService } from "../services/parsing/job-parsing.service.js";

export type ParseJobRequest =
  | {
      jobId: string;
      all?: false;
      limit?: never;
    }
  | {
      all: true;
      limit?: number;
      jobId?: never;
    };

export type ParseJobResult = {
  parsedProfiles: ParsedJobProfile[];
  parsedCount: number;
};

export class ParseJobUseCase {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly parsedJobProfileRepository: ParsedJobProfileRepository,
    private readonly jobParsingService: JobParsingService
  ) {}

  async execute(request: ParseJobRequest): Promise<ParseJobResult> {
    const jobs = await this.resolveJobs(request);
    const parsedProfiles: ParsedJobProfile[] = [];

    for (const job of jobs) {
      const parsedProfile = this.jobParsingService.parse(job);
      const savedProfile = await this.parsedJobProfileRepository.upsert(parsedProfile);
      const descriptionClean = getDescriptionClean(parsedProfile.rawMetadata);
      await this.jobRepository.markParsed(job.id, undefined, descriptionClean);
      parsedProfiles.push(savedProfile);
    }

    return {
      parsedProfiles,
      parsedCount: parsedProfiles.length
    };
  }

  private async resolveJobs(request: ParseJobRequest): Promise<Job[]> {
    if ("all" in request && request.all) {
      return this.jobRepository.findUnparsed(request.limit);
    }

    const job = await this.jobRepository.findById(request.jobId);

    if (!job) {
      throw new ApplicationError("JOB_NOT_FOUND", "Job not found");
    }

    return [job];
  }
}

function getDescriptionClean(metadata: Record<string, unknown>): string | undefined {
  const value = metadata.descriptionClean;
  return typeof value === "string" ? value : undefined;
}
