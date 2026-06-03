import type { AnalyticsExecutionLogRecord, ExecutionAnalytics } from "../../domain/analytics/analytics.types.js";

export class ExecutionAnalyticsCalculator {
  calculate(executionLogs: AnalyticsExecutionLogRecord[]): ExecutionAnalytics {
    const trackedRecords = executionLogs.filter((log) => log.executionId).length;
    const untrackedRecords = executionLogs.length - trackedRecords;
    const failureLogs = executionLogs.filter((log) => log.status === "failed");

    return {
      totalLogRecords: executionLogs.length,
      trackedExecutionCount: new Set(executionLogs.filter((log) => log.executionId).map((log) => log.executionId)).size,
      untrackedRecordCount: untrackedRecords,
      successCount: executionLogs.filter((log) => log.status === "success").length,
      failureCount: failureLogs.length,
      warningCount: executionLogs.filter((log) => log.status === "warning").length,
      successRate: percentage(executionLogs.filter((log) => log.status === "success").length, executionLogs.length),
      failureRate: percentage(failureLogs.length, executionLogs.length),
      failureCategories: countBy(failureLogs.map((log) => log.step)),
      executionVolumeByService: countBy(executionLogs.map((log) => log.service)),
      coverage: {
        trackedRecords,
        untrackedRecords,
        unknownCoverage: untrackedRecords > 0
      }
    };
  }
}

function percentage(part: number, whole: number): number {
  if (whole === 0) {
    return 0;
  }

  return Math.round((part / whole) * 10000) / 100;
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
