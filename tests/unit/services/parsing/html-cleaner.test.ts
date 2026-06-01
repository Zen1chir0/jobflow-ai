import { describe, expect, it } from "vitest";

import { HtmlCleaner } from "../../../../src/services/parsing/html-cleaner.js";

describe("HtmlCleaner", () => {
  it("removes tags, scripts, and styles while preserving readable text", () => {
    const cleaner = new HtmlCleaner();

    const result = cleaner.clean("<style>.x{}</style><h2>Role</h2><p>Build &amp; maintain tests.</p><script>x()</script>");

    expect(result).toContain("Role");
    expect(result).toContain("Build & maintain tests.");
    expect(result).not.toContain("script");
    expect(result).not.toContain(".x");
  });
});
