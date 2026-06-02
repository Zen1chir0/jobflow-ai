import { describe, expect, it, vi } from "vitest";

import { RecordCheckpointUseCase } from "../../../src/use-cases/record-checkpoint.use-case.js";

describe("RecordCheckpointUseCase", () => {
  it("delegates checkpoint recording with one execution id", async () => {
    const recordCheckpoint = vi.fn().mockResolvedValue({
      id: "checkpoint_1",
      applicationId: "application_1",
      executionId: "exec_checkpoint_1",
      atsType: "greenhouse",
      currentStep: "human_review",
      checkpointData: {},
      isCompleted: false,
      createdAt: "2026-06-02T00:00:00.000Z",
      updatedAt: "2026-06-02T00:00:00.000Z"
    });
    const useCase = new RecordCheckpointUseCase({ recordCheckpoint } as never, () => "exec_checkpoint_1");

    const result = await useCase.execute({
      applicationId: "application_1",
      atsType: "greenhouse",
      currentStep: "human_review"
    });

    expect(recordCheckpoint).toHaveBeenCalledWith({
      applicationId: "application_1",
      executionId: "exec_checkpoint_1",
      atsType: "greenhouse",
      currentStep: "human_review"
    });
    expect(result.executionId).toBe("exec_checkpoint_1");
  });
});
