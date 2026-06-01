import type { PostgrestError } from "@supabase/supabase-js";

import { ApplicationError } from "../domain/errors/application-error.js";
import type {
  GeneratedDocument,
  GeneratedDocumentContent,
  GeneratedDocumentType,
  NewGeneratedDocument
} from "../domain/documents/generated-document.types.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type JsonObject = Record<string, unknown>;

export type GeneratedDocumentRow = {
  id: string;
  job_id: string;
  document_type: string;
  content: JsonObject;
  prompt: string | null;
  context_fragments: string[] | null;
  model: string | null;
  provider: string | null;
  created_at: string;
};

type GeneratedDocumentPayload = {
  job_id: string;
  document_type: GeneratedDocumentType;
  content: JsonObject;
  prompt: string;
  context_fragments: string[];
  model: string;
  provider: string;
};

type SupabaseSingleResult = {
  data: GeneratedDocumentRow | null;
  error: PostgrestError | null;
};

type GeneratedDocumentTableClient = {
  insert(payload: GeneratedDocumentPayload): {
    select(columns: string): {
      single(): Promise<SupabaseSingleResult>;
    };
  };
};

export type SupabaseGeneratedDocumentClient = {
  from(table: "generated_documents"): GeneratedDocumentTableClient;
};

export interface GeneratedDocumentRepository {
  create(document: NewGeneratedDocument): Promise<GeneratedDocument>;
}

export class SupabaseGeneratedDocumentRepository implements GeneratedDocumentRepository {
  constructor(
    private readonly client: SupabaseGeneratedDocumentClient =
      createSupabaseClient() as unknown as SupabaseGeneratedDocumentClient
  ) {}

  async create(document: NewGeneratedDocument): Promise<GeneratedDocument> {
    const result = await this.client
      .from("generated_documents")
      .insert(toPayload(document))
      .select("*")
      .single();

    if (result.error) {
      throw new ApplicationError("GENERATED_DOCUMENT_REPOSITORY_ERROR", "Unable to create generated document", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("GENERATED_DOCUMENT_REPOSITORY_ERROR", "Generated document create returned no data");
    }

    return fromRow(result.data);
  }
}

function toPayload(document: NewGeneratedDocument): GeneratedDocumentPayload {
  return {
    job_id: document.jobId,
    document_type: document.documentType,
    content: document.content,
    prompt: document.prompt,
    context_fragments: document.contextFragmentIds,
    model: document.model,
    provider: document.provider
  };
}

function fromRow(row: GeneratedDocumentRow): GeneratedDocument {
  return {
    id: row.id,
    jobId: row.job_id,
    documentType: row.document_type as GeneratedDocumentType,
    content: toGeneratedDocumentContent(row.content),
    prompt: row.prompt ?? "",
    contextFragmentIds: row.context_fragments ?? [],
    model: row.model ?? "",
    provider: row.provider ?? "",
    createdAt: row.created_at
  };
}

function toGeneratedDocumentContent(content: JsonObject): GeneratedDocumentContent {
  return content as unknown as GeneratedDocumentContent;
}
