import { describe, expect, it } from "vitest";

import type { ResumeFragment } from "../../../../src/domain/resumes/resume-fragment.types.js";
import { PromptContextBuilder } from "../../../../src/services/resume-intelligence/prompt-context-builder.js";

describe("PromptContextBuilder", () => {
  it("deduplicates fragments and orders by similarity", () => {
    const builder = new PromptContextBuilder();

    const context = builder.build([
      buildFragment("fragment_1", "Built Playwright framework.", "project", 0.8),
      buildFragment("fragment_2", "Led QA automation work.", "leadership", 0.95),
      buildFragment("fragment_3", "built playwright framework.", "project", 0.7)
    ]);

    expect(context).toBe(
      "- [leadership] Led QA automation work.\n- [project] Built Playwright framework."
    );
  });
});

function buildFragment(
  id: string,
  fragmentText: string,
  fragmentType: ResumeFragment["fragmentType"],
  similarity: number
): ResumeFragment {
  return {
    id,
    fragmentText,
    fragmentType,
    metadata: {},
    embedding: [],
    similarity
  };
}
