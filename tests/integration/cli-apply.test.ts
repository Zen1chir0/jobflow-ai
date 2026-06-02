import { describe, expect, it, vi } from "vitest";

import { createApplyCommand } from "../../src/cli/commands/apply.command.js";
import type { AutofillApplicationUseCase } from "../../src/use-cases/autofill-application.use-case.js";

describe("apply command", () => {
  it("parses apply options and displays foundation status", async () => {
    const execute = vi.fn().mockResolvedValue({
      jobId: "job_1",
      atsType: "greenhouse",
      resumePdfPath: "storage/resumes/job_1/resume.pdf",
      status: "HUMAN_APPROVAL_REQUIRED",
      requiresHumanApproval: true,
      message: "foundation only"
    });
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createApplyCommand(() => ({ execute }) as unknown as AutofillApplicationUseCase);

    await command.parseAsync(
      [
        "--job-id",
        "job_1",
        "--application-url",
        "https://boards.greenhouse.io/example/jobs/1",
        "--resume-pdf",
        "storage/resumes/job_1/resume.pdf"
      ],
      { from: "user" }
    );

    expect(execute).toHaveBeenCalledWith({
      jobId: "job_1",
      applicationUrl: "https://boards.greenhouse.io/example/jobs/1",
      resumePdfPath: "storage/resumes/job_1/resume.pdf"
    });
    expect(output).toHaveBeenCalledWith("ATS foundation ready for job job_1");
    expect(output).toHaveBeenCalledWith("Detected ATS greenhouse");
    expect(output).toHaveBeenCalledWith("Status HUMAN_APPROVAL_REQUIRED");
  });
});
