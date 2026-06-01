import { describe, expect, it, vi } from "vitest";

import { OpenAICompatibleGenerationProvider } from "../../../src/integrations/generation/openai-compatible-generation.provider.js";

describe("OpenAICompatibleGenerationProvider", () => {
  it("calls the configured OpenAI-compatible chat endpoint without hardcoded provider values", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: JSON.stringify({ resumeJson: { summary: "ok" } }) } }]
        })
    });
    const provider = new OpenAICompatibleGenerationProvider(
      {
        provider: "test-provider",
        baseUrl: "https://example.test/v1",
        apiKey: "fake-api-key",
        model: "test-generation-model"
      },
      fetchImpl
    );

    const response = await provider.generateStructured({
      systemPrompt: "System",
      userPrompt: "User",
      responseSchemaName: "ResumeJson"
    });

    expect(response).toEqual({
      content: { resumeJson: { summary: "ok" } },
      provider: "test-provider",
      model: "test-generation-model"
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.test/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          model: "test-generation-model",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "System" },
            { role: "user", content: "User" }
          ]
        })
      })
    );
  });
});

