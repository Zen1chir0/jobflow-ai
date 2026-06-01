import type { ScoreComponentBreakdown } from "../../domain/scoring/scoring.types.js";
import { clampScore, normalizeToken } from "./score-utils.js";

export class SkillMatchScorer {
  score(requiredSkills: string[], verifiedUserSkills: string[]): ScoreComponentBreakdown {
    const required = uniqueNormalized(requiredSkills);
    const verified = new Set(uniqueNormalized(verifiedUserSkills));

    if (required.length === 0) {
      return {
        score: 100,
        metadata: {
          matchedSkills: [],
          missingSkills: [],
          requiredSkillCount: 0
        }
      };
    }

    const matchedSkills = required.filter((skill) => verified.has(skill));
    const missingSkills = required.filter((skill) => !verified.has(skill));

    return {
      score: clampScore((matchedSkills.length / required.length) * 100),
      metadata: {
        matchedSkills,
        missingSkills,
        requiredSkillCount: required.length
      }
    };
  }
}

function uniqueNormalized(values: string[]): string[] {
  return [...new Set(values.map(normalizeToken).filter(Boolean))];
}
