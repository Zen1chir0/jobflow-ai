import { describe, expect, it } from "vitest";

import { ApplicationStateMachine } from "../../../../src/domain/applications/application-state-machine.js";

describe("ApplicationStateMachine", () => {
  it("validates the approved lifecycle transition path", () => {
    const stateMachine = new ApplicationStateMachine();

    expect(stateMachine.canTransition("DISCOVERED", "PARSED")).toBe(true);
    expect(stateMachine.canTransition("PARSED", "SCORED")).toBe(true);
    expect(stateMachine.canTransition("SCORED", "GENERATED")).toBe(true);
    expect(stateMachine.canTransition("GENERATED", "RENDERED")).toBe(true);
    expect(stateMachine.canTransition("RENDERED", "READY_FOR_APPLICATION")).toBe(true);
    expect(stateMachine.canTransition("READY_FOR_APPLICATION", "HUMAN_APPROVAL_REQUIRED")).toBe(true);
    expect(stateMachine.canTransition("HUMAN_APPROVAL_REQUIRED", "APPLIED")).toBe(true);
    expect(stateMachine.canTransition("APPLIED", "INTERVIEWING")).toBe(true);
    expect(stateMachine.canTransition("INTERVIEWING", "OFFER")).toBe(true);
    expect(stateMachine.canTransition("OFFER", "HIRED")).toBe(true);
  });

  it("rejects invalid jumps without manual override", () => {
    const stateMachine = new ApplicationStateMachine();

    expect(() => stateMachine.assertCanTransition("DISCOVERED", "INTERVIEWING")).toThrow(
      "Invalid application transition"
    );
  });

  it("reconstructs current state from ordered events", () => {
    const stateMachine = new ApplicationStateMachine();

    const state = stateMachine.reconstructState([
      {
        id: "event_2",
        applicationId: "application_1",
        fromState: "DISCOVERED",
        toState: "PARSED",
        eventType: "STATE_TRANSITION",
        metadata: {},
        createdAt: "2026-06-02T01:00:00.000Z"
      },
      {
        id: "event_1",
        applicationId: "application_1",
        toState: "DISCOVERED",
        eventType: "APPLICATION_CREATED",
        metadata: {},
        createdAt: "2026-06-02T00:00:00.000Z"
      }
    ]);

    expect(state).toBe("PARSED");
  });
});
