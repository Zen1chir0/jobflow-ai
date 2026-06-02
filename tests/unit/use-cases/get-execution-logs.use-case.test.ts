import { describe, expect, it, vi } from "vitest";

import { GetExecutionLogsUseCase } from "../../../src/use-cases/get-execution-logs.use-case.js";

describe("GetExecutionLogsUseCase", () => {
  it("delegates execution log lookup to the observability service", async () => {
    const getExecutionLogs = vi.fn().mockResolvedValue([
      {
        id: "log_1",
        executionId: "exec_1",
        service: "ats",
        step: "start",
        status: "started",
        metadata: {},
        createdAt: "2026-06-02T00:00:00.000Z"
      }
    ]);
    const useCase = new GetExecutionLogsUseCase({ getExecutionLogs } as never);

    const result = await useCase.execute({ executionId: "exec_1" });

    expect(getExecutionLogs).toHaveBeenCalledWith("exec_1");
    expect(result.logs).toHaveLength(1);
  });
});
