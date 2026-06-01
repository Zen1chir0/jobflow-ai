import { describe, expect, it, vi } from "vitest";

import type { Job } from "../../../src/domain/jobs/job.types.js";
import type { NewParsedJobProfile, ParsedJobProfile } from "../../../src/domain/jobs/parsed-job-profile.types.js";
import type { JobRepository } from "../../../src/repositories/job.repository.js";
import type { ParsedJobProfileRepository } from "../../../src/repositories/parsed-job-profile.repository.js";
import type { JobParsingService } from "../../../src/services/parsing/job-parsing.service.js";
import { ParseJobUseCase } from "../../../src/use-cases/parse-job.use-case.js";

describe("ParseJobUseCase", () => {
  it("parses one job and persists the parsed profile through repositories", async () => {
    const job = buildJob();
    const parsedProfile = buildParsedProfile(job.id);
    const savedProfile: ParsedJobProfile = parsedProfile;
    const markParsed = vi.fn().mockResolvedValue(undefined);
    const parsedUpsert = vi.fn().mockResolvedValue(savedProfile);
    const jobRepository: JobRepository = {
      upsert: vi.fn(),
      findById: vi.fn().mockResolvedValue(job),
      findUnparsed: vi.fn(),
      markParsed
    };
    const parsedRepository: ParsedJobProfileRepository = {
      upsert: parsedUpsert,
      findByJobId: vi.fn()
    };
    const parsingService = {
      parse: vi.fn().mockReturnValue(parsedProfile)
    } as unknown as JobParsingService;
    const useCase = new ParseJobUseCase(jobRepository, parsedRepository, parsingService);

    const result = await useCase.execute({ jobId: job.id });

    expect(parsedUpsert).toHaveBeenCalledWith(parsedProfile);
    expect(markParsed).toHaveBeenCalledWith(job.id, undefined, "Clean text");
    expect(result).toEqual({ parsedProfiles: [savedProfile], parsedCount: 1 });
  });
});

function buildJob(): Job {
  return {
    id: "job_1",
    source: "manual",
    title: "QA Engineer",
    company: "Example Co",
    remoteType: "remote",
    descriptionRaw: "Description",
    applicationUrl: "https://example.com/jobs/1",
    atsType: "unknown",
    discoveredAt: "2026-06-01T00:00:00.000Z"
  };
}

function buildParsedProfile(jobId: string): NewParsedJobProfile {
  return {
    jobId,
    responsibilities: ["Build tests"],
    requiredSkills: ["Playwright"],
    preferredSkills: [],
    seniority: "unknown",
    compensation: {},
    rawMetadata: {
      descriptionClean: "Clean text"
    }
  };
}
