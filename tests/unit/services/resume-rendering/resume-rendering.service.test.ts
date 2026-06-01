import { describe, expect, it, vi } from "vitest";

import { ResumeRenderingService } from "../../../../src/services/resume-rendering/resume-rendering.service.js";
import { buildGenerationInput, buildResumeJson } from "../document-generation/support/document-generation.fixtures.js";

describe("ResumeRenderingService", () => {
  it("renders, stores artifacts, and compiles through the PDF compiler boundary", async () => {
    const compile = vi.fn().mockResolvedValue({ pdfPath: "storage/resumes/job_1/document_1/resume.pdf", compiler: "mock" });
    const writeArtifacts = vi.fn().mockResolvedValue(undefined);
    const service = new ResumeRenderingService(
      { name: "mock", compile },
      { select: vi.fn().mockReturnValue("{{HEADER}}\n{{SUMMARY}}\n{{SKILLS}}\n{{EXPERIENCE}}\n{{PROJECTS}}\n{{EDUCATION}}\n{{CERTIFICATIONS}}") } as never,
      undefined,
      { build: vi.fn().mockReturnValue({
        directory: "storage/resumes/job_1/document_1",
        resumeJsonPath: "storage/resumes/job_1/document_1/resume.json",
        texPath: "storage/resumes/job_1/document_1/resume.tex",
        pdfPath: "storage/resumes/job_1/document_1/resume.pdf",
        metadataPath: "storage/resumes/job_1/document_1/metadata.json"
      }) } as never,
      { writeArtifacts }
    );

    const result = await service.render({
      jobId: "job_1",
      generatedDocumentId: "document_1",
      resumeJson: buildResumeJson(),
      userProfile: buildGenerationInput().userProfile,
      template: "ats"
    });

    expect(writeArtifacts).toHaveBeenCalled();
    expect(compile).toHaveBeenCalledWith(
      expect.objectContaining({
        texPath: "storage/resumes/job_1/document_1/resume.tex"
      })
    );
    expect(result.compiler).toBe("mock");
  });
});
