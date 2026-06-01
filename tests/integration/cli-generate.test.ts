import { describe, expect, it, vi } from "vitest";

import { createGenerateCommand } from "../../src/cli/commands/generate.command.js";
import type { GenerateDocumentUseCase } from "../../src/use-cases/generate-document.use-case.js";

describe("generate command", () => {
  it("parses resume options and displays generated metadata", async () => {
    const execute = vi.fn().mockResolvedValue(buildResult("resume_json"));
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createGenerateCommand({
      resume: () => ({ execute }) as unknown as GenerateDocumentUseCase
    });

    await command.parseAsync(["resume", "--job-id", "job_1", "--top-k", "3", "--threshold", "0.8"], {
      from: "user"
    });

    expect(execute).toHaveBeenCalledWith({ jobId: "job_1", topK: 3, threshold: 0.8 });
    expect(output).toHaveBeenCalledWith("Generated resume_json document_1");
    expect(output).toHaveBeenCalledWith("Stored 1 evidence fragment(s)");
  });

  it("parses all document generation subcommands", async () => {
    const coverLetter = vi.fn().mockResolvedValue(buildResult("cover_letter"));
    const recruiterMessage = vi.fn().mockResolvedValue(buildResult("recruiter_message"));
    const screeningResponse = vi.fn().mockResolvedValue(buildResult("screening_response"));
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createGenerateCommand({
      coverLetter: () => ({ execute: coverLetter }) as unknown as GenerateDocumentUseCase,
      recruiterMessage: () => ({ execute: recruiterMessage }) as unknown as GenerateDocumentUseCase,
      screeningResponse: () => ({ execute: screeningResponse }) as unknown as GenerateDocumentUseCase
    });

    await command.parseAsync(["cover-letter", "--job-id", "job_1"], { from: "user" });
    await command.parseAsync(["recruiter-message", "--job-id", "job_1"], { from: "user" });
    await command.parseAsync(["screening-response", "--job-id", "job_1", "--question", "Why this role?"], {
      from: "user"
    });

    expect(coverLetter).toHaveBeenCalledWith({ jobId: "job_1" });
    expect(recruiterMessage).toHaveBeenCalledWith({ jobId: "job_1" });
    expect(screeningResponse).toHaveBeenCalledWith({ jobId: "job_1", screeningQuestion: "Why this role?" });
    expect(output).toHaveBeenCalledWith("Generated screening_response document_1");
  });
});

function buildResult(documentType: string) {
  return {
    document: {
      id: "document_1",
      jobId: "job_1",
      documentType,
      content: {},
      prompt: "safe prompt",
      contextFragmentIds: ["fragment_1"],
      provider: "fake-provider",
      model: "fake-model",
      createdAt: "2026-06-01T00:00:00.000Z"
    }
  };
}

