import { describe, expect, it } from "vitest";

import { createSupabaseClient } from "../../../src/integrations/supabase/supabase.client";

describe("createSupabaseClient", () => {
  it("creates a Supabase client shell from typed environment config", () => {
    const client = createSupabaseClient({
      nodeEnv: "test",
      logLevel: "silent",
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key"
    });

    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });
});
