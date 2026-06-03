import { describe, expect, it } from "vitest";

import { LifecycleAnalyticsCalculator } from "../../../../src/services/analytics/lifecycle-analytics.calculator.js";
import type { AnalyticsApplicationEventRecord, AnalyticsApplicationRecord } from "../../../../src/domain/analytics/analytics.types.js";

describe("LifecycleAnalyticsCalculator", () => {
  it("calculates state and transition counts", () => {
    const applications: AnalyticsApplicationRecord[] = [
      buildApplication("app_1", "HIRED"),
      buildApplication("app_2", "REJECTED"),
      buildApplication("app_3", "WITHDRAWN")
    ];
    const applicationEvents: AnalyticsApplicationEventRecord[] = [
      buildEvent("OFFER", "HIRED"),
      buildEvent("INTERVIEWING", "REJECTED")
    ];

    const result = new LifecycleAnalyticsCalculator().calculate({ applications, applicationEvents });

    expect(result.stateCounts).toEqual({ HIRED: 1, REJECTED: 1, WITHDRAWN: 1 });
    expect(result.transitionCounts).toEqual({ "OFFER->HIRED": 1, "INTERVIEWING->REJECTED": 1 });
    expect(result.hiredCount).toBe(1);
  });
});

function buildApplication(id: string, currentState: AnalyticsApplicationRecord["currentState"]): AnalyticsApplicationRecord {
  return {
    id,
    currentState,
    createdAt: "2026-06-03T00:00:00.000Z",
    updatedAt: "2026-06-03T00:00:00.000Z"
  };
}

function buildEvent(
  fromState: AnalyticsApplicationEventRecord["fromState"],
  toState: AnalyticsApplicationEventRecord["toState"]
): AnalyticsApplicationEventRecord {
  return {
    id: `${fromState}_${toState}`,
    applicationId: "app_1",
    toState,
    createdAt: "2026-06-03T00:00:00.000Z",
    ...(fromState ? { fromState } : {})
  };
}
