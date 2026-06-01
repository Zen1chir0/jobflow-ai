import { describe, expect, it, vi } from "vitest";

import { buildCli } from "../../src/cli/index";

describe("jobflow health command", () => {
  it("validates runtime config and displays readiness", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");

    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const program = buildCli();

    await program.parseAsync(["health"], {
      from: "user"
    });

    expect(output).toHaveBeenCalledWith("JobFlow AI ready (test)");
  });
});
