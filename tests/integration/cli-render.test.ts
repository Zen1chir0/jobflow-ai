import { describe, expect, it, vi } from "vitest";

import { createRenderCommand } from "../../src/cli/commands/render.command.js";
import type { RenderResumeUseCase } from "../../src/use-cases/render-resume.use-case.js";

describe("render command", () => {
  it("parses render options and displays rendered metadata", async () => {
    const execute = vi.fn().mockResolvedValue({
      generatedResume: {
        id: "resume_1",
        jobId: "job_1",
        generatedDocumentId: "document_1",
        template: "ats",
        resumeJson: {},
        latexSource: "latex",
        texPath: "storage/resumes/job_1/document_1/resume.tex",
        pdfPath: "storage/resumes/job_1/document_1/resume.pdf",
        metadataPath: "storage/resumes/job_1/document_1/metadata.json",
        compiler: "mock",
        createdAt: "2026-06-01T00:00:00.000Z"
      }
    });
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createRenderCommand(() => ({ execute }) as unknown as RenderResumeUseCase);

    await command.parseAsync(["--document-id", "document_1", "--template", "ats"], { from: "user" });

    expect(execute).toHaveBeenCalledWith({
      generatedDocumentId: "document_1",
      template: "ats"
    });
    expect(output).toHaveBeenCalledWith("Rendered resume resume_1");
    expect(output).toHaveBeenCalledWith("Template ats");
    expect(output).toHaveBeenCalledWith("Compiler mock");
  });
});

