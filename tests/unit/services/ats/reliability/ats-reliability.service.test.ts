import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../../../src/domain/errors/application-error.js";
import { ATSReliabilityService } from "../../../../../src/services/ats/reliability/ats-reliability.service.js";
import { InMemoryATSCheckpointStore } from "../../../../../src/services/ats/reliability/in-memory-ats-checkpoint-store.js";

describe("ATSReliabilityService", () => {
  it("coordinates checkpoint storage, failure capture, and retry decisions", async () => {
    const service = new ATSReliabilityService(new InMemoryATSCheckpointStore());

    await expect(
      service.saveCheckpoint({
        executionId: "exec_1",
        atsType: "workday",
        jobId: "job_1",
        step: "DOCUMENT_UPLOAD",
        payload: { currentState: "DOCUMENT_UPLOAD" },
        createdAt: "2026-06-02T00:00:00.000Z"
      })
    ).resolves.toMatchObject({ step: "DOCUMENT_UPLOAD" });

    const failure = service.captureFailure({
      executionId: "exec_1",
      atsType: "workday",
      jobId: "job_1",
      step: "workday_state_detection",
      error: new ApplicationError("WORKDAY_STATE_NOT_DETECTED", "State missing"),
      createdAt: "2026-06-02T00:01:00.000Z"
    });

    expect(failure).toMatchObject({
      screenshotPath: "storage/screenshots/exec_1_workday_workday_state_detection.png",
      errorCode: "WORKDAY_STATE_NOT_DETECTED"
    });
    expect(service.decideRetry({ attempt: 1, errorCode: failure.errorCode }).shouldRetry).toBe(true);
  });

  it("captures cross-strategy failures without lifecycle or observability side effects", () => {
    const service = new ATSReliabilityService(new InMemoryATSCheckpointStore());

    const records = ["greenhouse", "lever", "generic", "workday"].map((atsType) =>
      service.captureFailure({
        executionId: `exec_${atsType}`,
        atsType: atsType as "greenhouse" | "lever" | "generic" | "workday",
        jobId: "job_1",
        step: "upload_resume",
        error: new ApplicationError("RESUME_UPLOAD_VERIFICATION_FAILED", "Upload failed"),
        createdAt: "2026-06-02T00:00:00.000Z"
      })
    );

    expect(records.map((record) => record.atsType)).toEqual(["greenhouse", "lever", "generic", "workday"]);
    expect(records.every((record) => record.status === "FAILED")).toBe(true);
  });
});
