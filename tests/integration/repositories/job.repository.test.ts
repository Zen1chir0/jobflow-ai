import { describe, expect, it } from "vitest";

import { SupabaseJobRepository, type JobRow } from "../../../src/repositories/job.repository.js";

describe("SupabaseJobRepository", () => {
  it("upserts jobs through the jobs table and maps database rows", async () => {
    const client = createFakeClient({
      id: "job_1",
      source: "manual",
      source_job_id: null,
      title: "QA Engineer",
      company: "Example Co",
      location: "Remote",
      remote_type: "remote",
      salary_raw: null,
      salary_min: null,
      salary_max: null,
      currency: null,
      description_raw: "Description",
      description_clean: null,
      application_url: "https://example.com/jobs/1",
      ats_type: "unknown",
      discovered_at: "2026-06-01T00:00:00.000Z",
      parsed_at: null
    });
    const repository = new SupabaseJobRepository(client);

    const job = await repository.upsert({
      source: "manual",
      title: "QA Engineer",
      company: "Example Co",
      location: "Remote",
      remoteType: "remote",
      descriptionRaw: "Description",
      applicationUrl: "https://example.com/jobs/1",
      atsType: "unknown",
      discoveredAt: "2026-06-01T00:00:00.000Z"
    });

    expect(client.lastTable).toBe("jobs");
    expect(client.lastPayload).toEqual(
      expect.objectContaining({
        source: "manual",
        title: "QA Engineer",
        remote_type: "remote",
        application_url: "https://example.com/jobs/1"
      })
    );
    expect(job).toEqual({
      id: "job_1",
      source: "manual",
      title: "QA Engineer",
      company: "Example Co",
      location: "Remote",
      remoteType: "remote",
      descriptionRaw: "Description",
      applicationUrl: "https://example.com/jobs/1",
      atsType: "unknown",
      discoveredAt: "2026-06-01T00:00:00.000Z"
    });
  });

  it("finds jobs by id through the jobs table", async () => {
    const client = createFakeClient(null);
    const repository = new SupabaseJobRepository(client);

    const job = await repository.findById("job_missing");

    expect(job).toBeNull();
    expect(client.lastFilter).toEqual({ column: "id", value: "job_missing" });
  });
});

function createFakeClient(row: JobRow | null) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    lastFilter: undefined as unknown,
    from(table: "jobs") {
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
