import { describe, expect, it } from "vitest";

import {
  SupabaseApplicationEventRepository,
  type ApplicationEventRow
} from "../../../src/repositories/application-event.repository.js";

describe("SupabaseApplicationEventRepository", () => {
  it("creates lifecycle events through the application_events table", async () => {
    const client = createFakeClient([buildEventRow()]);
    const repository = new SupabaseApplicationEventRepository(client);

    const event = await repository.create({
      applicationId: "application_1",
      fromState: "DISCOVERED",
      toState: "PARSED",
      eventType: "STATE_TRANSITION",
      executionId: "exec_1",
      metadata: { reason: "parsed" }
    });

    expect(client.lastTable).toBe("application_events");
    expect(client.lastPayload).toEqual(
      expect.objectContaining({
        application_id: "application_1",
        from_state: "DISCOVERED",
        to_state: "PARSED",
        event_type: "STATE_TRANSITION",
        execution_id: "exec_1",
        metadata: { reason: "parsed" }
      })
    );
    expect(event.toState).toBe("PARSED");
  });

  it("loads application events in timeline order", async () => {
    const client = createFakeClient([buildEventRow()]);
    const repository = new SupabaseApplicationEventRepository(client);

    const events = await repository.findByApplicationId("application_1");

    expect(client.lastFilter).toEqual({ column: "application_id", value: "application_1" });
    expect(client.lastOrder).toEqual({ column: "created_at", options: { ascending: true } });
    expect(events).toHaveLength(1);
  });
});

function buildEventRow(): ApplicationEventRow {
  return {
    id: "event_1",
    application_id: "application_1",
    from_state: "DISCOVERED",
    to_state: "PARSED",
    event_type: "STATE_TRANSITION",
    execution_id: "exec_1",
    metadata: { reason: "parsed" },
    created_at: "2026-06-02T00:00:00.000Z"
  };
}

function createFakeClient(rows: ApplicationEventRow[]) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    lastFilter: undefined as unknown,
    lastOrder: undefined as unknown,
    from(table: "application_events") {
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
