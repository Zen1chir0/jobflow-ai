import { describe, expect, it } from "vitest";

import { SupabaseExecutionLogRepository, type ExecutionLogRow } from "../../../src/repositories/execution-log.repository.js";

describe("SupabaseExecutionLogRepository", () => {
  it("maps execution log inserts to the execution_logs table", async () => {
    const client = createFakeClient([buildExecutionLogRow()]);
    const repository = new SupabaseExecutionLogRepository(client);

    const log = await repository.create({
      executionId: "exec_1",
      service: "ats",
      step: "upload_resume",
      status: "failed",
      applicationId: "application_1",
      atsType: "greenhouse",
      errorMessage: "Upload failed",
      metadata: { safe: true }
    });

    expect(client.lastTable).toBe("execution_logs");
    expect(client.lastPayload).toEqual(
      expect.objectContaining({
        execution_id: "exec_1",
        service: "ats",
        step: "upload_resume",
        status: "failed",
        application_id: "application_1",
        ats_type: "greenhouse"
      })
    );
    expect(log.executionId).toBe("exec_1");
  });

  it("retrieves execution logs ordered by creation time", async () => {
    const client = createFakeClient([buildExecutionLogRow()]);
    const repository = new SupabaseExecutionLogRepository(client);

    await repository.findByExecutionId("exec_1");

    expect(client.lastFilter).toEqual({ column: "execution_id", value: "exec_1" });
    expect(client.lastOrder).toEqual({ column: "created_at", options: { ascending: true } });
  });
});

function buildExecutionLogRow(): ExecutionLogRow {
  return {
    id: "log_1",
    execution_id: "exec_1",
    service: "ats",
    step: "upload_resume",
    status: "failed",
    job_id: null,
    application_id: "application_1",
    ats_type: "greenhouse",
    error_message: "Upload failed",
    error_stack: null,
    metadata: { safe: true },
    created_at: "2026-06-02T00:00:00.000Z"
  };
}

function createFakeClient(rows: ExecutionLogRow[]) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    lastFilter: undefined as unknown,
    lastOrder: undefined as unknown,
    from(table: "execution_logs") {
      this.lastTable = table;

      return {
        insert: (payload: unknown) => {
          this.lastPayload = payload;

          return {
            select: () => ({
              single: () => Promise.resolve({ data: rows[0] ?? null, error: null })
            })
          };
        },
        select: () => ({
          eq: (column: string, value: string) => {
            this.lastFilter = { column, value };

            return {
              order: (orderColumn: string, options: { ascending: boolean }) => {
                this.lastOrder = { column: orderColumn, options };
                return Promise.resolve({ data: rows, error: null });
              }
            };
          }
        })
      };
    }
  };
}
