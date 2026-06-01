import { describe, expect, it } from "vitest";

import { createSupabaseClient } from "../../../src/integrations/supabase/supabase.client.js";

describe("createSupabaseClient", () => {
  it("creates a Supabase client shell from typed environment config", () => {
    const client = createSupabaseClient({
      nodeEnv: "test",
      logLevel: "silent",
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "fake-anon-key",
      supabaseServiceRoleKey: "fake-service-role-key",
      llmProvider: "fake-provider",
      llmBaseUrl: "https://llm.example.test/v1",
      llmApiKey: "fake-llm-api-key",
      llmModel: "fake-model"
    });

    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });
});
