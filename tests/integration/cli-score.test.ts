import { describe, expect, it, vi } from "vitest";

import { createScoreCommand } from "../../src/cli/commands/score.command.js";
import type { ScoreJobUseCase } from "../../src/use-cases/score-job.use-case.js";

describe("score command", () => {
  it("parses --job-id and displays score breakdowns", async () => {
    const execute = vi.fn().mockResolvedValue({
      score: {
        jobId: "job_1",
        skillMatch: 90,
        experienceMatch: 80,
        industryMatch: 100,
        locationMatch: 100,
        compensationMatch: 75,
        finalScore: 86.25,
        scoringMetadata: {}
      }
    });
    const command = createScoreCommand(
      () =>
        ({
          execute
        }) as unknown as ScoreJobUseCase
    );
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await command.parseAsync(["--job-id", "job_1"], { from: "user" });

    expect(execute).toHaveBeenCalledWith({ jobId: "job_1" });
    expect(output).toHaveBeenCalledWith("Scored job job_1: 86.25");
    expect(output).toHaveBeenCalledWith("skill=90 experience=80 industry=100 location=100 compensation=75");
  });
});
