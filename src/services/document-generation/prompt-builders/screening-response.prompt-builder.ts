import { ApplicationError } from "../../../domain/errors/application-error.js";
import type { BuiltPrompt, DocumentGenerationInput } from "../document-generation.types.js";
import { buildPrompt } from "./prompt-builder-utils.js";

export function buildScreeningResponsePrompt(input: DocumentGenerationInput): BuiltPrompt {
  if (!input.screeningQuestion?.trim()) {
    throw new ApplicationError("INVALID_GENERATION_REQUEST", "Screening response generation requires a question");
  }

  return buildPrompt(
    input,
    "structured screening response draft",
    "ScreeningResponseDraft",
    "Return an object with question, answer, and evidenceFragmentIds. The question must match the supplied screening question."
  );
}

