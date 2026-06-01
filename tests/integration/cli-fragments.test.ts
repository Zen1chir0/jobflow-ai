import { describe, expect, it, vi } from "vitest";

import { createFragmentsCommand } from "../../src/cli/commands/fragments.command.js";
import type { CreateResumeFragmentUseCase } from "../../src/use-cases/create-resume-fragment.use-case.js";
import type { RetrieveResumeContextUseCase } from "../../src/use-cases/retrieve-resume-context.use-case.js";

describe("fragments command", () => {
  it("parses add options and displays created fragment metadata", async () => {
    const execute = vi.fn().mockResolvedValue({
      fragment: {
        id: "fragment_1",
        fragmentText: "Built Playwright framework.",
        fragmentType: "project",
        metadata: {},
        embedding: []
      }
    });
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createFragmentsCommand(
      () =>
        ({
          execute
        }) as unknown as CreateResumeFragmentUseCase,
      buildRetrieveUseCase
    );

    await command.parseAsync(
      ["add", "--type", "project", "--text", "Built Playwright framework.", "--source-label", "FlowSentinel"],
      { from: "user" }
    );

    expect(execute).toHaveBeenCalledWith({
      fragmentType: "project",
      fragmentText: "Built Playwright framework.",
      sourceLabel: "FlowSentinel"
    });
    expect(output).toHaveBeenCalledWith("Created fragment fragment_1");
    expect(output).toHaveBeenCalledWith("project 27 character(s)");
  });

  it("parses context options and displays retrieved context", async () => {
    const execute = vi.fn().mockResolvedValue({
      fragments: [
        {
          id: "fragment_1",
          fragmentText: "Built Playwright framework.",
          fragmentType: "project",
          metadata: {},
          embedding: []
        }
      ],
      contextText: "- [project] Built Playwright framework."
    });
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createFragmentsCommand(
      buildCreateUseCase,
      () =>
        ({
          execute
        }) as unknown as RetrieveResumeContextUseCase
    );

    await command.parseAsync(["context", "--job-id", "job_1", "--top-k", "3", "--threshold", "0.8"], {
      from: "user"
    });

    expect(execute).toHaveBeenCalledWith({
      jobId: "job_1",
      topK: 3,
      threshold: 0.8
    });
    expect(output).toHaveBeenCalledWith("Retrieved 1 fragment(s)");
    expect(output).toHaveBeenCalledWith("- [project] Built Playwright framework.");
  });
});

function buildCreateUseCase(): CreateResumeFragmentUseCase {
  return {
    execute: vi.fn()
  } as unknown as CreateResumeFragmentUseCase;
}

function buildRetrieveUseCase(): RetrieveResumeContextUseCase {
  return {
    execute: vi.fn()
  } as unknown as RetrieveResumeContextUseCase;
}
