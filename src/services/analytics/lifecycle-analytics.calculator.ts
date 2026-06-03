import type {
  AnalyticsApplicationEventRecord,
  AnalyticsApplicationRecord,
  LifecycleAnalytics
} from "../../domain/analytics/analytics.types.js";

export class LifecycleAnalyticsCalculator {
  calculate(input: {
    applications: AnalyticsApplicationRecord[];
    applicationEvents: AnalyticsApplicationEventRecord[];
  }): LifecycleAnalytics {
    return {
      totalApplications: input.applications.length,
      stateCounts: countBy(input.applications.map((application) => application.currentState)),
      transitionCounts: countBy(
        input.applicationEvents
          .filter((event) => event.fromState)
          .map((event) => `${event.fromState}->${event.toState}`)
      ),
      hiredCount: input.applications.filter((application) => application.currentState === "HIRED").length,
      rejectedCount: input.applications.filter((application) => application.currentState === "REJECTED").length,
      withdrawnCount: input.applications.filter((application) => application.currentState === "WITHDRAWN").length
    };
  }
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
