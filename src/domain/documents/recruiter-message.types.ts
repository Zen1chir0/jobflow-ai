import type { EvidenceBackedText } from "./resume-json.types.js";

export type RecruiterMessageDraft = {
  intro: EvidenceBackedText;
  fitSummary: EvidenceBackedText;
  interest: EvidenceBackedText;
  closing: EvidenceBackedText;
};

