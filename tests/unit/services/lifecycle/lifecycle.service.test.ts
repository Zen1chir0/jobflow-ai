import { describe, expect, it, vi } from "vitest";

import type { Application, ApplicationEvent } from "../../../../src/domain/applications/application.types.js";
import { LifecycleService } from "../../../../src/services/lifecycle/lifecycle.service.js";

describe("LifecycleService", () => {
  it("creates an application snapshot and initial event", async () => {
    const application = buildApplication();
    const createApplication = vi.fn().mockResolvedValue(application);
    const createEvent = vi.fn().mockResolvedValue(buildEvent());
    const service = new LifecycleService(
      { create: createApplication, findById: vi.fn(), findByJobId: vi.fn(), updateState: vi.fn() },
      { create: createEvent, findByApplicationId: vi.fn() }
    );

    const result = await service.createApplication({ jobId: "job_1", executionId: "exec_1" });

    expect(createApplication).toHaveBeenCalledWith({ jobId: "job_1", currentState: "DISCOVERED", executionId: "exec_1" });
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: "application_1",
        toState: "DISCOVERED",
        eventType: "APPLICATION_CREATED",
        executionId: "exec_1"
      })
    );
    expect(result.id).toBe("application_1");
  });

  it("validates transitions, updates snapshot, and creates transition event", async () => {
    const application = buildApplication();
    const updatedApplication = { ...application, currentState: "PARSED" as const };
    const event = buildEvent({ fromState: "DISCOVERED", toState: "PARSED", eventType: "STATE_TRANSITION" });
    const updateState = vi.fn().mockResolvedValue(updatedApplication);
    const createEvent = vi.fn().mockResolvedValue(event);
    const service = new LifecycleService(
      { create: vi.fn(), findById: vi.fn().mockResolvedValue(application), findByJobId: vi.fn(), updateState },
      { create: createEvent, findByApplicationId: vi.fn() }
    );

    const result = await service.transitionApplication({
      applicationId: "application_1",
      toState: "PARSED",
      executionId: "exec_2"
    });

    expect(updateState).toHaveBeenCalledWith({
      applicationId: "application_1",
      toState: "PARSED",
      executionId: "exec_2"
    });
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        fromState: "DISCOVERED",
        toState: "PARSED",
        eventType: "STATE_TRANSITION"
      })
    );
    expect(result.application.currentState).toBe("PARSED");
  });

  it("builds an ordered timeline with reconstructed state", async () => {
    const application = { ...buildApplication(), currentState: "PARSED" as const };
    const events = [
      buildEvent({ toState: "DISCOVERED", createdAt: "2026-06-02T00:00:00.000Z" }),
      buildEvent({
        id: "event_2",
        fromState: "DISCOVERED",
        toState: "PARSED",
        eventType: "STATE_TRANSITION",
        createdAt: "2026-06-02T01:00:00.000Z"
      })
    ];
    const service = new LifecycleService(
      { create: vi.fn(), findById: vi.fn().mockResolvedValue(application), findByJobId: vi.fn(), updateState: vi.fn() },
      { create: vi.fn(), findByApplicationId: vi.fn().mockResolvedValue(events) }
    );

    const timeline = await service.getTimeline("application_1");

    expect(timeline.reconstructedState).toBe("PARSED");
    expect(timeline.events).toHaveLength(2);
  });
});

function buildApplication(): Application {
  return {
    id: "application_1",
    jobId: "job_1",
    currentState: "DISCOVERED",
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z"
  };
}

function buildEvent(overrides: Partial<ApplicationEvent> = {}): ApplicationEvent {
  return {
    id: "event_1",
    applicationId: "application_1",
    toState: "DISCOVERED",
    eventType: "APPLICATION_CREATED",
    metadata: {},
    createdAt: "2026-06-02T00:00:00.000Z",
    ...overrides
  };
}
