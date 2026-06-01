import type { CoverLetterDraft } from "../../../domain/documents/cover-letter.types.js";
import { unwrapProviderObject } from "../output-normalizer.js";
import { assertEvidenceBackedText, assertEvidenceTextArray, assertObject } from "./common.js";

export function validateCoverLetterDraft(value: unknown): CoverLetterDraft {
  const candidate = unwrapProviderObject(value, "coverLetter");
  assertObject(candidate, "CoverLetterDraft");
  assertEvidenceBackedText(candidate.opening, "CoverLetterDraft.opening");
  assertEvidenceBackedText(candidate.alignment, "CoverLetterDraft.alignment");
  assertEvidenceTextArray(candidate.evidence, "CoverLetterDraft.evidence");
  assertEvidenceBackedText(candidate.closing, "CoverLetterDraft.closing");

  return candidate as unknown as CoverLetterDraft;
}

