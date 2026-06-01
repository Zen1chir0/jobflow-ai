import type { CoverLetterDraft } from "../../../../../src/domain/documents/cover-letter.types.js";
import type { RecruiterMessageDraft } from "../../../../../src/domain/documents/recruiter-message.types.js";
import type { ResumeJson } from "../../../../../src/domain/documents/resume-json.types.js";
import type { ScreeningResponseDraft } from "../../../../../src/domain/documents/screening-response.types.js";
import type { Job } from "../../../../../src/domain/jobs/job.types.js";
import type { ParsedJobProfile } from "../../../../../src/domain/jobs/parsed-job-profile.types.js";
import type { RetrievedResumeContext } from "../../../../../src/domain/resumes/resume-fragment.types.js";
import type { MatchScore } from "../../../../../src/domain/scoring/scoring.types.js";
import type { UserProfile } from "../../../../../src/domain/user-profile/user-profile.types.js";
import type { DocumentGenerationInput } from "../../../../../src/services/document-generation/document-generation.types.js";

export function buildGenerationInput(overrides: Partial<DocumentGenerationInput> = {}): DocumentGenerationInput {
  return {
    job: buildJob(),
    parsedJobProfile: buildParsedJobProfile(),
    matchScore: buildMatchScore(),
    userProfile: buildUserProfile(),
    resumeContext: buildResumeContext(),
    ...overrides
  };
}

export function buildResumeJson(): ResumeJson {
  return {
    summary: { text: "Built Playwright framework for QA automation.", evidenceFragmentIds: ["fragment_1"] },
    skills: ["Playwright", "TypeScript"],
    experience: [],
    projects: [
      {
        name: "Playwright framework",
        description: "Built Playwright framework.",
        technologies: ["Playwright", "TypeScript"],
        highlights: [{ text: "Built Playwright framework.", evidenceFragmentIds: ["fragment_1"] }],
        evidenceFragmentIds: ["fragment_1"]
      }
    ],
    education: [],
    certifications: []
  };
}

export function buildCoverLetterDraft(): CoverLetterDraft {
  return {
    opening: { text: "I am interested in the QA Automation Engineer role.", evidenceFragmentIds: ["fragment_1"] },
    alignment: { text: "Built Playwright framework for QA automation.", evidenceFragmentIds: ["fragment_1"] },
    evidence: [{ text: "Built Playwright framework.", evidenceFragmentIds: ["fragment_1"] }],
    closing: { text: "I would welcome a QA automation conversation.", evidenceFragmentIds: ["fragment_1"] }
  };
}

export function buildRecruiterMessageDraft(): RecruiterMessageDraft {
  return {
    intro: { text: "I am interested in the QA Automation Engineer role.", evidenceFragmentIds: ["fragment_1"] },
    fitSummary: { text: "Built Playwright framework for QA automation.", evidenceFragmentIds: ["fragment_1"] },
    interest: { text: "Interested in QA automation work.", evidenceFragmentIds: ["fragment_1"] },
    closing: { text: "Open to a QA automation conversation.", evidenceFragmentIds: ["fragment_1"] }
  };
}

export function buildScreeningResponseDraft(): ScreeningResponseDraft {
  return {
    question: "Why are you a fit?",
    answer: "Built Playwright framework for QA automation.",
    evidenceFragmentIds: ["fragment_1"]
  };
}

function buildJob(): Job {
  return {
    id: "job_1",
    source: "manual",
    title: "QA Automation Engineer",
    company: "Example Co",
    remoteType: "remote",
    descriptionRaw: "Build tests with Playwright and TypeScript.",
    applicationUrl: "https://example.test/job",
    atsType: "generic",
    discoveredAt: "2026-06-01T00:00:00.000Z"
  };
}

function buildParsedJobProfile(): ParsedJobProfile {
  return {
    jobId: "job_1",
    responsibilities: ["Build tests"],
    requiredSkills: ["Playwright", "TypeScript"],
    preferredSkills: [],
    seniority: "mid",
    compensation: {},
    rawMetadata: {}
  };
}

function buildMatchScore(): MatchScore {
  return {
    jobId: "job_1",
    skillMatch: 1,
    experienceMatch: 0.9,
    industryMatch: 0.8,
    locationMatch: 1,
    compensationMatch: 0.7,
    finalScore: 0.9,
    scoringMetadata: {}
  };
}

function buildUserProfile(): UserProfile {
  return {
    id: "user_1",
    fullName: "Kenneth Flororita",
    headline: "QA automation engineer",
    targetRoles: ["QA Automation Engineer"],
    targetIndustries: ["Technology"],
    verifiedSkills: ["Playwright", "TypeScript"],
    preferredRemoteTypes: ["remote"],
    salaryCurrency: "USD",
    baselineSeniority: "mid"
  };
}

function buildResumeContext(): RetrievedResumeContext {
  return {
    fragments: [
      {
        id: "fragment_1",
        fragmentText: "Built Playwright framework for QA automation using TypeScript.",
        fragmentType: "project",
        metadata: {},
        embedding: [],
        similarity: 0.91
      }
    ],
    contextText: "- [project] Built Playwright framework for QA automation using TypeScript."
  };
}
