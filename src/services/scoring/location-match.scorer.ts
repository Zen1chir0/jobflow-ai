import type { RemoteType } from "../../domain/jobs/job.types.js";
import type { ScoreComponentBreakdown } from "../../domain/scoring/scoring.types.js";

export class LocationMatchScorer {
  score(jobRemoteType: RemoteType, preferredRemoteTypes: RemoteType[]): ScoreComponentBreakdown {
    const matched = jobRemoteType !== "unknown" && preferredRemoteTypes.includes(jobRemoteType);

    return {
      score: matched ? 100 : 0,
      metadata: {
        jobRemoteType,
        preferredRemoteTypes,
        matched
      }
    };
  }
}
