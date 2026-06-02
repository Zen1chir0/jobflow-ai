import { describe, expect, it } from "vitest";

import { WorkdayStrategy } from "../../../../../src/services/ats/strategies/workday.strategy.js";
import { applicantProfile, readAtsFixture } from "../support/ats-fixtures.js";
import { FakeATSPageAdapter } from "../support/fake-ats-page-adapter.js";

describe("WorkdayStrategy", () => {
  it("detects Workday URLs", () => {
    const strategy = new WorkdayStrategy();

    expect(strategy.detect({ url: "https://company.wd1.myworkdaysite.com/recruiting/job/123" })).toBe(true);
  });

  it("detects current state, records checkpoint, and stops without automatic progression", async () => {
    const strategy = new WorkdayStrategy();
    const adapter = new FakeATSPageAdapter(readAtsFixture("workday/personal-info.html"), []);

    const result = await strategy.execute({
      jobId: "job_1",
      applicationUrl: "https://company.myworkdayjobs.com/job/123",
      applicantProfile,
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      page: adapter
    });

    expect(result.status).toBe("HUMAN_APPROVAL_REQUIRED");
    expect(result.message).toContain("PERSONAL_INFO");
    expect(result.filledFields).toEqual([]);
    expect(result.resumeUpload.uploaded).toBe(false);
    expect(result.screeningQuestions).toEqual([]);
    expect(result.checkpoint).toMatchObject({
      atsType: "workday",
      jobId: "job_1",
      currentState: "PERSONAL_INFO",
      allowedNextStates: ["EXPERIENCE"],
      requiresHumanApproval: true
    });
  });
});
