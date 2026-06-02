import { describe, expect, it } from "vitest";

import { InMemoryATSCheckpointStore } from "../../../../../src/services/ats/reliability/in-memory-ats-checkpoint-store.js";

describe("InMemoryATSCheckpointStore", () => {
  it("saves and retrieves the latest ATS checkpoint without database access", async () => {
    const store = new InMemoryATSCheckpointStore();

    await store.save({
      executionId: "exec_1",
      atsType: "workday",
      jobId: "job_1",
      step: "PERSONAL_INFO",
      payload: { currentState: "PERSONAL_INFO" },
      createdAt: "2026-06-02T00:00:00.000Z"
    });
    await store.save({
      executionId: "exec_1",
      atsType: "workday",
      jobId: "job_1",
      step: "DOCUMENT_UPLOAD",
      payload: { currentState: "DOCUMENT_UPLOAD" },
      createdAt: "2026-06-02T00:01:00.000Z"
    });

    await expect(store.findLatest({ executionId: "exec_1", jobId: "job_1" })).resolves.toMatchObject({
      step: "DOCUMENT_UPLOAD",
      payload: { currentState: "DOCUMENT_UPLOAD" }
    });
  });
});
