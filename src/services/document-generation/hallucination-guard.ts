import type { CoverLetterDraft } from "../../domain/documents/cover-letter.types.js";
import type { GeneratedDocumentContent, GeneratedDocumentType } from "../../domain/documents/generated-document.types.js";
import type { RecruiterMessageDraft } from "../../domain/documents/recruiter-message.types.js";
import type {
  ResumeJson,
  ResumeJsonCertification,
  ResumeJsonEducation,
  ResumeJsonExperience,
  ResumeJsonProject
} from "../../domain/documents/resume-json.types.js";
import type { ScreeningResponseDraft } from "../../domain/documents/screening-response.types.js";
import { ApplicationError } from "../../domain/errors/application-error.js";
import type { RetrievedResumeContext } from "../../domain/resumes/resume-fragment.types.js";
import type { UserProfile } from "../../domain/user-profile/user-profile.types.js";

type GuardInput = {
  documentType: GeneratedDocumentType;
  content: GeneratedDocumentContent;
  resumeContext: RetrievedResumeContext;
  userProfile: UserProfile;
};

export class HallucinationGuard {
  verify(input: GuardInput): void {
    const validFragmentIds = new Set(input.resumeContext.fragments.map((fragment) => fragment.id));
    const evidenceCorpus = normalize(
      [
        input.resumeContext.contextText,
        ...input.resumeContext.fragments.map((fragment) => fragment.fragmentText),
        input.userProfile.fullName,
        input.userProfile.headline,
        ...input.userProfile.verifiedSkills,
        ...input.userProfile.targetRoles,
        ...input.userProfile.targetIndustries
      ]
        .filter(Boolean)
        .join(" ")
    );

    this.verifyEvidenceIds(collectEvidenceIds(input.content), validFragmentIds);
    this.verifyDocumentClaims(input.documentType, input.content, evidenceCorpus, input.userProfile);
  }

  private verifyEvidenceIds(evidenceIds: string[], validFragmentIds: Set<string>): void {
    if (evidenceIds.length === 0) {
      throw new ApplicationError("UNSUPPORTED_GENERATED_CLAIM", "Generated content must include evidence fragments");
    }

    for (const id of evidenceIds) {
      if (!validFragmentIds.has(id)) {
        throw new ApplicationError("UNSUPPORTED_GENERATED_CLAIM", `Generated content referenced unknown evidence ${id}`);
      }
    }
  }

  private verifyDocumentClaims(
    documentType: GeneratedDocumentType,
    content: GeneratedDocumentContent,
    corpus: string,
    userProfile: UserProfile
  ): void {
    if (documentType === "resume_json") {
      verifyResumeClaims(content as ResumeJson, corpus, userProfile);
    }

    if (documentType === "screening_response") {
      const screening = content as ScreeningResponseDraft;
      verifyClaimText(screening.answer, corpus, userProfile);
    }

    if (documentType === "cover_letter") {
      const coverLetter = content as CoverLetterDraft;
      [coverLetter.opening, coverLetter.alignment, coverLetter.closing, ...coverLetter.evidence].forEach((item) =>
        verifyClaimText(item.text, corpus, userProfile)
      );
    }

    if (documentType === "recruiter_message") {
      const message = content as RecruiterMessageDraft;
      [message.intro, message.fitSummary, message.interest, message.closing].forEach((item) =>
        verifyClaimText(item.text, corpus, userProfile)
      );
    }
  }
}

function verifyResumeClaims(resume: ResumeJson, corpus: string, userProfile: UserProfile): void {
  verifyClaimText(resume.summary.text, corpus, userProfile);
  resume.skills.forEach((skill) => verifyClaimText(skill, corpus, userProfile));
  resume.experience.forEach((item) => verifyExperience(item, corpus, userProfile));
  resume.projects.forEach((item) => verifyProject(item, corpus, userProfile));
  resume.education.forEach((item) => verifyEducation(item, corpus, userProfile));
  resume.certifications.forEach((item) => verifyCertification(item, corpus, userProfile));
}

function verifyExperience(item: ResumeJsonExperience, corpus: string, userProfile: UserProfile): void {
  [item.company, item.role, item.startDate, item.endDate].filter(Boolean).forEach((claim) => {
    verifyClaimText(claim ?? "", corpus, userProfile);
  });
  item.highlights.forEach((highlight) => verifyClaimText(highlight.text, corpus, userProfile));
}

function verifyProject(item: ResumeJsonProject, corpus: string, userProfile: UserProfile): void {
  [item.name, item.description, ...item.technologies].forEach((claim) => verifyClaimText(claim, corpus, userProfile));
  item.highlights.forEach((highlight) => verifyClaimText(highlight.text, corpus, userProfile));
}

function verifyEducation(item: ResumeJsonEducation, corpus: string, userProfile: UserProfile): void {
  [item.institution, item.credential].forEach((claim) => verifyClaimText(claim, corpus, userProfile));
}

function verifyCertification(item: ResumeJsonCertification, corpus: string, userProfile: UserProfile): void {
  [item.name, item.issuer].filter(Boolean).forEach((claim) => verifyClaimText(claim ?? "", corpus, userProfile));
}

function verifyClaimText(text: string, corpus: string, userProfile: UserProfile): void {
  const normalizedText = normalize(text);

  if (!normalizedText) {
    return;
  }

  const profileClaims = new Set(userProfile.verifiedSkills.map(normalize));

  if (profileClaims.has(normalizedText) || corpus.includes(normalizedText)) {
    return;
  }

  const unsupportedTerms = extractStrictTerms(text).filter((term) => {
    const normalized = normalize(term);
    return normalized.length > 1 && !corpus.includes(normalized) && !profileClaims.has(normalized);
  });

  if (unsupportedTerms.length > 0) {
    throw new ApplicationError("UNSUPPORTED_GENERATED_CLAIM", `Unsupported generated claim: ${unsupportedTerms[0]}`);
  }
}

function collectEvidenceIds(content: GeneratedDocumentContent): string[] {
  const ids: string[] = [];
  collectEvidenceIdsFromValue(content, ids);
  return ids;
}

function collectEvidenceIdsFromValue(value: unknown, ids: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectEvidenceIdsFromValue(item, ids));
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  const record = value as Record<string, unknown>;

  if (Array.isArray(record.evidenceFragmentIds)) {
    ids.push(...record.evidenceFragmentIds.filter((item): item is string => typeof item === "string"));
  }

  Object.values(record).forEach((item) => collectEvidenceIdsFromValue(item, ids));
}

function extractStrictTerms(text: string): string[] {
  const capitalizedPhrases = text.match(/\b[A-Z][A-Za-z0-9+.#-]*(?:\s+[A-Z][A-Za-z0-9+.#-]*)*/g) ?? [];
  const metrics = text.match(/\b\d+(?:\.\d+)?%?\b/g) ?? [];
  return [...capitalizedPhrases, ...metrics].filter((term) => !COMMON_TERMS.has(term.toLowerCase()));
}

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

const COMMON_TERMS = new Set(["i", "the", "a", "an", "and", "or", "to", "for", "with", "remote"]);

export { collectEvidenceIds };
