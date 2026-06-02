import { ApplicationError } from "../errors/application-error.js";

const EXECUTION_ID_PATTERN = /^exec_[a-z0-9]+_[a-z0-9]+$/;

export function createExecutionId(now: Date = new Date(), random = Math.random()): string {
  const timestamp = now.getTime().toString(36);
  const entropy = Math.floor(random * 1_000_000_000)
    .toString(36)
    .padStart(6, "0");

  return `exec_${timestamp}_${entropy}`;
}

export function assertExecutionId(executionId: string): string {
  if (!executionId || !EXECUTION_ID_PATTERN.test(executionId)) {
    throw new ApplicationError("INVALID_OBSERVABILITY_REQUEST", "Invalid execution id");
  }

  return executionId;
}
