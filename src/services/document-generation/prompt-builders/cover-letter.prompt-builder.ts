import type { BuiltPrompt, DocumentGenerationInput } from "../document-generation.types.js";
import { buildPrompt } from "./prompt-builder-utils.js";

export function buildCoverLetterPrompt(input: DocumentGenerationInput): BuiltPrompt {
  return buildPrompt(
    input,
    "structured cover letter draft",
    "CoverLetterDraft",
    "Return an object with opening, alignment, evidence, and closing. Each section must include text and evidenceFragmentIds."
  );
}

