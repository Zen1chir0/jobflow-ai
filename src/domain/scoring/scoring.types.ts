export type MatchScore = {
  jobId: string;
  skillMatch: number;
  experienceMatch: number;
  industryMatch: number;
  locationMatch: number;
  compensationMatch: number;
  finalScore: number;
  scoringMetadata: Record<string, unknown>;
};

export type NewMatchScore = MatchScore;

export type ScoreComponentBreakdown = {
  score: number;
  metadata: Record<string, unknown>;
};
