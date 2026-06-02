import { describe, expect, it } from "vitest";

import {
  SupabaseAutomationCheckpointRepository,
  type AutomationCheckpointRow
} from "../../../src/repositories/automation-checkpoint.repository.js";

describe("SupabaseAutomationCheckpointRepository", () => {
  it("maps checkpoint inserts to the automation_checkpoints table", async () => {
    const client = createFakeClient([buildCheckpointRow()]);
    const repository = new SupabaseAutomationCheckpointRepository(client);

    const checkpoint = await repository.create({
      applicationId: "application_1",
      executionId: "exec_1",
      atsType: "greenhouse",
      currentStep: "human_review",
      checkpointData: { state: "HUMAN_APPROVAL_REQUIRED" },
      isCompleted: false
    });

    expect(client.lastTable).toBe("automation_checkpoints");
    expect(client.lastPayload).toEqual(
      expect.objectContaining({
        application_id: "application_1",
        execution_id: "exec_1",
        ats_type: "greenhouse",
        current_step: "human_review"
      })
    );
    expect(checkpoint.currentStep).toBe("human_review");
  });

  it("retrieves checkpoints by execution id", async () => {
    const client = createFakeClient([buildCheckpointRow()]);
    const repository = new SupabaseAutomationCheckpointRepository(client);

    await repository.findByExecutionId("exec_1");

    expect(client.lastFilter).toEqual({ column: "execution_id", value: "exec_1" });
    expect(client.lastOrder).toEqual({ column: "created_at", options: { ascending: true } });
  });
});

function buildCheckpointRow(): AutomationCheckpointRow {
  return {
    id: "checkpoint_1",
    application_id: "application_1",
    execution_id: "exec_1",
    ats_type: "greenhouse",
    current_step: "human_review",
    checkpoint_data: { state: "HUMAN_APPROVAL_REQUIRED" },
    is_completed: false,
    created_at: "2026-06-02T00:00:00.000Z",
    updated_at: "2026-06-02T00:00:00.000Z"
  };
}

function createFakeClient(rows: AutomationCheckpointRow[]) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    lastFilter: undefined as unknown,
    lastOrder: undefined as unknown,
    from(table: "automation_checkpoints") {
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
