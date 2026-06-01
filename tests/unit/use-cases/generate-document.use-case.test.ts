import { describe, expect, it, vi } from "vitest";

import { GenerateResumeJsonUseCase } from "../../../src/use-cases/generate-resume-json.use-case.js";
import { buildGenerationInput, buildResumeJson } from "../services/document-generation/support/document-generation.fixtures.js";

describe("GenerateResumeJsonUseCase", () => {
  it("loads required inputs, retrieves context, generates, and stores a document", async () => {
    const input = buildGenerationInput();
    const retrieveContext = vi.fn().mockResolvedValue(input.resumeContext);
    const generate = vi.fn().mockResolvedValue({
      documentType: "resume_json",
      content: buildResumeJson(),
      prompt: "safe prompt",
      contextFragmentIds: ["fragment_1"],
      provider: "fake-provider",
      model: "fake-model"
    });
    const create = vi.fn().mockResolvedValue({
      id: "document_1",
      jobId: "job_1",
      documentType: "resume_json",
      content: buildResumeJson(),
      prompt: "safe prompt",
      contextFragmentIds: ["fragment_1"],
      provider: "fake-provider",
      model: "fake-model",
      createdAt: "2026-06-01T00:00:00.000Z"
    });
    const useCase = new GenerateResumeJsonUseCase(
      { upsert: vi.fn(), findById: vi.fn().mockResolvedValue(input.job), findUnparsed: vi.fn(), markParsed: vi.fn() },
      { upsert: vi.fn(), findByJobId: vi.fn().mockResolvedValue(input.parsedJobProfile) },
      { upsert: vi.fn(), findByJobId: vi.fn().mockResolvedValue(input.matchScore) },
      { findDefault: vi.fn().mockResolvedValue(input.userProfile) },
      { createFragment: vi.fn(), retrieveContext } as never,
      { generate } as never,
      { create, findById: vi.fn() }
    );

    const result = await useCase.execute({ jobId: "job_1", topK: 3, threshold: 0.8 });

    expect(retrieveContext).toHaveBeenCalledWith(input.parsedJobProfile, { topK: 3, threshold: 0.8 });
    expect(generate).toHaveBeenCalledWith("resume_json", expect.objectContaining({ resumeContext: input.resumeContext }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job_1",
        documentType: "resume_json",
        contextFragmentIds: ["fragment_1"]
      })
    );
    expect(result.document.id).toBe("document_1");
  });
});
