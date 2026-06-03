import { describe, expect, it } from "vitest";

import { FunnelAnalyticsCalculator } from "../../../../src/services/analytics/funnel-analytics.calculator.js";
import type { AnalyticsApplicationEventRecord, AnalyticsApplicationRecord } from "../../../../src/domain/analytics/analytics.types.js";

describe("FunnelAnalyticsCalculator", () => {
  it("calculates conversion and drop-off for funnel steps", () => {
    const calculator = new FunnelAnalyticsCalculator();
    const applications: AnalyticsApplicationRecord[] = [
      buildApplication("app_1", "DISCOVERED"),
      buildApplication("app_2", "DISCOVERED"),
      buildApplication("app_3", "PARSED")
    ];
    const applicationEvents: AnalyticsApplicationEventRecord[] = [
      buildEvent("DISCOVERED", "PARSED"),
      buildEvent("DISCOVERED", "PARSED")
    ];

    const result = calculator.calculate({ applications, applicationEvents });

    expect(result.totalApplications).toBe(3);
    expect(result.steps[0]).toEqual(
      expect.objectContaining({
        fromState: "DISCOVERED",
        toState: "PARSED",
        fromCount: 2,
        toCount: 1,
        transitionCount: 2,
        conversionRate: 50,
        dropOffRate: 50
      })
    );
  });

  it("handles empty datasets deterministically", () => {
    const result = new FunnelAnalyticsCalculator().calculate({ applications: [], applicationEvents: [] });

    expect(result.totalApplications).toBe(0);
    expect(result.steps[0]?.conversionRate).toBe(0);
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
