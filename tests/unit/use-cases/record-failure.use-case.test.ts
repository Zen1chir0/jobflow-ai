import { describe, expect, it, vi } from "vitest";

import { RecordFailureUseCase } from "../../../src/use-cases/record-failure.use-case.js";

describe("RecordFailureUseCase", () => {
  it("preserves provided execution ids when recording failures", async () => {
    const recordFailure = vi.fn().mockResolvedValue({
      id: "log_1",
      executionId: "exec_1",
      service: "ats",
      step: "upload_resume",
      status: "failed",
      metadata: {},
      errorMessage: "Upload failed",
      createdAt: "2026-06-02T00:00:00.000Z"
    });
    const useCase = new RecordFailureUseCase({ recordFailure } as never);

    const result = await useCase.execute({
      executionId: "exec_1",
      service: "ats",
      step: "upload_resume",
      error: "Upload failed"
    });

    expect(recordFailure).toHaveBeenCalledWith({
      executionId: "exec_1",
      service: "ats",
      step: "upload_resume",
      error: "Upload failed"
    });
    expect(result.executionId).toBe("exec_1");
  });
});
