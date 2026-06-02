import { describe, expect, it } from "vitest";

import { ATSAutomationService } from "../../../../src/services/ats/ats-automation.service.js";
import { ATSStrategyRegistry } from "../../../../src/services/ats/ats-strategy-registry.js";
import { GreenhouseStrategy } from "../../../../src/services/ats/strategies/greenhouse.strategy.js";
import { GenericStrategy } from "../../../../src/services/ats/strategies/generic.strategy.js";
import { readAtsFixture, applicantProfile } from "./support/ats-fixtures.js";
import { FakeATSPageAdapter } from "./support/fake-ats-page-adapter.js";

describe("ATSAutomationService", () => {
  it("resolves a strategy and executes through the adapter boundary", async () => {
    const html = readAtsFixture("greenhouse/basic-application.html");
    const adapter = new FakeATSPageAdapter(html, ["job_application[resume]"]);
    const service = new ATSAutomationService(new ATSStrategyRegistry([new GreenhouseStrategy(), new GenericStrategy()]));

    const result = await service.execute({
      jobId: "job_1",
      applicationUrl: "https://boards.greenhouse.io/example/jobs/1",
      applicantProfile,
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      screeningAnswers: [],
      page: adapter
    });

    expect(result.atsType).toBe("greenhouse");
    expect(result.status).toBe("HUMAN_APPROVAL_REQUIRED");
    expect(result.requiresHumanApproval).toBe(true);
  });
});
