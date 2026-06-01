import type { EvidenceBackedText } from "./resume-json.types.js";

export type CoverLetterDraft = {
  opening: EvidenceBackedText;
  alignment: EvidenceBackedText;
  evidence: EvidenceBackedText[];
  closing: EvidenceBackedText;
};

