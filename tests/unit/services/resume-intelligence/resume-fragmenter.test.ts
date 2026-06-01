import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../../src/domain/errors/application-error.js";
import { ResumeFragmenter } from "../../../../src/services/resume-intelligence/resume-fragmenter.js";

describe("ResumeFragmenter", () => {
  it("normalizes one atomic fragment and preserves metadata", () => {
    const fragmenter = new ResumeFragmenter();

    const fragment = fragmenter.create(
      {
        fragmentText: "  Built   Playwright automation   framework. ",
        fragmentType: "project",
        sourceLabel: "FlowSentinel",
        metadata: { impact: "reduced manual testing" }
      },
      buildEmbedding()
    );

    expect(fragment).toEqual({
      fragmentText: "Built Playwright automation framework.",
      fragmentType: "project",
      sourceLabel: "FlowSentinel",
      metadata: { impact: "reduced manual testing" },
      embedding: buildEmbedding()
    });
  });

  it("rejects empty fragments and invalid embedding dimensions", () => {
    const fragmenter = new ResumeFragmenter();

    expect(() =>
      fragmenter.create(
        {
          fragmentText: " ",
          fragmentType: "skill"
        },
        buildEmbedding()
      )
    ).toThrow(ApplicationError);

    expect(() =>
      fragmenter.create(
        {
          fragmentText: "Built tests",
          fragmentType: "skill"
        },
        [0.1]
      )
    ).toThrow(ApplicationError);
  });
});

function buildEmbedding(): number[] {
  return Array.from({ length: 1536 }, () => 0.1);
}
