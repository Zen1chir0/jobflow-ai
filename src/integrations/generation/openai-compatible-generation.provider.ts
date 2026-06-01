import { loadEnv } from "../../config/env.js";
import { ApplicationError } from "../../domain/errors/application-error.js";
import type {
  GenerationProvider,
  GenerationProviderConfig,
  GenerationRequest,
  GenerationResponse
} from "./generation-provider.interface.js";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

type FetchLike = typeof fetch;

export class OpenAICompatibleGenerationProvider implements GenerationProvider {
  constructor(
    private readonly config: GenerationProviderConfig = toGenerationConfig(),
    private readonly fetchImpl: FetchLike = fetch
  ) {}

  async generateStructured(request: GenerationRequest): Promise<GenerationResponse> {
    const response = await this.fetchImpl(buildChatCompletionsUrl(this.config.baseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new ApplicationError(
        "GENERATION_PROVIDER_ERROR",
        `Generation provider request failed for provider ${this.config.provider}`
      );
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const rawContent = payload.choices?.[0]?.message?.content;

    return {
      content: parseProviderContent(rawContent),
      provider: this.config.provider,
      model: this.config.model
    };
  }
}

function toGenerationConfig(): GenerationProviderConfig {
  const env = loadEnv();

  return {
    provider: env.llmProvider,
    baseUrl: env.llmBaseUrl,
    apiKey: env.llmApiKey,
    model: env.llmModel
  };
}

function buildChatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/chat/completions`;
}

function parseProviderContent(content: unknown): unknown {
  if (typeof content !== "string") {
    throw new ApplicationError("GENERATION_PROVIDER_ERROR", "Generation provider returned invalid content");
  }

  try {
    return JSON.parse(content) as unknown;
  } catch (error) {
    throw new ApplicationError("GENERATION_PROVIDER_ERROR", "Generation provider returned non-JSON content", {
      cause: error
    });
  }
}

