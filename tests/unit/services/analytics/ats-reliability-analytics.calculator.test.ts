import { describe, expect, it } from "vitest";

import { ATSReliabilityAnalyticsCalculator } from "../../../../src/services/analytics/ats-reliability-analytics.calculator.js";
import type { AnalyticsCheckpointRecord, AnalyticsExecutionLogRecord } from "../../../../src/domain/analytics/analytics.types.js";

describe("ATSReliabilityAnalyticsCalculator", () => {
  it("calculates checkpoint and ATS failure metrics", () => {
    const automationCheckpoints: AnalyticsCheckpointRecord[] = [
      buildCheckpoint("checkpoint_1", "greenhouse", true),
      buildCheckpoint("checkpoint_2", "lever", false)
    ];
    const executionLogs: AnalyticsExecutionLogRecord[] = [
      buildLog("log_1", "greenhouse", "failed"),
      buildLog("log_2", "lever", "success")
    ];

    const result = new ATSReliabilityAnalyticsCalculator().calculate({ executionLogs, automationCheckpoints });

    expect(result.checkpointCount).toBe(2);
    expect(result.completedCheckpointCount).toBe(1);
    expect(result.failureCount).toBe(1);
    expect(result.failureCountsByAtsType).toEqual({ greenhouse: 1 });
  });
});

function buildCheckpoint(id: string, atsType: string, isCompleted: boolean): AnalyticsCheckpointRecord {
  return {
    id,
    applicationId: "application_1",
    executionId: "exec_1",
    atsType,
    currentStep: "human_review",
    isCompleted,
    createdAt: "2026-06-03T00:00:00.000Z"
  };
}

function buildLog(id: string, atsType: string, status: AnalyticsExecutionLogRecord["status"]): AnalyticsExecutionLogRecord {
  return {
    id,
    executionId: "exec_1",
    service: "ats",
    step: "upload_resume",
    status,
    atsType,
    createdAt: "2026-06-03T00:00:00.000Z"
  };
}
