import { describe, expect, it, vi } from "vitest";

import { createLifecycleCommand } from "../../src/cli/commands/lifecycle.command.js";
import type { CreateApplicationUseCase } from "../../src/use-cases/create-application.use-case.js";
import type { GetApplicationTimelineUseCase } from "../../src/use-cases/get-application-timeline.use-case.js";
import type { TransitionApplicationStateUseCase } from "../../src/use-cases/transition-application-state.use-case.js";

describe("lifecycle command", () => {
  it("parses create, transition, and timeline commands", async () => {
    const createExecute = vi.fn().mockResolvedValue({
      application: buildApplication("DISCOVERED")
    });
    const transitionExecute = vi.fn().mockResolvedValue({
      application: buildApplication("PARSED"),
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
    const timelineExecute = vi.fn().mockResolvedValue({
      timeline: {
        application: buildApplication("PARSED"),
        events: [
          {
            id: "event_1",
            applicationId: "application_1",
            toState: "DISCOVERED",
            eventType: "APPLICATION_CREATED",
            metadata: {},
            createdAt: "2026-06-02T00:00:00.000Z"
          }
        ],
        reconstructedState: "DISCOVERED"
      }
    });
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const command = createLifecycleCommand(() => ({
      createApplicationUseCase: { execute: createExecute } as unknown as CreateApplicationUseCase,
      transitionApplicationStateUseCase: {
        execute: transitionExecute
      } as unknown as TransitionApplicationStateUseCase,
      getApplicationTimelineUseCase: { execute: timelineExecute } as unknown as GetApplicationTimelineUseCase
    }));

    await command.parseAsync(["create", "--job-id", "job_1", "--execution-id", "exec_1"], { from: "user" });
    await command.parseAsync(["transition", "--application-id", "application_1", "--to", "PARSED"], { from: "user" });
    await command.parseAsync(["timeline", "--application-id", "application_1"], { from: "user" });

    expect(createExecute).toHaveBeenCalledWith({
      jobId: "job_1",
      executionId: "exec_1"
    });
    expect(transitionExecute).toHaveBeenCalledWith({
      applicationId: "application_1",
      toState: "PARSED"
    });
    expect(timelineExecute).toHaveBeenCalledWith({
      applicationId: "application_1"
    });
    expect(output).toHaveBeenCalledWith("Created application application_1");
    expect(output).toHaveBeenCalledWith("Transitioned application application_1");
    expect(output).toHaveBeenCalledWith("Application application_1");
  });
});

function buildApplication(currentState: string) {
  return {
    id: "application_1",
    jobId: "job_1",
    currentState,
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z"
  };
}
