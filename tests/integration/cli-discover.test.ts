import { describe, expect, it, vi } from "vitest";

import { createDiscoverCommand } from "../../src/cli/commands/discover.command.js";
import type { DiscoverJobsUseCase } from "../../src/use-cases/discover-jobs.use-case.js";

describe("discover command", () => {
  it("parses manual discovery options and displays stored jobs", async () => {
    const execute = vi.fn().mockResolvedValue({
      jobs: [
        {
          id: "job_1",
          source: "manual",
          title: "QA Engineer",
          company: "Example Co",
          remoteType: "remote",
          descriptionRaw: "Description",
          applicationUrl: "https://example.com/jobs/1",
          atsType: "unknown",
          discoveredAt: "2026-06-01T00:00:00.000Z"
        }
      ],
      crawledCount: 1,
      storedCount: 1,
      duplicateCount: 0
    });
    const command = createDiscoverCommand(
      () =>
        ({
          execute
        }) as unknown as DiscoverJobsUseCase
    );
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await command.parseAsync(
      [
        "--source",
        "manual",
        "--title",
        "QA Engineer",
        "--company",
        "Example Co",
        "--url",
        "https://example.com/jobs/1",
        "--description",
        "Description"
      ],
      { from: "user" }
    );

    expect(execute).toHaveBeenCalledWith({
      source: "manual",
      manualJob: {
        title: "QA Engineer",
        company: "Example Co",
        applicationUrl: "https://example.com/jobs/1",
        descriptionRaw: "Description"
      }
    });
    expect(output).toHaveBeenCalledWith("Discovered 1 job(s), stored 1, duplicates 0");
    expect(output).toHaveBeenCalledWith("job_1 Example Co - QA Engineer");
  });
});
