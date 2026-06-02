import { describe, expect, it, vi } from "vitest";

import { createObservabilityCommand } from "../../src/cli/commands/observability.command.js";
import type { GetExecutionLogsUseCase } from "../../src/use-cases/get-execution-logs.use-case.js";
import type { RecordCheckpointUseCase } from "../../src/use-cases/record-checkpoint.use-case.js";
import type { RecordExecutionLogUseCase } from "../../src/use-cases/record-execution-log.use-case.js";
import type { RecordFailureUseCase } from "../../src/use-cases/record-failure.use-case.js";

describe("observability command", () => {
  it("parses logs, record-log, record-failure, and record-checkpoint commands", async () => {
    const logsExecute = vi.fn().mockResolvedValue({
      logs: [
        {
          id: "log_1",
          executionId: "exec_1",
          service: "ats",
          step: "start",
          status: "started",
          metadata: {},
          createdAt: "2026-06-02T00:00:00.000Z"
        }
      ]
    });
    const recordLogExecute = vi.fn().mockResolvedValue({
      executionId: "exec_1",
      log: buildLog("log_2", "success")
    });
    const recordFailureExecute = vi.fn().mockResolvedValue({
      executionId: "exec_1",
      log: buildLog("log_3", "failed")
    });
    const recordCheckpointExecute = vi.fn().mockResolvedValue({
      executionId: "exec_1",
      checkpoint: {
        id: "checkpoint_1",
        applicationId: "application_1",
        executionId: "exec_1",
        atsType: "greenhouse",
        currentStep: "human_review",
        checkpointData: {},
        isCompleted: false,
        createdAt: "2026-06-02T00:00:00.000Z",
        updatedAt: "2026-06-02T00:00:00.000Z"
      }
    });
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createObservabilityCommand(() => ({
      getExecutionLogsUseCase: { execute: logsExecute } as unknown as GetExecutionLogsUseCase,
      recordExecutionLogUseCase: { execute: recordLogExecute } as unknown as RecordExecutionLogUseCase,
      recordFailureUseCase: { execute: recordFailureExecute } as unknown as RecordFailureUseCase,
      recordCheckpointUseCase: { execute: recordCheckpointExecute } as unknown as RecordCheckpointUseCase
    }));

    await command.parseAsync(["logs", "--execution-id", "exec_1"], { from: "user" });
    await command.parseAsync(
      ["record-log", "--service", "ats", "--step", "start", "--status", "success", "--execution-id", "exec_1"],
      { from: "user" }
    );
    await command.parseAsync(
      ["record-failure", "--service", "ats", "--step", "upload_resume", "--message", "failed", "--execution-id", "exec_1"],
      { from: "user" }
    );
    await command.parseAsync(
      [
        "record-checkpoint",
        "--application-id",
        "application_1",
        "--ats-type",
        "greenhouse",
        "--current-step",
        "human_review",
        "--execution-id",
        "exec_1"
      ],
      { from: "user" }
    );

    expect(logsExecute).toHaveBeenCalledWith({ executionId: "exec_1" });
    expect(recordLogExecute).toHaveBeenCalledWith({
      service: "ats",
      step: "start",
      status: "success",
      executionId: "exec_1"
    });
    expect(recordFailureExecute).toHaveBeenCalledWith({
      service: "ats",
      step: "upload_resume",
      error: "failed",
      executionId: "exec_1"
    });
    expect(recordCheckpointExecute).toHaveBeenCalledWith({
      applicationId: "application_1",
      atsType: "greenhouse",
      currentStep: "human_review",
      executionId: "exec_1"
    });
    expect(output).toHaveBeenCalledWith("Execution logs 1");
    expect(output).toHaveBeenCalledWith("Recorded execution log log_2");
    expect(output).toHaveBeenCalledWith("Recorded failure log log_3");
    expect(output).toHaveBeenCalledWith("Recorded checkpoint checkpoint_1");
  });
});

function buildLog(id: string, status: string) {
  return {
    id,
    executionId: "exec_1",
    service: "ats",
    step: "start",
    status,
    metadata: {},
    createdAt: "2026-06-02T00:00:00.000Z"
  };
}
