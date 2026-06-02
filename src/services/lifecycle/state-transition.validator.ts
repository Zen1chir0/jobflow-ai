import { ApplicationError } from "../../domain/errors/application-error.js";
import { APPLICATION_STATES, type ApplicationState } from "../../domain/applications/application.types.js";
import { ApplicationStateMachine } from "../../domain/applications/application-state-machine.js";

export type TransitionValidationRequest = {
  fromState: ApplicationState;
  toState: ApplicationState;
  manualOverrideReason?: string;
};

export class StateTransitionValidator {
  constructor(private readonly stateMachine: ApplicationStateMachine = new ApplicationStateMachine()) {}

  validate(request: TransitionValidationRequest): void {
    if (request.manualOverrideReason !== undefined) {
      if (!request.manualOverrideReason.trim()) {
        throw new ApplicationError("MANUAL_OVERRIDE_REASON_REQUIRED", "Manual override requires a reason");
      }

      if (!APPLICATION_STATES.includes(request.toState)) {
        throw new ApplicationError("INVALID_LIFECYCLE_STATE", `Invalid lifecycle state ${request.toState}`);
      }

      return;
    }

    this.stateMachine.assertCanTransition(request.fromState, request.toState);
  }
}
