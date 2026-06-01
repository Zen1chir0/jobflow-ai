import { describe, expect, it } from "vitest";

import { loadEnv } from "../../../src/config/env.js";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";

describe("loadEnv", () => {
  it("loads required configuration with defaults", () => {
    const env = loadEnv({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "anon-key"
    });

    expect(env).toEqual({
      nodeEnv: "development",
      logLevel: "info",
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key"
    });
  });

  it("rejects missing required Supabase configuration", () => {
    expect(() => loadEnv({ SUPABASE_URL: "https://example.supabase.co" })).toThrow(ApplicationError);
  });

  it("rejects unsupported node environments", () => {
    expect(() =>
      loadEnv({
        NODE_ENV: "staging",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_ANON_KEY: "anon-key"
      })
    ).toThrow("Unsupported NODE_ENV: staging");
  });
});
