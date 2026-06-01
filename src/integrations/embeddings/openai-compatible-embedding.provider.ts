import { loadEnv } from "../../config/env.js";
import { ApplicationError } from "../../domain/errors/application-error.js";
import type { EmbeddingProvider, EmbeddingProviderConfig } from "./embedding-provider.interface.js";

type EmbeddingResponse = {
  data?: Array<{
    embedding?: unknown;
  }>;
};

type FetchLike = typeof fetch;

export class OpenAICompatibleEmbeddingProvider implements EmbeddingProvider {
  constructor(
    private readonly config: EmbeddingProviderConfig = toEmbeddingConfig(),
    private readonly fetchImpl: FetchLike = fetch
  ) {}

  async embed(input: string): Promise<number[]> {
    const normalizedInput = input.trim();

    if (!normalizedInput) {
      throw new ApplicationError("EMBEDDING_PROVIDER_ERROR", "Embedding input is required");
    }

    const response = await this.fetchImpl(buildEmbeddingsUrl(this.config.baseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        input: normalizedInput
      })
    });

    if (!response.ok) {
      throw new ApplicationError(
        "EMBEDDING_PROVIDER_ERROR",
        `Embedding provider request failed for provider ${this.config.provider}`
      );
    }

    const payload = (await response.json()) as EmbeddingResponse;
    const embedding = payload.data?.[0]?.embedding;

    if (!isNumberArray(embedding)) {
      throw new ApplicationError("EMBEDDING_PROVIDER_ERROR", "Embedding provider returned an invalid vector");
    }

    return embedding;
  }
}

function toEmbeddingConfig(): EmbeddingProviderConfig {
  const env = loadEnv();

  return {
    provider: env.llmProvider,
    baseUrl: env.llmBaseUrl,
    apiKey: env.llmApiKey,
    model: env.llmModel
  };
}

function buildEmbeddingsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/embeddings`;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
}
