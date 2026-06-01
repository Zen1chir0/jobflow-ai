import { describe, expect, it, vi } from "vitest";

import { OpenAICompatibleEmbeddingProvider } from "../../../src/integrations/embeddings/openai-compatible-embedding.provider.js";

describe("OpenAICompatibleEmbeddingProvider", () => {
  it("calls the configured OpenAI-compatible embeddings endpoint without hardcoded provider values", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ embedding: [0.1, 0.2] }]
        })
    });
    const provider = new OpenAICompatibleEmbeddingProvider(
      {
        provider: "test-provider",
        baseUrl: "https://example.test/v1",
        apiKey: "fake-api-key",
        model: "test-embedding-model"
      },
      fetchImpl
    );

    const embedding = await provider.embed("Build tests");

    expect(embedding).toEqual([0.1, 0.2]);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.test/v1/embeddings",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          model: "test-embedding-model",
          input: "Build tests"
        })
      })
    );
  });
});
