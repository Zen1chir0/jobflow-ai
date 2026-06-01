import { describe, expect, it } from "vitest";

import { buildCoverLetterPrompt } from "../../../../src/services/document-generation/prompt-builders/cover-letter.prompt-builder.js";
import { buildRecruiterMessagePrompt } from "../../../../src/services/document-generation/prompt-builders/recruiter-message.prompt-builder.js";
import { buildResumeJsonPrompt } from "../../../../src/services/document-generation/prompt-builders/resume-json.prompt-builder.js";
import { buildScreeningResponsePrompt } from "../../../../src/services/document-generation/prompt-builders/screening-response.prompt-builder.js";
import { buildGenerationInput } from "./support/document-generation.fixtures.js";

describe("document prompt builders", () => {
  it("builds resume JSON prompts with hallucination prevention instructions", () => {
    const prompt = buildResumeJsonPrompt(buildGenerationInput());

    expect(prompt.responseSchemaName).toBe("ResumeJson");
    expect(prompt.systemPrompt).toContain("Do not invent companies");
    expect(prompt.userPrompt).toContain("fragment_1");
    expect(prompt.userPrompt).toContain("Every non-empty generated claim");
  });

  it("builds prompts for all Phase 5 artifacts", () => {
    const input = buildGenerationInput({ screeningQuestion: "Why are you a fit?" });

    expect(buildCoverLetterPrompt(input).responseSchemaName).toBe("CoverLetterDraft");
    expect(buildRecruiterMessagePrompt(input).responseSchemaName).toBe("RecruiterMessageDraft");
    expect(buildScreeningResponsePrompt(input).responseSchemaName).toBe("ScreeningResponseDraft");
  });
});
