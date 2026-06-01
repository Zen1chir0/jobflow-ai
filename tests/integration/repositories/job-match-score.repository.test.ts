import { describe, expect, it } from "vitest";

import {
  SupabaseJobMatchScoreRepository,
  type JobMatchScoreRow
} from "../../../src/repositories/job-match-score.repository.js";

describe("SupabaseJobMatchScoreRepository", () => {
  it("upserts match scores through the job_match_scores table with every score component", async () => {
    const client = createFakeClient(buildRow());
    const repository = new SupabaseJobMatchScoreRepository(client);

    const score = await repository.upsert({
      jobId: "job_1",
      skillMatch: 90,
      experienceMatch: 80,
      industryMatch: 100,
      locationMatch: 100,
      compensationMatch: 75,
      finalScore: 86.25,
      scoringMetadata: { deterministic: true }
    });

    expect(client.lastTable).toBe("job_match_scores");
    expect(client.lastPayload).toEqual({
      job_id: "job_1",
      skill_match: 90,
      experience_match: 80,
      industry_match: 100,
      location_match: 100,
      compensation_match: 75,
      final_score: 86.25,
      scoring_metadata: { deterministic: true }
    });
    expect(score).toEqual({
      jobId: "job_1",
      skillMatch: 90,
      experienceMatch: 80,
      industryMatch: 100,
      locationMatch: 100,
      compensationMatch: 75,
      finalScore: 86.25,
      scoringMetadata: { deterministic: true }
    });
  });

  it("finds match scores by job id", async () => {
    const client = createFakeClient(buildRow());
    const repository = new SupabaseJobMatchScoreRepository(client);

    const score = await repository.findByJobId("job_1");

    expect(client.lastFilter).toEqual({ column: "job_id", value: "job_1" });
    expect(score?.finalScore).toBe(86.25);
  });
});

function buildRow(): JobMatchScoreRow {
  return {
    id: "score_1",
    job_id: "job_1",
    skill_match: 90,
    experience_match: 80,
    industry_match: 100,
    location_match: 100,
    compensation_match: 75,
    final_score: 86.25,
    scoring_metadata: { deterministic: true },
    created_at: "2026-06-01T00:00:00.000Z"
  };
}

function createFakeClient(row: JobMatchScoreRow | null) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    lastFilter: undefined as unknown,
    from(table: "job_match_scores") {
      this.lastTable = table;

      return {
        upsert: (payload: unknown) => {
          this.lastPayload = payload;

          return {
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: row,
                  error: null
                })
            })
          };
        },
        select: () => ({
          eq: (column: string, value: string) => {
            this.lastFilter = { column, value };

            return {
              maybeSingle: () =>
                Promise.resolve({
                  data: row,
                  error: null
                })
            };
          }
        })
      };
    }
  };
}
