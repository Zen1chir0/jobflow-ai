import { describe, expect, it } from "vitest";

import { loadEnv } from "../../../src/config/env.js";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";

describe("loadEnv", () => {
  it("loads required configuration with defaults", () => {
    const env = loadEnv(buildEnvSource());

    expect(env).toEqual({
      nodeEnv: "development",
      logLevel: "info",
      supabaseUrl: "https://example.supabase.co/",
      supabaseAnonKey: "fake-anon-key",
      supabaseServiceRoleKey: "fake-service-role-key",
      llmProvider: "fake-provider",
      llmBaseUrl: "https://llm.example.test/v1",
      llmApiKey: "fake-llm-api-key",
      llmModel: "fake-model"
    });
  });

  it("rejects missing required Supabase configuration", () => {
    expect(() =>
      loadEnv({
        ...buildEnvSource(),
        SUPABASE_ANON_KEY: undefined
      })
    ).toThrow(ApplicationError);
  });

  it("rejects unsupported node environments", () => {
    expect(() =>
      loadEnv({
        ...buildEnvSource(),
        NODE_ENV: "staging"
      })
    ).toThrow("Unsupported NODE_ENV: staging");
  });

  it("loads provider-agnostic LLM configuration", () => {
    const env = loadEnv({
      ...buildEnvSource(),
      LLM_PROVIDER: "asi-cloud",
      LLM_BASE_URL: "https://inference.example.test/v1",
      LLM_API_KEY: "fake-asi-cloud-key",
      LLM_MODEL: "openai/gpt-oss-120b"
    });

    expect(env.llmProvider).toBe("asi-cloud");
    expect(env.llmBaseUrl).toBe("https://inference.example.test/v1");
    expect(env.llmApiKey).toBe("fake-asi-cloud-key");
    expect(env.llmModel).toBe("openai/gpt-oss-120b");
  });

  it("rejects invalid URLs without exposing the invalid value", () => {
    expect(() =>
      loadEnv({
        ...buildEnvSource(),
        LLM_BASE_URL: "fake-secret-invalid-url"
      })
    ).toThrow("LLM_BASE_URL must be a valid URL");

    try {
      loadEnv({
        ...buildEnvSource(),
        LLM_BASE_URL: "fake-secret-invalid-url"
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as Error).message).not.toContain("fake-secret-invalid-url");
    }
  });
});

function buildEnvSource() {
  return {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "fake-anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "fake-service-role-key",
    LLM_PROVIDER: "fake-provider",
    LLM_BASE_URL: "https://llm.example.test/v1",
    LLM_API_KEY: "fake-llm-api-key",
    LLM_MODEL: "fake-model"
  };
}
