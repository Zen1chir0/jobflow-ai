import { describe, expect, it } from "vitest";

import { SemanticLocatorService } from "../../../../src/services/ats/semantic-locator.service.js";

describe("SemanticLocatorService", () => {
  it("resolves candidates using accessibility-first priority", async () => {
    const service = new SemanticLocatorService();

    const result = await service.resolve(
      {
        fieldKey: "first_name",
        candidates: [
          { strategy: "css", value: "input[name='first_name']" },
          { strategy: "label", value: /first name/i },
          { strategy: "placeholder", value: /first/i }
        ]
      },
      {
        canResolve: (candidate) => candidate.strategy === "label" || candidate.strategy === "css"
      }
    );

    expect(result.strategy).toBe("label");
  });

  it("throws when no semantic locator can resolve a field", async () => {
    const service = new SemanticLocatorService();

    await expect(
      service.resolve(
        {
          fieldKey: "email",
          candidates: [{ strategy: "label", value: /email/i }]
        },
        { canResolve: () => false }
      )
    ).rejects.toMatchObject({ code: "SEMANTIC_LOCATOR_NOT_FOUND" });
  });
});
