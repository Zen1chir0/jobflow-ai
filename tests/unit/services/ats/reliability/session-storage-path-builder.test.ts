import { describe, expect, it } from "vitest";

import { SessionStoragePathBuilder } from "../../../../../src/services/ats/reliability/session-storage-path-builder.js";

describe("SessionStoragePathBuilder", () => {
  it("builds session paths under ignored local storage", () => {
    const builder = new SessionStoragePathBuilder();

    expect(builder.build({ atsType: "workday", profileId: "default" })).toBe(
      "storage/playwright-state/workday_default.json"
    );
  });

  it("rejects traversal-like session path segments", () => {
    const builder = new SessionStoragePathBuilder();

    expect(() => builder.build({ atsType: "workday", profileId: "../default" })).toThrow(
      "Invalid session storage path segment"
    );
  });
});
