import { describe, expect, it } from "vitest";

import type { Job } from "../../../../src/domain/jobs/job.types.js";
import { HtmlCleaner } from "../../../../src/services/parsing/html-cleaner.js";
import { JobParsingService } from "../../../../src/services/parsing/job-parsing.service.js";
import { SalaryParser } from "../../../../src/services/parsing/salary-parser.js";
import { SectionExtractor } from "../../../../src/services/parsing/section-extractor.js";
import { SeniorityExtractor } from "../../../../src/services/parsing/seniority-extractor.js";
import { SkillExtractor } from "../../../../src/services/parsing/skill-extractor.js";

describe("JobParsingService", () => {
  it("builds a parsed job profile without calling live embedding providers", () => {
    const service = new JobParsingService(
      new HtmlCleaner(),
      new SectionExtractor(),
      new SkillExtractor(),
      new SalaryParser(),
      new SeniorityExtractor()
    );

    const profile = service.parse(buildJob());

    expect(profile).toMatchObject({
      jobId: "job_1",
      responsibilities: ["Build test automation"],
      requiredSkills: ["Playwright", "TypeScript"],
      preferredSkills: ["Supabase"],
      seniority: "senior",
      compensation: {
        min: 80000,
        max: 120000,
        currency: "PHP"
      }
    });
    expect(profile.embedding).toBeUndefined();
    expect(profile.rawMetadata.descriptionClean).toEqual(expect.stringContaining("Responsibilities"));
  });
});

function buildJob(): Job {
  return {
    id: "job_1",
    source: "manual",
    title: "Senior QA Automation Engineer",
    company: "Example Co",
    remoteType: "remote",
    descriptionRaw: `
<h2>Responsibilities</h2>
<ul><li>Build test automation</li></ul>
<h2>Requirements</h2>
<p>TypeScript and Playwright</p>
<h2>Preferred</h2>
<p>Supabase</p>
<h2>Benefits</h2>
<p>PHP 80000 - 120000</p>
`,
    applicationUrl: "https://example.com/jobs/1",
    atsType: "unknown",
    discoveredAt: "2026-06-01T00:00:00.000Z"
  };
}
