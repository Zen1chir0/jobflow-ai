import { describe, expect, it, vi } from "vitest";

import { createParseCommand } from "../../src/cli/commands/parse.command.js";
import type { ParseJobUseCase } from "../../src/use-cases/parse-job.use-case.js";

describe("parse command", () => {
  it("parses --job-id and displays parse results", async () => {
    const execute = vi.fn().mockResolvedValue({
      parsedProfiles: [
        {
          jobId: "job_1",
          responsibilities: [],
          requiredSkills: ["Playwright", "TypeScript"],
          preferredSkills: [],
          seniority: "senior",
          compensation: {},
          rawMetadata: {}
        }
      ],
      parsedCount: 1
    });
    const command = createParseCommand(
      () =>
        ({
          execute
        }) as unknown as ParseJobUseCase
    );
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await command.parseAsync(["--job-id", "job_1"], { from: "user" });

    expect(execute).toHaveBeenCalledWith({ jobId: "job_1" });
    expect(output).toHaveBeenCalledWith("Parsed 1 job(s)");
    expect(output).toHaveBeenCalledWith("job_1 senior 2 required skill(s)");
  });

  it("parses --all with a numeric limit", async () => {
    const execute = vi.fn().mockResolvedValue({
      parsedProfiles: [],
      parsedCount: 0
    });
    const command = createParseCommand(
      () =>
        ({
          execute
        }) as unknown as ParseJobUseCase
    );
    vi.spyOn(console, "log").mockImplementation(() => undefined);

    await command.parseAsync(["--all", "--limit", "3"], { from: "user" });

    expect(execute).toHaveBeenCalledWith({ all: true, limit: 3 });
  });
});
