import { describe, expect, it, vi } from "vitest";

import { buildCli } from "../../src/cli/index.js";

describe("jobflow health command", () => {
  it("validates runtime config and displays readiness", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "fake-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "fake-service-role-key");
    vi.stubEnv("LLM_PROVIDER", "fake-provider");
    vi.stubEnv("LLM_BASE_URL", "https://llm.example.test/v1");
    vi.stubEnv("LLM_API_KEY", "fake-llm-api-key");
    vi.stubEnv("LLM_MODEL", "fake-model");

    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const program = buildCli();

    await program.parseAsync(["health"], {
      from: "user"
    });

    expect(output).toHaveBeenCalledWith("JobFlow AI ready (test)");
  });
});
