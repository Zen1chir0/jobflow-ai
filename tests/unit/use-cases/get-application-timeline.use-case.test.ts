import { describe, expect, it, vi } from "vitest";

import { GetApplicationTimelineUseCase } from "../../../src/use-cases/get-application-timeline.use-case.js";

describe("GetApplicationTimelineUseCase", () => {
  it("delegates timeline lookup to the lifecycle service", async () => {
    const getTimeline = vi.fn().mockResolvedValue({
      application: {
        id: "application_1",
        jobId: "job_1",
        currentState: "PARSED",
        createdAt: "2026-06-02T00:00:00.000Z",
        updatedAt: "2026-06-02T01:00:00.000Z"
      },
      events: [],
      reconstructedState: "PARSED"
    });
    const useCase = new GetApplicationTimelineUseCase({ getTimeline } as never);

    const result = await useCase.execute({ applicationId: "application_1" });

    expect(getTimeline).toHaveBeenCalledWith("application_1");
    expect(result.timeline.reconstructedState).toBe("PARSED");
  });
});
