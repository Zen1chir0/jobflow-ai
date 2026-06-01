import type { CoverLetterDraft } from "./cover-letter.types.js";
import type { RecruiterMessageDraft } from "./recruiter-message.types.js";
import type { ResumeJson } from "./resume-json.types.js";
import type { ScreeningResponseDraft } from "./screening-response.types.js";

export const GENERATED_DOCUMENT_TYPES = [
  "resume_json",
  "cover_letter",
  "recruiter_message",
  "screening_response"
] as const;

export type GeneratedDocumentType = (typeof GENERATED_DOCUMENT_TYPES)[number];

export type GeneratedDocumentContent =
  | ResumeJson
  | CoverLetterDraft
  | RecruiterMessageDraft
  | ScreeningResponseDraft;

export type NewGeneratedDocument = {
  jobId: string;
  documentType: GeneratedDocumentType;
  content: GeneratedDocumentContent;
  prompt: string;
  contextFragmentIds: string[];
  model: string;
  provider: string;
};

export type GeneratedDocument = NewGeneratedDocument & {
  id: string;
  createdAt: string;
};

