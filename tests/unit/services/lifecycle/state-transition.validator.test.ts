import { describe, expect, it } from "vitest";

import { StateTransitionValidator } from "../../../../src/services/lifecycle/state-transition.validator.js";

describe("StateTransitionValidator", () => {
  it("allows valid lifecycle transitions", () => {
    const validator = new StateTransitionValidator();

    expect(() => validator.validate({ fromState: "DISCOVERED", toState: "PARSED" })).not.toThrow();
  });

  it("rejects invalid lifecycle transitions", () => {
    const validator = new StateTransitionValidator();

    expect(() => validator.validate({ fromState: "DISCOVERED", toState: "OFFER" })).toThrow(
      "Invalid application transition"
    );
  });

  it("requires a reason for manual overrides", () => {
    const validator = new StateTransitionValidator();

    expect(() =>
      validator.validate({ fromState: "DISCOVERED", toState: "OFFER", manualOverrideReason: "" })
    ).toThrow("Manual override requires a reason");
    expect(() =>
      validator.validate({ fromState: "DISCOVERED", toState: "OFFER", manualOverrideReason: "Recruiter update" })
    ).not.toThrow();
  });
});
