import type { ScoreComponentBreakdown } from "../../domain/scoring/scoring.types.js";
import { normalizeToken } from "./score-utils.js";

export class IndustryMatchScorer {
  score(jobIndustry: string | undefined, targetIndustries: string[]): ScoreComponentBreakdown {
    const normalizedJobIndustry = jobIndustry ? normalizeToken(jobIndustry) : "";
    const normalizedTargets = targetIndustries.map(normalizeToken).filter(Boolean);
    const matched = normalizedJobIndustry.length > 0 && normalizedTargets.includes(normalizedJobIndustry);

    return {
      score: matched ? 100 : 0,
      metadata: {
        jobIndustry: normalizedJobIndustry || undefined,
        targetIndustries: normalizedTargets,
        matched
      }
    };
  }
}
