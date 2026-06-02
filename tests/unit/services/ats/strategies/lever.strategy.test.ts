import { describe, expect, it } from "vitest";

import { LeverStrategy } from "../../../../../src/services/ats/strategies/lever.strategy.js";
import { readAtsFixture, applicantProfile } from "../support/ats-fixtures.js";
import { FakeATSPageAdapter } from "../support/fake-ats-page-adapter.js";

describe("LeverStrategy", () => {
  it("fills Lever mock fields, verifies resume upload, and stops for review", async () => {
    const html = readAtsFixture("lever/basic-application.html");
    const adapter = new FakeATSPageAdapter(html, ["input[type='file']"]);
    const strategy = new LeverStrategy();

    const result = await strategy.execute({
      jobId: "job_1",
      applicationUrl: "https://jobs.lever.co/example/1",
      applicantProfile,
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      screeningAnswers: [{ question: "Why are you interested in Example Co?", answer: "The mission fits." }],
      page: adapter
    });

    expect(result.atsType).toBe("lever");
    expect(result.status).toBe("HUMAN_APPROVAL_REQUIRED");
    expect(result.filledFields.filter((field) => field.filled)).toHaveLength(4);
    expect(result.resumeUpload).toEqual({ uploaded: true, fileName: "resume.pdf" });
    expect(result.screeningQuestions[0]?.answered).toBe(true);
  });
});
