import { describe, expect, it } from "vitest";

import { WorkdayCheckpointBuilder } from "../../../../../src/services/ats/workday/workday-checkpoint-builder.js";

describe("WorkdayCheckpointBuilder", () => {
  it("builds a checkpoint without advancing Workday state", () => {
    const builder = new WorkdayCheckpointBuilder();

    const checkpoint = builder.build({
      jobId: "job_1",
      currentState: "DOCUMENT_UPLOAD",
      createdAt: "2026-06-02T00:00:00.000Z"
    });

    expect(checkpoint).toEqual({
      atsType: "workday",
      jobId: "job_1",
      currentState: "DOCUMENT_UPLOAD",
      allowedNextStates: ["SCREENING"],
      completedStates: ["LOGIN_REQUIRED", "PERSONAL_INFO", "EXPERIENCE"],
      requiresHumanApproval: true,
      reason: "Phase 7C detects Workday state and records checkpoint only; it does not advance states automatically.",
      createdAt: "2026-06-02T00:00:00.000Z"
    });
  });
});
