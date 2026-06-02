import { describe, expect, it, vi } from "vitest";

import { CreateApplicationUseCase } from "../../../src/use-cases/create-application.use-case.js";

describe("CreateApplicationUseCase", () => {
  it("delegates application creation to the lifecycle service", async () => {
    const createApplication = vi.fn().mockResolvedValue({
      id: "application_1",
      jobId: "job_1",
      currentState: "DISCOVERED",
      createdAt: "2026-06-02T00:00:00.000Z",
      updatedAt: "2026-06-02T00:00:00.000Z"
    });
    const useCase = new CreateApplicationUseCase({ createApplication } as never);

    const result = await useCase.execute({ jobId: "job_1", executionId: "exec_1" });

    expect(createApplication).toHaveBeenCalledWith({ jobId: "job_1", executionId: "exec_1" });
    expect(result.application.id).toBe("application_1");
  });
});
