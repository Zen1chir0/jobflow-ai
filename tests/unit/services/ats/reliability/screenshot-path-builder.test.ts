import { describe, expect, it } from "vitest";

import { ScreenshotPathBuilder } from "../../../../../src/services/ats/reliability/screenshot-path-builder.js";

describe("ScreenshotPathBuilder", () => {
  it("builds screenshot paths under ignored local storage", () => {
    const builder = new ScreenshotPathBuilder();

    expect(builder.build({ executionId: "exec_1", atsType: "workday", step: "upload_resume" })).toBe(
      "storage/screenshots/exec_1_workday_upload_resume.png"
    );
  });

  it("rejects traversal-like screenshot path segments", () => {
    const builder = new ScreenshotPathBuilder();

    expect(() => builder.build({ executionId: "../exec", atsType: "workday", step: "upload_resume" })).toThrow(
      "Invalid screenshot path segment"
    );
  });
});
