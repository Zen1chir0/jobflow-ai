import type { WorkdayCheckpoint, WorkdayState } from "../../../domain/ats/workday.types.js";
import { WorkdayStateMachine } from "./workday-state-machine.js";

const WORKFLOW_ORDER: readonly WorkdayState[] = [
  "LOGIN_REQUIRED",
  "PERSONAL_INFO",
  "EXPERIENCE",
  "DOCUMENT_UPLOAD",
  "SCREENING",
  "REVIEW",
  "HUMAN_APPROVAL_REQUIRED"
];

export class WorkdayCheckpointBuilder {
  constructor(private readonly stateMachine = new WorkdayStateMachine()) {}

  build(input: { jobId: string; currentState: WorkdayState; createdAt?: string }): WorkdayCheckpoint {
    const currentIndex = WORKFLOW_ORDER.indexOf(input.currentState);
    const completedStates = currentIndex > 0 ? WORKFLOW_ORDER.slice(0, currentIndex) : [];

    return {
      atsType: "workday",
      jobId: input.jobId,
      currentState: input.currentState,
      allowedNextStates: this.stateMachine.getAllowedNextStates(input.currentState),
      completedStates: [...completedStates],
      requiresHumanApproval: true,
      reason: "Phase 7C detects Workday state and records checkpoint only; it does not advance states automatically.",
      createdAt: input.createdAt ?? new Date().toISOString()
    };
  }
}
