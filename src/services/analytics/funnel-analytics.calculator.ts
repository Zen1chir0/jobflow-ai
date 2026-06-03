import type {
  AnalyticsApplicationEventRecord,
  AnalyticsApplicationRecord,
  ApplicationFunnelAnalytics,
  FunnelStepAnalytics
} from "../../domain/analytics/analytics.types.js";
import type { ApplicationState } from "../../domain/applications/application.types.js";

export const FUNNEL_STEPS: ReadonlyArray<{ fromState: ApplicationState; toState: ApplicationState }> = [
  { fromState: "DISCOVERED", toState: "PARSED" },
  { fromState: "PARSED", toState: "SCORED" },
  { fromState: "SCORED", toState: "GENERATED" },
  { fromState: "GENERATED", toState: "RENDERED" },
  { fromState: "RENDERED", toState: "READY_FOR_APPLICATION" },
  { fromState: "READY_FOR_APPLICATION", toState: "HUMAN_APPROVAL_REQUIRED" },
  { fromState: "HUMAN_APPROVAL_REQUIRED", toState: "APPLIED" },
  { fromState: "APPLIED", toState: "INTERVIEWING" },
  { fromState: "INTERVIEWING", toState: "OFFER" },
  { fromState: "OFFER", toState: "HIRED" }
];

export class FunnelAnalyticsCalculator {
  calculate(input: {
    applications: AnalyticsApplicationRecord[];
    applicationEvents: AnalyticsApplicationEventRecord[];
  }): ApplicationFunnelAnalytics {
    return {
      totalApplications: input.applications.length,
      steps: FUNNEL_STEPS.map((step) => this.calculateStep(step, input))
    };
  }

  private calculateStep(
    step: { fromState: ApplicationState; toState: ApplicationState },
    input: {
      applications: AnalyticsApplicationRecord[];
      applicationEvents: AnalyticsApplicationEventRecord[];
    }
  ): FunnelStepAnalytics {
    const fromCount = countState(input.applications, step.fromState);
    const toCount = countState(input.applications, step.toState);
    const transitionCount = input.applicationEvents.filter(
      (event) => event.fromState === step.fromState && event.toState === step.toState
    ).length;
    const conversionRate = percentage(toCount, fromCount);

    return {
      ...step,
      fromCount,
      toCount,
      transitionCount,
      conversionRate,
      dropOffRate: fromCount === 0 ? 0 : round(100 - conversionRate)
    };
  }
}

function countState(applications: AnalyticsApplicationRecord[], state: ApplicationState): number {
  return applications.filter((application) => application.currentState === state).length;
}

function percentage(part: number, whole: number): number {
  if (whole === 0) {
    return 0;
  }

  return round((part / whole) * 100);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
