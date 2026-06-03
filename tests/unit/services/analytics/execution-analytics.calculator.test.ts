import { describe, expect, it } from "vitest";

import { ExecutionAnalyticsCalculator } from "../../../../src/services/analytics/execution-analytics.calculator.js";
import type { AnalyticsExecutionLogRecord } from "../../../../src/domain/analytics/analytics.types.js";

describe("ExecutionAnalyticsCalculator", () => {
  it("calculates execution metrics and partial coverage", () => {
    const logs: AnalyticsExecutionLogRecord[] = [
      buildLog("log_1", "exec_1", "success", "generation"),
      buildLog("log_2", "exec_1", "failed", "generation", "provider_call"),
      buildLog("log_3", "", "warning", "ats")
    ];

    const result = new ExecutionAnalyticsCalculator().calculate(logs);

    expect(result.trackedExecutionCount).toBe(1);
    expect(result.untrackedRecordCount).toBe(1);
    expect(result.successRate).toBe(33.33);
    expect(result.failureRate).toBe(33.33);
    expect(result.failureCategories).toEqual({ provider_call: 1 });
    expect(result.coverage).toEqual({
      trackedRecords: 2,
      untrackedRecords: 1,
      unknownCoverage: true
    });
  });
});

function buildLog(
  id: string,
  executionId: string,
  status: AnalyticsExecutionLogRecord["status"],
  service: string,
  step = "step"
): AnalyticsExecutionLogRecord {
  return {
    id,
    executionId,
    service,
    step,
    status,
    createdAt: "2026-06-03T00:00:00.000Z"
  };
}
