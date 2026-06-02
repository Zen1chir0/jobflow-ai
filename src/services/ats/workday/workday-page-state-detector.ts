import type { ATSPageAdapter } from "../ats-page-adapter.interface.js";
import type { WorkdayState } from "../../../domain/ats/workday.types.js";
import { ApplicationError } from "../../../domain/errors/application-error.js";

const STATE_SIGNATURES: Array<{ state: WorkdayState; signature: RegExp }> = [
  { state: "LOGIN_REQUIRED", signature: /sign in|login|required to continue/i },
  { state: "PERSONAL_INFO", signature: /personal information|my information|contact information/i },
  { state: "EXPERIENCE", signature: /experience|employment history|work history/i },
  { state: "DOCUMENT_UPLOAD", signature: /resume|cv|upload documents|attachments/i },
  { state: "SCREENING", signature: /questionnaire|screening questions|additional questions/i },
  { state: "REVIEW", signature: /review|submit application|application summary/i },
  { state: "HUMAN_APPROVAL_REQUIRED", signature: /human approval required|manual review required/i }
];

export class WorkdayPageStateDetector {
  async detectCurrentState(adapter: ATSPageAdapter): Promise<WorkdayState> {
    for (const { state, signature } of STATE_SIGNATURES) {
      if (await adapter.hasVisibleText(signature)) {
        return state;
      }
    }

    throw new ApplicationError("WORKDAY_STATE_NOT_DETECTED", "Unable to detect current Workday page state");
  }
}
