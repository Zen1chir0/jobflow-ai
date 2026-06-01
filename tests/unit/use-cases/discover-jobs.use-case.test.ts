import { describe, expect, it, vi } from "vitest";

import type { Job, NewJob } from "../../../src/domain/jobs/job.types.js";
import type { JobRepository } from "../../../src/repositories/job.repository.js";
import type { JobDiscoveryService } from "../../../src/services/discovery/job-discovery.service.js";
import { DiscoverJobsUseCase } from "../../../src/use-cases/discover-jobs.use-case.js";

describe("DiscoverJobsUseCase", () => {
  it("stores discovered jobs through the repository", async () => {
    const newJob = buildNewJob();
    const storedJob: Job = { ...newJob, id: "job_1" };
    const upsert = vi.fn().mockResolvedValue(storedJob);
    const discoveryService = {
      discover: vi.fn().mockResolvedValue({
        jobs: [newJob],
        crawledCount: 1,
        duplicateCount: 0
      })
    } as unknown as JobDiscoveryService;
    const repository: JobRepository = {
      upsert,
      findById: vi.fn()
    };
    const useCase = new DiscoverJobsUseCase(discoveryService, repository);

    const result = await useCase.execute({ source: "manual" });

    expect(upsert).toHaveBeenCalledWith(newJob);
    expect(result).toEqual({
      jobs: [storedJob],
      crawledCount: 1,
      storedCount: 1,
      duplicateCount: 0
    });
  });
});

function buildNewJob(): NewJob {
  return {
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
