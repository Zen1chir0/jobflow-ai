import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../../src/domain/errors/application-error.js";
import { JobNormalizer } from "../../../../src/services/discovery/normalizers/job-normalizer.js";

describe("JobNormalizer", () => {
  it("normalizes raw crawler output into a new job record", () => {
    const normalizer = new JobNormalizer();

    const job = normalizer.normalize({
      source: "manual",
      title: "  QA   Automation Engineer ",
      company: " Example   Co ",
      location: "Remote - Philippines",
      descriptionRaw: " Build reliable tests. ",
      applicationUrl: "https://boards.greenhouse.io/example/jobs/123?b=2&a=1#section",
      salaryRaw: "PHP 80,000"
    });

    expect(typeof job.discoveredAt).toBe("string");
    expect(job).toMatchObject({
      source: "manual",
      title: "QA Automation Engineer",
      company: "Example Co",
      location: "Remote - Philippines",
      remoteType: "remote",
      descriptionRaw: "Build reliable tests.",
      applicationUrl: "https://boards.greenhouse.io/example/jobs/123?a=1&b=2",
      atsType: "greenhouse",
      salaryRaw: "PHP 80,000"
    });
  });

  it("rejects invalid required job data", () => {
    const normalizer = new JobNormalizer();

    expect(() =>
      normalizer.normalize({
        source: "manual",
        title: "",
        company: "Example Co",
        descriptionRaw: "Description",
        applicationUrl: "https://example.com/jobs/1"
      })
    ).toThrow(ApplicationError);
  });

  it("infers known ATS types deterministically from URL", () => {
    const normalizer = new JobNormalizer();

    expect(
      normalizer.normalize({
        source: "manual",
        title: "Engineer",
        company: "Lever Co",
        descriptionRaw: "Description",
        applicationUrl: "https://jobs.lever.co/example/123"
      }).atsType
    ).toBe("lever");

    expect(
      normalizer.normalize({
        source: "manual",
        title: "Engineer",
        company: "Workday Co",
        descriptionRaw: "Description",
        applicationUrl: "https://example.wd1.myworkdaysite.com/recruiting/job/123"
      }).atsType
    ).toBe("workday");
  });
});
