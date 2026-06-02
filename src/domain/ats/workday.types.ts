export type WorkdayState =
  | "LOGIN_REQUIRED"
  | "PERSONAL_INFO"
  | "EXPERIENCE"
  | "DOCUMENT_UPLOAD"
  | "SCREENING"
  | "REVIEW"
  | "HUMAN_APPROVAL_REQUIRED";

export type WorkdayCheckpoint = {
  atsType: "workday";
  jobId: string;
  currentState: WorkdayState;
  allowedNextStates: WorkdayState[];
  completedStates: WorkdayState[];
  requiresHumanApproval: true;
  reason: string;
  createdAt: string;
};

export const WORKDAY_STATES: readonly WorkdayState[] = [
  "LOGIN_REQUIRED",
  "PERSONAL_INFO",
  "EXPERIENCE",
  "DOCUMENT_UPLOAD",
  "SCREENING",
  "REVIEW",
  "HUMAN_APPROVAL_REQUIRED"
];
