import { describe, expect, it, vi } from "vitest";

import { AutofillApplicationUseCase } from "../../../src/use-cases/autofill-application.use-case.js";
import { applicantProfile } from "../services/ats/support/ats-fixtures.js";
import { FakeATSPageAdapter } from "../services/ats/support/fake-ats-page-adapter.js";

describe("AutofillApplicationUseCase", () => {
  it("builds a Phase 7A foundation plan without live ATS automation", async () => {
    const useCase = new AutofillApplicationUseCase();

    const result = await useCase.execute({
      jobId: "job_1",
      applicationUrl: "https://jobs.lever.co/example/1",
      resumePdfPath: "storage/resumes/job_1/resume.pdf"
    });

    expect(result).toEqual({
      jobId: "job_1",
      atsType: "lever",
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      status: "HUMAN_APPROVAL_REQUIRED",
      requiresHumanApproval: true,
      message: "ATS automation foundation is ready. Live autofill is not implemented in Phase 7A."
    });
  });

  it("delegates to ATSAutomationService when an adapter and applicant profile are supplied", async () => {
    const execute = vi.fn().mockResolvedValue({
      jobId: "job_1",
      atsType: "greenhouse",
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      status: "HUMAN_APPROVAL_REQUIRED",
      requiresHumanApproval: true,
      message: "done"
    });
    const useCase = new AutofillApplicationUseCase(undefined, undefined, undefined, { execute } as never);
    const page = new FakeATSPageAdapter("<form></form>", []);

    const result = await useCase.execute({
      jobId: "job_1",
      applicationUrl: "https://boards.greenhouse.io/example/jobs/1",
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      applicantProfile,
      page
    });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job_1",
        applicationUrl: "https://boards.greenhouse.io/example/jobs/1",
        applicantProfile,
        page
      })
    );
    expect(result.atsType).toBe("greenhouse");
  });

  it("rejects incomplete foundation requests", async () => {
    const useCase = new AutofillApplicationUseCase();

    await expect(
      useCase.execute({
        jobId: "",
        applicationUrl: "https://jobs.lever.co/example/1",
        resumePdfPath: "storage/resumes/job_1/resume.pdf"
      })
    ).rejects.toThrowError("ATS automation requires job id, URL, and resume PDF path");
  });
});
