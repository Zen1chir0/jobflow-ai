import { describe, expect, it } from "vitest";

import { GenericStrategy } from "../../../../../src/services/ats/strategies/generic.strategy.js";
import { readAtsFixture, applicantProfile } from "../support/ats-fixtures.js";
import { FakeATSPageAdapter } from "../support/fake-ats-page-adapter.js";

describe("GenericStrategy", () => {
  it("fills only obvious generic fields and stops for review", async () => {
    const html = readAtsFixture("generic/basic-application.html");
    const adapter = new FakeATSPageAdapter(html, ["input[type='file']"]);
    const strategy = new GenericStrategy();

    const result = await strategy.execute({
      jobId: "job_1",
      applicationUrl: "https://careers.example.com/jobs/1",
      applicantProfile,
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      screeningAnswers: [{ question: "Why are you interested in this role?", answer: "It matches my testing experience." }],
      page: adapter
    });

    expect(result.atsType).toBe("generic");
    expect(result.status).toBe("HUMAN_APPROVAL_REQUIRED");
    expect(result.filledFields.map((field) => field.fieldKey)).toEqual(["first_name", "last_name", "email"]);
    expect(result.filledFields.every((field) => field.filled)).toBe(true);
    expect(adapter.filledFields.some((field) => String(field.candidate.value).includes("anything"))).toBe(false);
  });
});
