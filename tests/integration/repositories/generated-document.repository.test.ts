import { describe, expect, it } from "vitest";

import {
  SupabaseGeneratedDocumentRepository,
  type GeneratedDocumentRow
} from "../../../src/repositories/generated-document.repository.js";

describe("SupabaseGeneratedDocumentRepository", () => {
  it("creates generated documents through the generated_documents table", async () => {
    const client = createFakeClient(buildRow());
    const repository = new SupabaseGeneratedDocumentRepository(client);

    const document = await repository.create({
      jobId: "job_1",
      documentType: "resume_json",
      content: { summary: { text: "Built tests.", evidenceFragmentIds: ["fragment_1"] } } as never,
      prompt: "safe prompt",
      contextFragmentIds: ["fragment_1"],
      provider: "fake-provider",
      model: "fake-model"
    });

    expect(client.lastTable).toBe("generated_documents");
    expect(client.lastPayload).toEqual({
      job_id: "job_1",
      document_type: "resume_json",
      content: { summary: { text: "Built tests.", evidenceFragmentIds: ["fragment_1"] } },
      prompt: "safe prompt",
      context_fragments: ["fragment_1"],
      provider: "fake-provider",
      model: "fake-model"
    });
    expect(document).toEqual(
      expect.objectContaining({
        id: "document_1",
        jobId: "job_1",
        documentType: "resume_json",
        contextFragmentIds: ["fragment_1"]
      })
    );
  });
});

function buildRow(): GeneratedDocumentRow {
  return {
    id: "document_1",
    job_id: "job_1",
    document_type: "resume_json",
    content: { summary: { text: "Built tests.", evidenceFragmentIds: ["fragment_1"] } },
    prompt: "safe prompt",
    context_fragments: ["fragment_1"],
    provider: "fake-provider",
    model: "fake-model",
    created_at: "2026-06-01T00:00:00.000Z"
  };
}

function createFakeClient(row: GeneratedDocumentRow | null) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    from(table: "generated_documents") {
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

