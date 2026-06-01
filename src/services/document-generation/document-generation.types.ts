import type { CoverLetterDraft } from "../../domain/documents/cover-letter.types.js";
import type { GeneratedDocumentContent, GeneratedDocumentType } from "../../domain/documents/generated-document.types.js";
import type { RecruiterMessageDraft } from "../../domain/documents/recruiter-message.types.js";
import type { ResumeJson } from "../../domain/documents/resume-json.types.js";
import type { ScreeningResponseDraft } from "../../domain/documents/screening-response.types.js";
import type { Job } from "../../domain/jobs/job.types.js";
import type { ParsedJobProfile } from "../../domain/jobs/parsed-job-profile.types.js";
import type { RetrievedResumeContext } from "../../domain/resumes/resume-fragment.types.js";
import type { MatchScore } from "../../domain/scoring/scoring.types.js";
import type { UserProfile } from "../../domain/user-profile/user-profile.types.js";

export type DocumentGenerationInput = {
  job: Job;
  parsedJobProfile: ParsedJobProfile;
  matchScore: MatchScore;
  userProfile: UserProfile;
  resumeContext: RetrievedResumeContext;
  screeningQuestion?: string;
};

export type BuiltPrompt = {
  systemPrompt: string;
  userPrompt: string;
  responseSchemaName: string;
  auditPrompt: string;
};

export type DocumentGenerationResult<TContent extends GeneratedDocumentContent = GeneratedDocumentContent> = {
  documentType: GeneratedDocumentType;
  content: TContent;
  prompt: string;
  contextFragmentIds: string[];
  provider: string;
  model: string;
};

export type ArtifactMap = {
  resume_json: ResumeJson;
  cover_letter: CoverLetterDraft;
  recruiter_message: RecruiterMessageDraft;
  screening_response: ScreeningResponseDraft;
};

