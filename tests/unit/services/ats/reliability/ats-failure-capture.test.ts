import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../../../src/domain/errors/application-error.js";
import { ATSFailureCapture } from "../../../../../src/services/ats/reliability/ats-failure-capture.js";

describe("ATSFailureCapture", () => {
  it("creates controlled failure records", () => {
    const capture = new ATSFailureCapture();

    const record = capture.capture({
      executionId: "exec_1",
      atsType: "greenhouse",
      jobId: "job_1",
      step: "upload_resume",
      error: new ApplicationError("RESUME_UPLOAD_VERIFICATION_FAILED", "Upload failed"),
      screenshotPath: "storage/screenshots/exec_1_greenhouse_upload_resume.png",
      createdAt: "2026-06-02T00:00:00.000Z"
    });

    expect(record).toEqual({
      executionId: "exec_1",
      atsType: "greenhouse",
      jobId: "job_1",
      step: "upload_resume",
      status: "FAILED",
      errorCode: "RESUME_UPLOAD_VERIFICATION_FAILED",
      safeMessage: "Upload failed",
      screenshotPath: "storage/screenshots/exec_1_greenhouse_upload_resume.png",
      createdAt: "2026-06-02T00:00:00.000Z"
    });
  });

  it("redacts sensitive values from failure messages", () => {
    const capture = new ATSFailureCapture();

    const record = capture.capture({
      executionId: "exec_1",
      atsType: "generic",
      jobId: "job_1",
      step: "detect_ats",
      error: new Error("Bearer abc.def LLM_API_KEY=secret-value cookie=session-token"),
      createdAt: "2026-06-02T00:00:00.000Z"
    });

    expect(record.safeMessage).toBe("[REDACTED] [REDACTED] [REDACTED]");
  });
});
