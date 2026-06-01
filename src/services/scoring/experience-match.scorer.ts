import type { SeniorityLevel } from "../../domain/jobs/parsed-job-profile.types.js";
import type { ScoreComponentBreakdown } from "../../domain/scoring/scoring.types.js";
import type { BaselineSeniority } from "../../domain/user-profile/user-profile.types.js";

const SENIORITY_ORDER: Record<BaselineSeniority, number> = {
  intern: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4
};

export class ExperienceMatchScorer {
  score(jobSeniority: SeniorityLevel, baselineSeniority: BaselineSeniority): ScoreComponentBreakdown {
    if (jobSeniority === "unknown") {
      return {
        score: 0,
        metadata: {
          reason: "unknown_job_seniority",
          jobSeniority,
          baselineSeniority
        }
      };
    }

    const difference = SENIORITY_ORDER[baselineSeniority] - SENIORITY_ORDER[jobSeniority];

    if (difference === 0) {
      return this.buildScore(100, jobSeniority, baselineSeniority, difference);
    }

    if (difference === -1) {
      return this.buildScore(50, jobSeniority, baselineSeniority, difference);
    }

    if (difference === 1) {
      return this.buildScore(80, jobSeniority, baselineSeniority, difference);
    }

    return this.buildScore(0, jobSeniority, baselineSeniority, difference);
  }

  private buildScore(
    score: number,
    jobSeniority: SeniorityLevel,
    baselineSeniority: BaselineSeniority,
    difference: number
  ): ScoreComponentBreakdown {
    return {
      score,
      metadata: {
        jobSeniority,
        baselineSeniority,
        seniorityDifference: difference
      }
    };
  }
}
