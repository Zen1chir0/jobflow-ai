import type { ATSType } from "./ats.types.js";

export type ATSFailureStep =
  | "detect_ats"
  | "resolve_strategy"
  | "fill_personal_info"
  | "upload_resume"
  | "answer_screening"
  | "workday_state_detection"
  | "checkpoint"
  | "human_review";

export type ATSFailureRecord = {
  executionId: string;
  atsType: ATSType;
  jobId: string;
  step: ATSFailureStep;
  status: "FAILED";
  errorCode: string;
  safeMessage: string;
  checkpoint?: unknown;
  screenshotPath?: string;
  createdAt: string;
};

export type ATSCheckpointRecord = {
  executionId: string;
  atsType: ATSType;
  jobId: string;
  step: string;
  payload: unknown;
  createdAt: string;
};

export type RetryDecision = {
  shouldRetry: boolean;
  nextAttempt: number;
  reason: string;
};
