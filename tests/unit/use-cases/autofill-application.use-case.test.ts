import { describe, expect, it } from "vitest";

import { AutofillApplicationUseCase } from "../../../src/use-cases/autofill-application.use-case.js";

describe("AutofillApplicationUseCase", () => {
  it("builds a Phase 7A foundation plan without live ATS automation", () => {
    const useCase = new AutofillApplicationUseCase();

    const result = useCase.execute({
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

  it("rejects incomplete foundation requests", () => {
    const useCase = new AutofillApplicationUseCase();

    expect(() =>
      useCase.execute({
        jobId: "",
        applicationUrl: "https://jobs.lever.co/example/1",
        resumePdfPath: "storage/resumes/job_1/resume.pdf"
      })
    ).toThrowError("ATS automation requires job id, URL, and resume PDF path");
  });
});
