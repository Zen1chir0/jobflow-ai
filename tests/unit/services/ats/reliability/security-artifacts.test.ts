import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("ATS reliability artifact security", () => {
  it("keeps screenshot and session storage paths ignored by git", () => {
    const gitignore = readFileSync(".gitignore", "utf8");

    expect(gitignore).toContain("storage/screenshots/");
    expect(gitignore).toContain("storage/playwright-state/");
  });
});
