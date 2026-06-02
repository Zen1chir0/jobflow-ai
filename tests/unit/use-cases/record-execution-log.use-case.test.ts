import { describe, expect, it, vi } from "vitest";

import { RecordExecutionLogUseCase } from "../../../src/use-cases/record-execution-log.use-case.js";

describe("RecordExecutionLogUseCase", () => {
  it("generates an execution id at use-case entry and delegates recording", async () => {
    const recordExecutionLog = vi.fn().mockResolvedValue({
      id: "log_1",
      executionId: "exec_generated_1",
      service: "parsing",
      step: "clean_html",
      status: "started",
      metadata: {},
      createdAt: "2026-06-02T00:00:00.000Z"
    });
    const useCase = new RecordExecutionLogUseCase({ recordExecutionLog } as never, () => "exec_generated_1");

    const result = await useCase.execute({
      service: "parsing",
      step: "clean_html",
      status: "started"
    });

    expect(recordExecutionLog).toHaveBeenCalledWith({
      executionId: "exec_generated_1",
      service: "parsing",
      step: "clean_html",
      status: "started"
    });
    expect(result.executionId).toBe("exec_generated_1");
  });
});
