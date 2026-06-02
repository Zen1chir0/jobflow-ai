import { describe, expect, it, vi } from "vitest";

import type { AutomationCheckpoint, ExecutionLog } from "../../../../src/domain/observability/observability.types.js";
import { ObservabilityService } from "../../../../src/services/observability/observability.service.js";

describe("ObservabilityService", () => {
  it("records logs, failures, and checkpoints with the same execution id", async () => {
    const logInputs: Partial<ExecutionLog>[] = [];
    const checkpointInputs: Partial<AutomationCheckpoint>[] = [];
    const createLog = vi.fn((log: Partial<ExecutionLog>) => {
      logInputs.push(log);
      return Promise.resolve(buildLog(log));
    });
    const createCheckpoint = vi.fn((checkpoint: Partial<AutomationCheckpoint>) => {
      checkpointInputs.push(checkpoint);
      return Promise.resolve(buildCheckpoint(checkpoint));
    });
    const service = new ObservabilityService(
      { create: createLog, findByExecutionId: vi.fn() },
      { create: createCheckpoint, findByExecutionId: vi.fn() }
    );

    await service.recordExecutionLog({
      executionId: "exec_trace_001",
      service: "ats",
      step: "start",
      status: "started"
    });
    await service.recordFailure({
      executionId: "exec_trace_001",
      service: "ats",
      step: "upload_resume",
      error: new Error("Upload failed")
    });
    await service.recordCheckpoint({
      applicationId: "application_1",
      executionId: "exec_trace_001",
      atsType: "greenhouse",
      currentStep: "upload_resume"
    });

    expect(logInputs[0]?.executionId).toBe("exec_trace_001");
    expect(logInputs[1]?.executionId).toBe("exec_trace_001");
    expect(checkpointInputs[0]?.executionId).toBe("exec_trace_001");
  });

  it("retrieves execution logs by execution id", async () => {
    const logs = [buildLog({ executionId: "exec_1", service: "ats", step: "start", status: "started" })];
    const findByExecutionId = vi.fn().mockResolvedValue(logs);
    const service = new ObservabilityService(
      { create: vi.fn(), findByExecutionId },
      { create: vi.fn(), findByExecutionId: vi.fn() }
    );

    await expect(service.getExecutionLogs("exec_1")).resolves.toBe(logs);
    expect(findByExecutionId).toHaveBeenCalledWith("exec_1");
  });
});

function buildLog(overrides: Partial<ExecutionLog>): ExecutionLog {
  return {
    id: "log_1",
    executionId: "exec_1",
    service: "ats",
    step: "start",
    status: "started",
    metadata: {},
    createdAt: "2026-06-02T00:00:00.000Z",
    ...overrides
  };
}

function buildCheckpoint(overrides: Partial<AutomationCheckpoint>): AutomationCheckpoint {
  return {
    id: "checkpoint_1",
    applicationId: "application_1",
    executionId: "exec_1",
    atsType: "greenhouse",
    currentStep: "start",
    checkpointData: {},
    isCompleted: false,
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z",
    ...overrides
  };
}
