import type { RecruiterMessageDraft } from "../../../domain/documents/recruiter-message.types.js";
import { unwrapProviderObject } from "../output-normalizer.js";
import { assertEvidenceBackedText, assertObject } from "./common.js";

export function validateRecruiterMessageDraft(value: unknown): RecruiterMessageDraft {
  const candidate = unwrapProviderObject(value, "recruiterMessage");
  assertObject(candidate, "RecruiterMessageDraft");
  assertEvidenceBackedText(candidate.intro, "RecruiterMessageDraft.intro");
  assertEvidenceBackedText(candidate.fitSummary, "RecruiterMessageDraft.fitSummary");
  assertEvidenceBackedText(candidate.interest, "RecruiterMessageDraft.interest");
  assertEvidenceBackedText(candidate.closing, "RecruiterMessageDraft.closing");

  return candidate as unknown as RecruiterMessageDraft;
}

