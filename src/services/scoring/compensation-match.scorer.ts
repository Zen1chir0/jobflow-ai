import type { ParsedJobCompensation } from "../../domain/jobs/parsed-job-profile.types.js";
import type { ScoreComponentBreakdown } from "../../domain/scoring/scoring.types.js";
import { clampScore, normalizeToken } from "./score-utils.js";

export class CompensationMatchScorer {
  score(
    compensation: ParsedJobCompensation,
    minimumSalary: number | undefined,
    salaryCurrency: string
  ): ScoreComponentBreakdown {
    if (minimumSalary === undefined) {
      return this.buildScore(100, compensation, minimumSalary, salaryCurrency, "no_minimum_salary");
    }

    if (compensation.currency && normalizeToken(compensation.currency) !== normalizeToken(salaryCurrency)) {
      return this.buildScore(0, compensation, minimumSalary, salaryCurrency, "currency_mismatch");
    }

    const compensationMin = compensation.min;
    const compensationMax = compensation.max;

    if (compensationMin === undefined && compensationMax === undefined) {
      return this.buildScore(0, compensation, minimumSalary, salaryCurrency, "missing_compensation");
    }

    if (compensationMin !== undefined && compensationMin >= minimumSalary) {
      return this.buildScore(100, compensation, minimumSalary, salaryCurrency, "minimum_met_by_range_floor");
    }

    if (compensationMax !== undefined && compensationMax >= minimumSalary) {
      return this.buildScore(75, compensation, minimumSalary, salaryCurrency, "minimum_inside_range");
    }

    const bestKnownSalary = compensationMax ?? compensationMin ?? 0;
    return this.buildScore(
      clampScore((bestKnownSalary / minimumSalary) * 100),
      compensation,
      minimumSalary,
      salaryCurrency,
      "below_minimum"
    );
  }

  private buildScore(
    score: number,
    compensation: ParsedJobCompensation,
    minimumSalary: number | undefined,
    salaryCurrency: string,
    reason: string
  ): ScoreComponentBreakdown {
    return {
      score,
      metadata: {
        reason,
        compensation,
        minimumSalary,
        salaryCurrency
      }
    };
  }
}
