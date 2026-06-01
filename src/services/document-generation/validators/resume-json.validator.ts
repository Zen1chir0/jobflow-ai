import { ApplicationError } from "../../../domain/errors/application-error.js";
import type {
  ResumeJson,
  ResumeJsonCertification,
  ResumeJsonEducation,
  ResumeJsonExperience,
  ResumeJsonProject
} from "../../../domain/documents/resume-json.types.js";
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

  const experience = candidate.experience.map(validateExperienceEntry);

  const projects = candidate.projects.map(validateProjectEntry);

  if (!Array.isArray(candidate.education) || !Array.isArray(candidate.certifications)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson education and certifications must be arrays");
  }

  const education = candidate.education.map(validateEducationEntry);
  const certifications = candidate.certifications.map(validateCertificationEntry);

  return {
    summary: candidate.summary,
    skills: candidate.skills,
    experience,
    projects,
    education,
    certifications
  };
}

function validateExperienceEntry(item: unknown, index: number): ResumeJsonExperience {
  assertObject(item, `ResumeJson.experience[${index}]`);

  if (typeof item.company !== "string" || typeof item.role !== "string" || !isStringArray(item.evidenceFragmentIds)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson experience entries are invalid");
  }

  if (!isOptionalResumeDate(item.startDate) || !isOptionalResumeDate(item.endDate)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson experience dates must use YYYY-MM or Present");
  }

  assertEvidenceTextArray(item.highlights, `ResumeJson.experience[${index}].highlights`);

  return {
    company: item.company,
    role: item.role,
    highlights: item.highlights,
    evidenceFragmentIds: item.evidenceFragmentIds,
    ...(typeof item.startDate === "string" ? { startDate: item.startDate } : {}),
    ...(typeof item.endDate === "string" ? { endDate: item.endDate } : {})
  };
}

function validateProjectEntry(item: unknown, index: number): ResumeJsonProject {
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

  return {
    name: item.name,
    description: item.description,
    technologies: item.technologies,
    highlights: item.highlights,
    evidenceFragmentIds: item.evidenceFragmentIds
  };
}

function validateEducationEntry(item: unknown, index: number): ResumeJsonEducation {
  assertObject(item, `ResumeJson.education[${index}]`);

  if (
    typeof item.institution !== "string" ||
    typeof item.credential !== "string" ||
    !isStringArray(item.evidenceFragmentIds)
  ) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson education entries are invalid");
  }

  return {
    institution: item.institution,
    credential: item.credential,
    evidenceFragmentIds: item.evidenceFragmentIds
  };
}

function validateCertificationEntry(item: unknown, index: number): ResumeJsonCertification {
  assertObject(item, `ResumeJson.certifications[${index}]`);

  if (typeof item.name !== "string" || !isStringArray(item.evidenceFragmentIds)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson certification entries are invalid");
  }

  if (item.issuer !== undefined && typeof item.issuer !== "string") {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ResumeJson certification issuer must be a string");
  }

  return {
    name: item.name,
    evidenceFragmentIds: item.evidenceFragmentIds,
    ...(typeof item.issuer === "string" ? { issuer: item.issuer } : {})
  };
}

function isOptionalResumeDate(value: unknown): boolean {
  return value === undefined || value === "Present" || (typeof value === "string" && /^\d{4}-\d{2}$/.test(value));
}
