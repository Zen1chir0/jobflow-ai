import { describe, expect, it } from "vitest";

import {
  SupabaseGeneratedResumeRepository,
  type GeneratedResumeRow
} from "../../../src/repositories/generated-resume.repository.js";
import { buildResumeJson } from "../../unit/services/document-generation/support/document-generation.fixtures.js";

describe("SupabaseGeneratedResumeRepository", () => {
  it("creates rendered resume records through the generated_resumes table", async () => {
    const client = createFakeClient(buildRow());
    const repository = new SupabaseGeneratedResumeRepository(client);

    const generatedResume = await repository.create({
      jobId: "job_1",
      generatedDocumentId: "document_1",
      template: "ats",
      resumeJson: buildResumeJson(),
      latexSource: "latex",
      texPath: "storage/resumes/job_1/document_1/resume.tex",
      pdfPath: "storage/resumes/job_1/document_1/resume.pdf",
      metadataPath: "storage/resumes/job_1/document_1/metadata.json",
      compiler: "latexmk"
    });

    expect(client.lastTable).toBe("generated_resumes");
    expect(client.lastPayload).toEqual(
      expect.objectContaining({
        job_id: "job_1",
        generated_document_id: "document_1",
        template: "ats",
        latex_source: "latex",
        compiler: "latexmk"
      })
    );
    expect(generatedResume).toEqual(
      expect.objectContaining({
        id: "resume_1",
        jobId: "job_1",
        generatedDocumentId: "document_1",
        template: "ats"
      })
    );
  });
});

function buildRow(): GeneratedResumeRow {
  return {
    id: "resume_1",
    job_id: "job_1",
    generated_document_id: "document_1",
    template: "ats",
    resume_json: buildResumeJson(),
    latex_source: "latex",
    tex_path: "storage/resumes/job_1/document_1/resume.tex",
    pdf_path: "storage/resumes/job_1/document_1/resume.pdf",
    metadata_path: "storage/resumes/job_1/document_1/metadata.json",
    compiler: "latexmk",
    created_at: "2026-06-01T00:00:00.000Z"
  };
}

function createFakeClient(row: GeneratedResumeRow | null) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    from(table: "generated_resumes") {
      this.lastTable = table;

      return {
        insert: (payload: unknown) => {
          this.lastPayload = payload;

          return {
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: row,
                  error: null
                })
            })
          };
        }
      };
    }
  };
}

