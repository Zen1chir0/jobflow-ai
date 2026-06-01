import { describe, expect, it } from "vitest";

import {
  SupabaseParsedJobProfileRepository,
  type ParsedJobProfileRow
} from "../../../src/repositories/parsed-job-profile.repository.js";

describe("SupabaseParsedJobProfileRepository", () => {
  it("upserts parsed job profiles through the parsed_job_profiles table", async () => {
    const client = createFakeClient({
      id: "profile_1",
      job_id: "job_1",
      responsibilities: ["Build tests"],
      required_skills: ["Playwright"],
      preferred_skills: ["Supabase"],
      seniority: "senior",
      industry: null,
      compensation: { min: 80000, max: 120000, currency: "PHP" },
      raw_metadata: { descriptionClean: "Clean" },
      embedding: null,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-01T00:00:00.000Z"
    });
    const repository = new SupabaseParsedJobProfileRepository(client);

    const profile = await repository.upsert({
      jobId: "job_1",
      responsibilities: ["Build tests"],
      requiredSkills: ["Playwright"],
      preferredSkills: ["Supabase"],
      seniority: "senior",
      compensation: { min: 80000, max: 120000, currency: "PHP" },
      rawMetadata: { descriptionClean: "Clean" }
    });

    expect(client.lastTable).toBe("parsed_job_profiles");
    expect(client.lastPayload).toEqual(
      expect.objectContaining({
        job_id: "job_1",
        required_skills: ["Playwright"],
        seniority: "senior"
      })
    );
    expect(profile).toEqual({
      jobId: "job_1",
      responsibilities: ["Build tests"],
      requiredSkills: ["Playwright"],
      preferredSkills: ["Supabase"],
      seniority: "senior",
      compensation: { min: 80000, max: 120000, currency: "PHP" },
      rawMetadata: { descriptionClean: "Clean" }
    });
  });
});

function createFakeClient(row: ParsedJobProfileRow | null) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    from(table: "parsed_job_profiles") {
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
        }
      };
    }
  };
}
