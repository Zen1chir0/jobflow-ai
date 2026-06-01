import { ApplicationError } from "../../../domain/errors/application-error.js";
import type { ResumeJson } from "../../../domain/documents/resume-json.types.js";
import { isStringArray, unwrapProviderObject } from "../output-normalizer.js";
import { assertEvidenceBackedText, assertEvidenceTextArray, assertObject } from "./common.js";

export function validateResumeJson(value: unknown): ResumeJson {
  const candidate = unwrapProviderObject(value, "resumeJson");
  assertObject(candidate, "ResumeJson");
  assertEvidenceBackedText(candidate.summary, "ResumeJson.summary");

  if (!isStringArray(candidate.skills)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson.skills must be a string array");
  }

  if (!Array.isArray(candidate.experience) || !Array.isArray(candidate.projects)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson experience and projects must be arrays");
  }

  candidate.experience.forEach((item, index) => {
    assertObject(item, `ResumeJson.experience[${index}]`);
    if (typeof item.company !== "string" || typeof item.role !== "string" || !isStringArray(item.evidenceFragmentIds)) {
      throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson experience entries are invalid");
    }
    assertEvidenceTextArray(item.highlights, `ResumeJson.experience[${index}].highlights`);
  });

  candidate.projects.forEach((item, index) => {
    assertObject(item, `ResumeJson.projects[${index}]`);
    if (
      typeof item.name !== "string" ||
      typeof item.description !== "string" ||
      !isStringArray(item.technologies) ||
      !isStringArray(item.evidenceFragmentIds)
    ) {
      throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson project entries are invalid");
    }
    assertEvidenceTextArray(item.highlights, `ResumeJson.projects[${index}].highlights`);
  });

  if (!Array.isArray(candidate.education) || !Array.isArray(candidate.certifications)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson education and certifications must be arrays");
  }

  return candidate as unknown as ResumeJson;
}

