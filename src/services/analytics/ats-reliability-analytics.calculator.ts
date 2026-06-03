import type {
  AnalyticsCheckpointRecord,
  AnalyticsExecutionLogRecord,
  ATSReliabilityAnalytics
} from "../../domain/analytics/analytics.types.js";

export class ATSReliabilityAnalyticsCalculator {
  calculate(input: {
    executionLogs: AnalyticsExecutionLogRecord[];
    automationCheckpoints: AnalyticsCheckpointRecord[];
  }): ATSReliabilityAnalytics {
    const atsFailures = input.executionLogs.filter((log) => log.service === "ats" && log.status === "failed");

    return {
      checkpointCount: input.automationCheckpoints.length,
      completedCheckpointCount: input.automationCheckpoints.filter((checkpoint) => checkpoint.isCompleted).length,
      failureCount: atsFailures.length,
      atsTypeDistribution: countBy([
        ...input.automationCheckpoints.map((checkpoint) => checkpoint.atsType),
        ...input.executionLogs.filter((log) => log.atsType).map((log) => log.atsType as string)
      ]),
      failureCountsByAtsType: countBy(atsFailures.map((log) => log.atsType ?? "unknown"))
    };
  }
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
