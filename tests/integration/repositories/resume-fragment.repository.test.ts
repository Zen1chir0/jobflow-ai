import { describe, expect, it } from "vitest";

import {
  SupabaseResumeFragmentRepository,
  type MatchedResumeFragmentRow,
  type ResumeFragmentRow
} from "../../../src/repositories/resume-fragment.repository.js";

describe("SupabaseResumeFragmentRepository", () => {
  it("creates resume fragments through the user_resume_fragments table", async () => {
    const client = createFakeClient(buildRow());
    const repository = new SupabaseResumeFragmentRepository(client);

    const fragment = await repository.create({
      userProfileId: "user_1",
      fragmentText: "Built Playwright framework.",
      fragmentType: "project",
      sourceLabel: "FlowSentinel",
      metadata: { stack: ["Playwright"] },
      embedding: [0.1, 0.2]
    });

    expect(client.lastTable).toBe("user_resume_fragments");
    expect(client.lastPayload).toEqual({
      user_profile_id: "user_1",
      fragment_text: "Built Playwright framework.",
      fragment_type: "project",
      source_label: "FlowSentinel",
      metadata: { stack: ["Playwright"] },
      embedding: [0.1, 0.2]
    });
    expect(fragment).toEqual(
      expect.objectContaining({
        id: "fragment_1",
        userProfileId: "user_1",
        fragmentText: "Built Playwright framework."
      })
    );
  });

  it("uses match_resume_fragments RPC for similarity retrieval", async () => {
    const client = createFakeClient(buildRow(), [
      {
        id: "fragment_1",
        fragment_text: "Built Playwright framework.",
        fragment_type: "project",
        metadata: {},
        similarity: 0.91
      }
    ]);
    const repository = new SupabaseResumeFragmentRepository(client);

    const fragments = await repository.matchResumeFragments([0.1, 0.2], 0.72, 5);

    expect(client.lastRpc).toEqual({
      functionName: "match_resume_fragments",
      args: {
        query_embedding: [0.1, 0.2],
        match_threshold: 0.72,
        match_count: 5
      }
    });
    expect(fragments).toEqual([
      expect.objectContaining({
        id: "fragment_1",
        similarity: 0.91
      })
    ]);
  });
});

function buildRow(): ResumeFragmentRow {
  return {
    id: "fragment_1",
    user_profile_id: "user_1",
    fragment_text: "Built Playwright framework.",
    fragment_type: "project",
    source_label: "FlowSentinel",
    metadata: { stack: ["Playwright"] },
    embedding: [0.1, 0.2],
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z"
  };
}

function createFakeClient(row: ResumeFragmentRow | null, matchedRows: MatchedResumeFragmentRow[] = []) {
  return {
    lastTable: "",
    lastPayload: undefined as unknown,
    lastRpc: undefined as unknown,
    from(table: "user_resume_fragments") {
      this.lastTable = table;

      return {
        insert: (payload: unknown) => {
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
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: row ? [row] : [],
                error: null
              })
          })
        })
      };
    },
    rpc(functionName: "match_resume_fragments", args: unknown) {
      this.lastRpc = { functionName, args };

      return Promise.resolve({
        data: matchedRows,
        error: null
      });
    }
  };
}
