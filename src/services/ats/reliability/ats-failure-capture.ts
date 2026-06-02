import type { ATSFailureRecord, ATSFailureStep } from "../../../domain/ats/ats-reliability.types.js";
import type { ATSType } from "../../../domain/ats/ats.types.js";

const SECRET_PATTERNS = [
  /sk-[a-z0-9_-]+/gi,
  /Bearer\s+[a-z0-9._-]+/gi,
  /SUPABASE_SERVICE_ROLE_KEY=[^\s]+/gi,
  /LLM_API_KEY=[^\s]+/gi,
  /cookie=[^\s;]+/gi
];

export class ATSFailureCapture {
  capture(input: {
    executionId: string;
    atsType: ATSType;
    jobId: string;
    step: ATSFailureStep;
    error: unknown;
    checkpoint?: unknown;
    screenshotPath?: string;
    createdAt?: string;
  }): ATSFailureRecord {
    return {
      executionId: sanitize(input.executionId),
      atsType: input.atsType,
      jobId: sanitize(input.jobId),
      step: input.step,
      status: "FAILED",
      errorCode: getErrorCode(input.error),
      safeMessage: sanitize(getErrorMessage(input.error)),
      ...(input.checkpoint === undefined ? {} : { checkpoint: input.checkpoint }),
      ...(input.screenshotPath === undefined ? {} : { screenshotPath: sanitize(input.screenshotPath) }),
      createdAt: input.createdAt ?? new Date().toISOString()
    };
  }
}

function getErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") {
    return sanitize(error.code);
  }

  return "ATS_AUTOMATION_FAILURE";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "ATS automation failed";
}

function sanitize(value: string): string {
  return SECRET_PATTERNS.reduce((safeValue, pattern) => safeValue.replace(pattern, "[REDACTED]"), value);
}
