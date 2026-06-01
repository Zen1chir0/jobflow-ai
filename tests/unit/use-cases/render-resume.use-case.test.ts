import { describe, expect, it, vi } from "vitest";

import { RenderResumeUseCase } from "../../../src/use-cases/render-resume.use-case.js";
import { buildGenerationInput, buildResumeJson } from "../services/document-generation/support/document-generation.fixtures.js";

describe("RenderResumeUseCase", () => {
  it("loads ResumeJson, renders artifacts, and persists generated resume metadata", async () => {
    const input = buildGenerationInput();
    const render = vi.fn().mockResolvedValue({
      latexSource: "latex",
      artifactPaths: {
        directory: "storage/resumes/job_1/document_1",
        resumeJsonPath: "storage/resumes/job_1/document_1/resume.json",
        texPath: "storage/resumes/job_1/document_1/resume.tex",
        pdfPath: "storage/resumes/job_1/document_1/resume.pdf",
        metadataPath: "storage/resumes/job_1/document_1/metadata.json"
      },
      compiler: "mock"
    });
    const create = vi.fn().mockResolvedValue({
      id: "resume_1",
      jobId: "job_1",
      generatedDocumentId: "document_1",
      template: "ats",
      resumeJson: buildResumeJson(),
      latexSource: "latex",
      texPath: "storage/resumes/job_1/document_1/resume.tex",
      pdfPath: "storage/resumes/job_1/document_1/resume.pdf",
      metadataPath: "storage/resumes/job_1/document_1/metadata.json",
      compiler: "mock",
      createdAt: "2026-06-01T00:00:00.000Z"
    });
    const useCase = new RenderResumeUseCase(
      {
        create: vi.fn(),
        findById: vi.fn().mockResolvedValue({
          id: "document_1",
          jobId: "job_1",
          documentType: "resume_json",
          content: buildResumeJson(),
          prompt: "prompt",
          contextFragmentIds: ["fragment_1"],
          provider: "fake",
          model: "model",
          createdAt: "2026-06-01T00:00:00.000Z"
        })
      },
      { findDefault: vi.fn().mockResolvedValue(input.userProfile) },
      { render } as never,
      { create }
    );

    const result = await useCase.execute({ generatedDocumentId: "document_1", template: "ats" });

    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job_1",
        generatedDocumentId: "document_1",
        userProfile: input.userProfile,
        template: "ats"
      })
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job_1",
        generatedDocumentId: "document_1",
        template: "ats",
        compiler: "mock"
      })
    );
    expect(result.generatedResume.id).toBe("resume_1");
  });
});

