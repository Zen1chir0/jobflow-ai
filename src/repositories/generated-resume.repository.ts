import type { PostgrestError } from "@supabase/supabase-js";

import type { ResumeJson } from "../domain/documents/resume-json.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { GeneratedResume, NewGeneratedResume } from "../domain/resumes/rendered-resume.types.js";
import type { ResumeTemplate } from "../domain/resumes/resume-template.types.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type JsonObject = Record<string, unknown>;

export type GeneratedResumeRow = {
  id: string;
  job_id: string;
  generated_document_id: string | null;
  template: string;
  resume_json: JsonObject;
  latex_source: string;
  tex_path: string | null;
  pdf_path: string | null;
  metadata_path: string | null;
  compiler: string | null;
  created_at: string;
};

type GeneratedResumePayload = {
  job_id: string;
  generated_document_id: string;
  template: ResumeTemplate;
  resume_json: JsonObject;
  latex_source: string;
  tex_path: string;
  pdf_path: string;
  metadata_path: string;
  compiler: string;
};

type SupabaseSingleResult = {
  data: GeneratedResumeRow | null;
  error: PostgrestError | null;
};

type GeneratedResumeTableClient = {
  insert(payload: GeneratedResumePayload): {
    select(columns: string): {
      single(): Promise<SupabaseSingleResult>;
    };
  };
};

export type SupabaseGeneratedResumeClient = {
  from(table: "generated_resumes"): GeneratedResumeTableClient;
};

export interface GeneratedResumeRepository {
  create(resume: NewGeneratedResume): Promise<GeneratedResume>;
}

export class SupabaseGeneratedResumeRepository implements GeneratedResumeRepository {
  constructor(
    private readonly client: SupabaseGeneratedResumeClient =
      createSupabaseClient() as unknown as SupabaseGeneratedResumeClient
  ) {}

  async create(resume: NewGeneratedResume): Promise<GeneratedResume> {
    const result = await this.client.from("generated_resumes").insert(toPayload(resume)).select("*").single();

    if (result.error) {
      throw new ApplicationError("GENERATED_RESUME_REPOSITORY_ERROR", "Unable to create generated resume", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("GENERATED_RESUME_REPOSITORY_ERROR", "Generated resume create returned no data");
    }

    return fromRow(result.data);
  }
}

function toPayload(resume: NewGeneratedResume): GeneratedResumePayload {
  return {
    job_id: resume.jobId,
    generated_document_id: resume.generatedDocumentId,
    template: resume.template,
    resume_json: resume.resumeJson,
    latex_source: resume.latexSource,
    tex_path: resume.texPath,
    pdf_path: resume.pdfPath,
    metadata_path: resume.metadataPath,
    compiler: resume.compiler
  };
}

function fromRow(row: GeneratedResumeRow): GeneratedResume {
  return {
    id: row.id,
    jobId: row.job_id,
    generatedDocumentId: row.generated_document_id ?? "",
    template: row.template as ResumeTemplate,
    resumeJson: row.resume_json as unknown as ResumeJson,
    latexSource: row.latex_source,
    texPath: row.tex_path ?? "",
    pdfPath: row.pdf_path ?? "",
    metadataPath: row.metadata_path ?? "",
    compiler: row.compiler ?? "",
    createdAt: row.created_at
  };
}

