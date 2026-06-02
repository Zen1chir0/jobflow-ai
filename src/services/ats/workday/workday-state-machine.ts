import type { WorkdayState } from "../../../domain/ats/workday.types.js";
import { ApplicationError } from "../../../domain/errors/application-error.js";

const ALLOWED_TRANSITIONS: Record<WorkdayState, WorkdayState[]> = {
  LOGIN_REQUIRED: ["PERSONAL_INFO"],
  PERSONAL_INFO: ["EXPERIENCE"],
  EXPERIENCE: ["DOCUMENT_UPLOAD"],
  DOCUMENT_UPLOAD: ["SCREENING"],
  SCREENING: ["REVIEW"],
  REVIEW: ["HUMAN_APPROVAL_REQUIRED"],
  HUMAN_APPROVAL_REQUIRED: []
};

export class WorkdayStateMachine {
  getAllowedNextStates(state: WorkdayState): WorkdayState[] {
    return [...ALLOWED_TRANSITIONS[state]];
  }

  canTransition(fromState: WorkdayState, toState: WorkdayState): boolean {
    return ALLOWED_TRANSITIONS[fromState].includes(toState);
  }

  assertCanTransition(fromState: WorkdayState, toState: WorkdayState): void {
    if (!this.canTransition(fromState, toState)) {
      throw new ApplicationError(
        "INVALID_WORKDAY_TRANSITION",
        `Invalid Workday transition from ${fromState} to ${toState}`
      );
    }
  }
}
