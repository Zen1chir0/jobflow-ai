import { describe, expect, it, vi } from "vitest";

import { TransitionApplicationStateUseCase } from "../../../src/use-cases/transition-application-state.use-case.js";

describe("TransitionApplicationStateUseCase", () => {
  it("delegates lifecycle transitions to the lifecycle service", async () => {
    const transitionApplication = vi.fn().mockResolvedValue({
      application: {
        id: "application_1",
        jobId: "job_1",
        currentState: "PARSED",
        createdAt: "2026-06-02T00:00:00.000Z",
        updatedAt: "2026-06-02T01:00:00.000Z"
      },
      event: {
        id: "event_1",
        applicationId: "application_1",
        fromState: "DISCOVERED",
        toState: "PARSED",
        eventType: "STATE_TRANSITION",
        metadata: {},
        createdAt: "2026-06-02T01:00:00.000Z"
      }
    });
    const useCase = new TransitionApplicationStateUseCase({ transitionApplication } as never);

    const result = await useCase.execute({ applicationId: "application_1", toState: "PARSED" });

    expect(transitionApplication).toHaveBeenCalledWith({ applicationId: "application_1", toState: "PARSED" });
    expect(result.application.currentState).toBe("PARSED");
  });
});
