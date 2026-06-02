import { describe, expect, it } from "vitest";

import { WorkdayStateMachine } from "../../../../../src/services/ats/workday/workday-state-machine.js";

describe("WorkdayStateMachine", () => {
  it("validates the deterministic Workday transition order", () => {
    const stateMachine = new WorkdayStateMachine();

    expect(stateMachine.canTransition("LOGIN_REQUIRED", "PERSONAL_INFO")).toBe(true);
    expect(stateMachine.canTransition("PERSONAL_INFO", "EXPERIENCE")).toBe(true);
    expect(stateMachine.canTransition("EXPERIENCE", "DOCUMENT_UPLOAD")).toBe(true);
    expect(stateMachine.canTransition("DOCUMENT_UPLOAD", "SCREENING")).toBe(true);
    expect(stateMachine.canTransition("SCREENING", "REVIEW")).toBe(true);
    expect(stateMachine.canTransition("REVIEW", "HUMAN_APPROVAL_REQUIRED")).toBe(true);
  });

  it("rejects invalid Workday transitions", () => {
    const stateMachine = new WorkdayStateMachine();

    expect(() => stateMachine.assertCanTransition("LOGIN_REQUIRED", "DOCUMENT_UPLOAD")).toThrow(
      "Invalid Workday transition"
    );
  });
});
