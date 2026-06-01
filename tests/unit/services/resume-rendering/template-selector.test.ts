import { describe, expect, it } from "vitest";

import { TemplateSelector } from "../../../../src/services/resume-rendering/template-selector.js";

describe("TemplateSelector", () => {
  it("selects supported templates", () => {
    const selector = new TemplateSelector({ ats: "template" });

    expect(selector.select("ats")).toBe("template");
  });
});

