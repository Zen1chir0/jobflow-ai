import { describe, expect, it } from "vitest";

import { WorkdayPageStateDetector } from "../../../../../src/services/ats/workday/workday-page-state-detector.js";
import { FakeATSPageAdapter } from "../support/fake-ats-page-adapter.js";
import { readAtsFixture } from "../support/ats-fixtures.js";

describe("WorkdayPageStateDetector", () => {
  it("detects Workday page states from local fixtures", async () => {
    const detector = new WorkdayPageStateDetector();

    await expect(
      detector.detectCurrentState(new FakeATSPageAdapter(readAtsFixture("workday/login-required.html"), []))
    ).resolves.toBe("LOGIN_REQUIRED");
    await expect(
      detector.detectCurrentState(new FakeATSPageAdapter(readAtsFixture("workday/personal-info.html"), []))
    ).resolves.toBe("PERSONAL_INFO");
    await expect(
      detector.detectCurrentState(new FakeATSPageAdapter(readAtsFixture("workday/document-upload.html"), []))
    ).resolves.toBe("DOCUMENT_UPLOAD");
    await expect(
      detector.detectCurrentState(new FakeATSPageAdapter(readAtsFixture("workday/screening.html"), []))
    ).resolves.toBe("SCREENING");
    await expect(
      detector.detectCurrentState(new FakeATSPageAdapter(readAtsFixture("workday/review.html"), []))
    ).resolves.toBe("REVIEW");
  });

  it("fails safely when no Workday state is detectable", async () => {
    const detector = new WorkdayPageStateDetector();
    const adapter = new FakeATSPageAdapter("<main>Unknown Workday content</main>", []);

    await expect(detector.detectCurrentState(adapter)).rejects.toMatchObject({ code: "WORKDAY_STATE_NOT_DETECTED" });
  });
});
