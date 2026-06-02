import { ApplicationError } from "../errors/application-error.js";
import type { ApplicationEvent, ApplicationState } from "./application.types.js";
import { APPLICATION_STATES } from "./application.types.js";

const terminalStates = new Set<ApplicationState>(["REJECTED", "WITHDRAWN", "HIRED"]);

const allowedTransitions: Record<ApplicationState, ApplicationState[]> = {
  DISCOVERED: ["PARSED", "WITHDRAWN"],
  PARSED: ["SCORED", "WITHDRAWN"],
  SCORED: ["GENERATED", "WITHDRAWN"],
  GENERATED: ["RENDERED", "WITHDRAWN"],
  RENDERED: ["READY_FOR_APPLICATION", "WITHDRAWN"],
  READY_FOR_APPLICATION: ["HUMAN_APPROVAL_REQUIRED", "WITHDRAWN"],
  HUMAN_APPROVAL_REQUIRED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["INTERVIEWING", "REJECTED", "WITHDRAWN"],
  INTERVIEWING: ["OFFER", "REJECTED", "WITHDRAWN"],
  OFFER: ["HIRED", "REJECTED", "WITHDRAWN"],
  REJECTED: [],
  WITHDRAWN: [],
  HIRED: []
};

export class ApplicationStateMachine {
  canTransition(fromState: ApplicationState, toState: ApplicationState): boolean {
    return allowedTransitions[fromState].includes(toState);
  }

  assertCanTransition(fromState: ApplicationState, toState: ApplicationState): void {
    this.assertValidState(fromState);
    this.assertValidState(toState);

    if (!this.canTransition(fromState, toState)) {
      throw new ApplicationError(
        "INVALID_APPLICATION_TRANSITION",
        `Invalid application transition from ${fromState} to ${toState}`
      );
    }
  }

  assertValidState(state: string): asserts state is ApplicationState {
    if (!APPLICATION_STATES.includes(state as ApplicationState)) {
      throw new ApplicationError("INVALID_LIFECYCLE_STATE", `Invalid lifecycle state ${state}`);
    }
  }

  getAllowedNextStates(state: ApplicationState): ApplicationState[] {
    this.assertValidState(state);
    return [...allowedTransitions[state]];
  }

  isTerminal(state: ApplicationState): boolean {
    this.assertValidState(state);
    return terminalStates.has(state);
  }

  reconstructState(events: ApplicationEvent[]): ApplicationState {
    if (events.length === 0) {
      throw new ApplicationError("INVALID_LIFECYCLE_REQUEST", "Cannot reconstruct application state without events");
    }

    const ordered = [...events].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    const lastEvent = ordered.at(-1);

    if (!lastEvent) {
      throw new ApplicationError("INVALID_LIFECYCLE_REQUEST", "Cannot reconstruct application state without events");
    }

    return lastEvent.toState;
  }
}
