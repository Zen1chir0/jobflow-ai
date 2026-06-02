import { describe, expect, it } from "vitest";

import { assertExecutionId, createExecutionId } from "../../../../src/domain/observability/execution-id.js";

describe("execution id", () => {
  it("creates stable trace identifiers with the exec prefix", () => {
    const executionId = createExecutionId(new Date("2026-06-02T00:00:00.000Z"), 0.5);

    expect(executionId).toMatch(/^exec_[a-z0-9]+_[a-z0-9]+$/);
    expect(assertExecutionId(executionId)).toBe(executionId);
  });

  it("rejects invalid execution identifiers", () => {
    expect(() => assertExecutionId("bad-id")).toThrow("Invalid execution id");
  });
});
