import { describe, expect, it } from "vitest";

import { GreenhouseStrategy } from "../../../../../src/services/ats/strategies/greenhouse.strategy.js";
import { readAtsFixture, applicantProfile } from "../support/ats-fixtures.js";
import { FakeATSPageAdapter } from "../support/fake-ats-page-adapter.js";

describe("GreenhouseStrategy", () => {
  it("fills Greenhouse mock fields, uploads resume, answers safe questions, and stops for review", async () => {
    const html = readAtsFixture("greenhouse/basic-application.html");
    const adapter = new FakeATSPageAdapter(html, [
      "job_application[first_name]",
      "job_application[last_name]",
      "job_application[email]",
      "job_application[phone]",
      "job_application[resume]"
    ]);
    const strategy = new GreenhouseStrategy();

    const result = await strategy.execute({
      jobId: "job_1",
      applicationUrl: "https://boards.greenhouse.io/example/jobs/1",
      applicantProfile,
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      screeningAnswers: [{ question: "Why are you interested in this role?", answer: "Strong match." }],
      page: adapter
    });

    expect(result.status).toBe("HUMAN_APPROVAL_REQUIRED");
    expect(result.filledFields.filter((field) => field.filled)).toHaveLength(4);
    expect(result.resumeUpload.uploaded).toBe(true);
    expect(result.screeningQuestions).toEqual([
      { question: "Why are you interested in this role?", answered: true, reason: "matched" }
    ]);
    expect(adapter.filledFields.some((field) => /submit/i.test(String(field.candidate.value)))).toBe(false);
  });
});
