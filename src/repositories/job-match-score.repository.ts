import type { PostgrestError } from "@supabase/supabase-js";

import { ApplicationError } from "../domain/errors/application-error.js";
import type { MatchScore, NewMatchScore } from "../domain/scoring/scoring.types.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type JsonObject = Record<string, unknown>;

export type JobMatchScoreRow = {
  id: string;
  job_id: string;
  skill_match: number;
  experience_match: number;
  industry_match: number;
  location_match: number;
  compensation_match: number;
  final_score: number;
  scoring_metadata: JsonObject;
  created_at: string;
};

type JobMatchScorePayload = {
  job_id: string;
  skill_match: number;
  experience_match: number;
  industry_match: number;
  location_match: number;
  compensation_match: number;
  final_score: number;
  scoring_metadata: JsonObject;
};

type SupabaseSingleResult = {
  data: JobMatchScoreRow | null;
  error: PostgrestError | null;
};

type SupabaseMaybeSingleResult = {
  data: JobMatchScoreRow | null;
  error: PostgrestError | null;
};

type JobMatchScoreTableClient = {
  upsert(payload: JobMatchScorePayload, options: { onConflict: string }): {
    select(columns: string): {
      single(): Promise<SupabaseSingleResult>;
    };
  };
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): Promise<SupabaseMaybeSingleResult>;
    };
  };
};

export type SupabaseJobMatchScoreClient = {
  from(table: "job_match_scores"): JobMatchScoreTableClient;
};

export interface JobMatchScoreRepository {
  upsert(score: NewMatchScore): Promise<MatchScore>;
  findByJobId(jobId: string): Promise<MatchScore | null>;
}

export class SupabaseJobMatchScoreRepository implements JobMatchScoreRepository {
  constructor(
    private readonly client: SupabaseJobMatchScoreClient = createSupabaseClient() as unknown as SupabaseJobMatchScoreClient
  ) {}

  async upsert(score: NewMatchScore): Promise<MatchScore> {
    const result = await this.client
      .from("job_match_scores")
      .upsert(toPayload(score), { onConflict: "job_id" })
      .select("*")
      .single();

    if (result.error) {
      throw new ApplicationError("JOB_MATCH_SCORE_REPOSITORY_ERROR", "Unable to upsert job match score", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("JOB_MATCH_SCORE_REPOSITORY_ERROR", "Job match score upsert returned no data");
    }

    return fromRow(result.data);
  }

  async findByJobId(jobId: string): Promise<MatchScore | null> {
    const result = await this.client
      .from("job_match_scores")
      .select("*")
      .eq("job_id", jobId)
      .maybeSingle();

    if (result.error) {
      throw new ApplicationError("JOB_MATCH_SCORE_REPOSITORY_ERROR", "Unable to find job match score", {
        cause: result.error
      });
    }

    return result.data ? fromRow(result.data) : null;
  }
}

function toPayload(score: NewMatchScore): JobMatchScorePayload {
  return {
    job_id: score.jobId,
    skill_match: score.skillMatch,
    experience_match: score.experienceMatch,
    industry_match: score.industryMatch,
    location_match: score.locationMatch,
    compensation_match: score.compensationMatch,
    final_score: score.finalScore,
    scoring_metadata: score.scoringMetadata
  };
}

function fromRow(row: JobMatchScoreRow): MatchScore {
  return {
    jobId: row.job_id,
    skillMatch: row.skill_match,
    experienceMatch: row.experience_match,
    industryMatch: row.industry_match,
    locationMatch: row.location_match,
    compensationMatch: row.compensation_match,
    finalScore: row.final_score,
    scoringMetadata: row.scoring_metadata
  };
}
