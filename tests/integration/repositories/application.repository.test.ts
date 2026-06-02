import { describe, expect, it } from "vitest";

import { SupabaseApplicationRepository, type ApplicationRow } from "../../../src/repositories/application.repository.js";

describe("SupabaseApplicationRepository", () => {
  it("creates applications through the applications table", async () => {
    const client = createFakeClient(buildApplicationRow());
    const repository = new SupabaseApplicationRepository(client);

    const application = await repository.create({
      jobId: "job_1",
      currentState: "DISCOVERED",
      selectedResumeId: "resume_1",
      applicationUrl: "https://example.com/apply",
      atsType: "greenhouse",
      executionId: "exec_1"
    });

    expect(client.lastTable).toBe("applications");
    expect(client.lastPayload).toEqual(
      expect.objectContaining({
        job_id: "job_1",
        current_state: "DISCOVERED",
        selected_resume_id: "resume_1",
        last_execution_id: "exec_1"
      })
    );
    expect(application).toEqual(
      expect.objectContaining({
        id: "application_1",
        jobId: "job_1",
        currentState: "DISCOVERED"
      })
    );
  });

  it("updates application state through the applications table", async () => {
    const client = createFakeClient({ ...buildApplicationRow(), current_state: "PARSED" });
    const repository = new SupabaseApplicationRepository(client);

    const application = await repository.updateState({
      applicationId: "application_1",
      toState: "PARSED",
      executionId: "exec_2"
    });

    expect(client.lastUpdate).toEqual({ current_state: "PARSED", last_execution_id: "exec_2" });
    expect(client.lastFilter).toEqual({ column: "id", value: "application_1" });
    expect(application.currentState).toBe("PARSED");
  });
});

function buildApplicationRow(): ApplicationRow {
  return {
    id: "application_1",
    job_id: "job_1",
    current_state: "DISCOVERED",
    selected_resume_id: "resume_1",
    application_url: "https://example.com/apply",
    ats_type: "greenhouse",
    notes: null,
    last_execution_id: "exec_1",
    created_at: "2026-06-02T00:00:00.000Z",
    updated_at: "2026-06-02T00:00:00.000Z"
  };
}

function createFakeClient(row: ApplicationRow | null) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    lastUpdate: undefined as unknown,
    lastFilter: undefined as unknown,
    from(table: "applications") {
      this.lastTable = table;

      return {
        insert: (payload: unknown) => {
          this.lastPayload = payload;

          return {
            select: () => ({
              single: () => Promise.resolve({ data: row, error: null })
            })
          };
        },
        select: () => ({
          eq: (column: string, value: string) => {
            this.lastFilter = { column, value };

            return {
              maybeSingle: () => Promise.resolve({ data: row, error: null })
            };
          }
        }),
        update: (payload: unknown) => {
          this.lastUpdate = payload;

          return {
            eq: (column: string, value: string) => {
              this.lastFilter = { column, value };

              return {
                select: () => ({
                  single: () => Promise.resolve({ data: row, error: null })
                })
              };
            }
          };
        }
      };
    }
  };
}
