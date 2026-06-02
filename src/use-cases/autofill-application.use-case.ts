import type { ATSAutomationPlan } from "../domain/ats/ats.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import { ATSTypeDetector } from "../services/ats/ats-type-detector.js";
import { ResumePdfPathValidator } from "../services/ats/resume-pdf-path.validator.js";
import { SubmitGuard } from "../services/ats/submit-guard.js";

export type AutofillApplicationRequest = {
  jobId: string;
  applicationUrl: string;
  resumePdfPath: string;
};

export class AutofillApplicationUseCase {
  constructor(
    private readonly atsTypeDetector = new ATSTypeDetector(),
    private readonly resumePdfPathValidator = new ResumePdfPathValidator(),
    private readonly submitGuard = new SubmitGuard()
  ) {}

  execute(request: AutofillApplicationRequest): ATSAutomationPlan {
    if (!request.jobId || !request.applicationUrl || !request.resumePdfPath) {
      throw new ApplicationError("INVALID_ATS_AUTOMATION_REQUEST", "ATS automation requires job id, URL, and resume PDF path");
    }

    this.submitGuard.assertSafeAction("human_review_required");
    const resumePdfPath = this.resumePdfPathValidator.validate(request.resumePdfPath);
    const atsType = this.atsTypeDetector.detect({ url: request.applicationUrl });

    return {
      jobId: request.jobId,
      atsType,
      resumePdfPath,
      status: "HUMAN_APPROVAL_REQUIRED",
      requiresHumanApproval: true,
      message: "ATS automation foundation is ready. Live autofill is not implemented in Phase 7A."
    };
  }
}
