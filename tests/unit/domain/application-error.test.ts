import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../src/domain/errors/application-error";

describe("ApplicationError", () => {
  it("preserves the stable application error code", () => {
    const cause = new Error("inner");
    const error = new ApplicationError("INVALID_ENVIRONMENT", "Bad environment", { cause });

    expect(error.name).toBe("ApplicationError");
    expect(error.code).toBe("INVALID_ENVIRONMENT");
    expect(error.message).toBe("Bad environment");
    expect(error.cause).toBe(cause);
  });
});
