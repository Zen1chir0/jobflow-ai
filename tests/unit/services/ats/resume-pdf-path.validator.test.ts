import { describe, expect, it } from "vitest";

import { ResumePdfPathValidator } from "../../../../src/services/ats/resume-pdf-path.validator.js";

describe("ResumePdfPathValidator", () => {
  it("accepts PDF paths and normalizes relative separators", () => {
    const validator = new ResumePdfPathValidator();

    expect(validator.validate("storage\\resumes\\resume.pdf")).toBe("storage/resumes/resume.pdf");
  });

  it("rejects non-PDF paths and traversal paths", () => {
    const validator = new ResumePdfPathValidator();

    expect(() => validator.validate("storage/resumes/resume.docx")).toThrowError("Resume path must point to a PDF file");
    expect(() => validator.validate("../resume.pdf")).toThrowError("Resume path must not traverse directories");
  });
});
