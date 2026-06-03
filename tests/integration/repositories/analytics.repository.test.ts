import { describe, expect, it } from "vitest";

import { SupabaseAnalyticsRepository } from "../../../src/repositories/analytics.repository.js";

describe("SupabaseAnalyticsRepository", () => {
  it("loads analytics sources with read-only selects", async () => {
    const client = createFakeClient();
    const repository = new SupabaseAnalyticsRepository(client);

    const dataset = await repository.getDataset();

    expect(client.tables).toEqual([
      "applications",
      "application_events",
      "execution_logs",
      "automation_checkpoints",
      "jobs",
      "parsed_job_profiles",
      "job_match_scores",
      "generated_documents",
      "generated_resumes",
      "application_summary_view",
      "application_state_counts_view",
      "platform_performance_view"
    ]);
    expect(client.writeCalled).toBe(false);
    expect(dataset.applications[0]?.currentState).toBe("HIRED");
    expect(dataset.executionLogs[0]?.status).toBe("success");
  });
});

function createFakeClient() {
  const rowsByTable = {
    applications: [
      {
        id: "application_1",
        current_state: "HIRED",
        ats_type: "greenhouse",
        created_at: "2026-06-03T00:00:00.000Z",
        updated_at: "2026-06-03T00:00:00.000Z"
      }
    ],
    application_events: [
      {
        id: "event_1",
        application_id: "application_1",
        from_state: "OFFER",
        to_state: "HIRED",
        event_type: "STATE_TRANSITION",
        execution_id: "exec_1",
        created_at: "2026-06-03T00:00:00.000Z"
      }
    ],
    execution_logs: [
      {
        id: "log_1",
        execution_id: "exec_1",
        service: "ats",
        step: "human_review",
        status: "success",
        application_id: "application_1",
        ats_type: "greenhouse",
        error_message: null,
        created_at: "2026-06-03T00:00:00.000Z"
      }
    ],
    automation_checkpoints: [
      {
        id: "checkpoint_1",
        application_id: "application_1",
        execution_id: "exec_1",
        ats_type: "greenhouse",
        current_step: "human_review",
        is_completed: true,
        created_at: "2026-06-03T00:00:00.000Z"
      }
    ],
    jobs: [
      {
        id: "job_1",
        discovered_at: "2026-06-03T00:00:00.000Z",
        parsed_at: "2026-06-03T01:00:00.000Z",
        source: "manual",
        ats_type: "greenhouse"
      }
    ],
    parsed_job_profiles: [{ id: "profile_1", job_id: "job_1" }],
    job_match_scores: [{ id: "score_1", job_id: "job_1", final_score: 90 }],
    generated_documents: [
      {
        id: "document_1",
        job_id: "job_1",
        document_type: "resume_json",
        created_at: "2026-06-03T00:00:00.000Z"
      }
    ],
    generated_resumes: [
      {
        id: "resume_1",
        job_id: "job_1",
        template: "ats",
        created_at: "2026-06-03T00:00:00.000Z"
      }
    ],
    application_summary_view: [
      {
        application_id: "application_1",
        title: "QA Engineer",
        company: "Example",
        source: "manual",
        ats_type: "greenhouse",
        current_state: "HIRED",
        final_score: 90,
        created_at: "2026-06-03T00:00:00.000Z",
        updated_at: "2026-06-03T00:00:00.000Z"
      }
    ],
    application_state_counts_view: [{ current_state: "HIRED", count: 1 }],
    platform_performance_view: [
      {
        source: "manual",
        total_applications: 1,
        positive_responses: 1,
        positive_response_rate: 100
      }
    ]
  };

  return {
    tables: [] as string[],
    writeCalled: false,
    from(table: keyof typeof rowsByTable) {
      this.tables.push(table);

      return {
        select: () => Promise.resolve({ data: rowsByTable[table], error: null }),
        insert: () => {
          this.writeCalled = true;
        },
        update: () => {
          this.writeCalled = true;
        },
        delete: () => {
          this.writeCalled = true;
        }
      };
    }
  };
}
