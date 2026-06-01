import { describe, expect, it } from "vitest";

import { validateCoverLetterDraft } from "../../../../src/services/document-generation/validators/cover-letter.validator.js";
import { validateRecruiterMessageDraft } from "../../../../src/services/document-generation/validators/recruiter-message.validator.js";
import { validateResumeJson } from "../../../../src/services/document-generation/validators/resume-json.validator.js";
import { validateScreeningResponseDraft } from "../../../../src/services/document-generation/validators/screening-response.validator.js";
import {
  buildCoverLetterDraft,
  buildRecruiterMessageDraft,
  buildResumeJson,
  buildScreeningResponseDraft
} from "./support/document-generation.fixtures.js";

describe("document generation validators", () => {
  it("validates supported structured outputs", () => {
    expect(validateResumeJson({ resumeJson: buildResumeJson() }).skills).toEqual(["Playwright", "TypeScript"]);
    expect(validateCoverLetterDraft({ coverLetter: buildCoverLetterDraft() }).opening.text).toContain("QA");
    expect(validateRecruiterMessageDraft({ recruiterMessage: buildRecruiterMessageDraft() }).intro.text).toContain("QA");
    expect(validateScreeningResponseDraft({ screeningResponse: buildScreeningResponseDraft() }).question).toContain(
      "fit"
    );
  });

  it("rejects malformed structured outputs", () => {
    expect(() => validateResumeJson({ resumeJson: { summary: "raw text" } })).toThrow(
      "ResumeJson.summary must be an object"
    );
  });
});
