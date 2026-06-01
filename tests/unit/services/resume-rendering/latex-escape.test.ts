import { describe, expect, it } from "vitest";

import { escapeLatex } from "../../../../src/services/resume-rendering/latex-escape.js";

describe("escapeLatex", () => {
  it("escapes LaTeX special characters", () => {
    expect(escapeLatex("A&B 100% $x #1_name {ok} ~ ^ \\")).toBe(
      "A\\&B 100\\% \\$x \\#1\\_name \\{ok\\} \\textasciitilde{} \\textasciicircum{} \\textbackslash{}"
    );
  });
});
