import type { BuiltPrompt, DocumentGenerationInput } from "../document-generation.types.js";
import { buildPrompt } from "./prompt-builder-utils.js";

export function buildRecruiterMessagePrompt(input: DocumentGenerationInput): BuiltPrompt {
  return buildPrompt(
    input,
    "structured recruiter message draft",
    "RecruiterMessageDraft",
    "Return an object with intro, fitSummary, interest, and closing. Each section must include text and evidenceFragmentIds."
  );
}

