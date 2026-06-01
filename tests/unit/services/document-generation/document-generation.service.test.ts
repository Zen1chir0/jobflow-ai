import { describe, expect, it, vi } from "vitest";

import { DocumentGenerationService } from "../../../../src/services/document-generation/document-generation.service.js";
import { buildGenerationInput, buildResumeJson } from "./support/document-generation.fixtures.js";

describe("DocumentGenerationService", () => {
  it("generates, validates, guards, and returns structured artifacts", async () => {
    const provider = {
      generateStructured: vi.fn().mockResolvedValue({
        content: { resumeJson: buildResumeJson() },
        provider: "fake-provider",
        model: "fake-model"
      })
    };
    const service = new DocumentGenerationService(provider);

    const result = await service.generate("resume_json", buildGenerationInput());

    expect(provider.generateStructured).toHaveBeenCalledWith(
      expect.objectContaining({
        responseSchemaName: "ResumeJson"
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        documentType: "resume_json",
        provider: "fake-provider",
        model: "fake-model",
        contextFragmentIds: ["fragment_1"]
      })
    );
  });
});
