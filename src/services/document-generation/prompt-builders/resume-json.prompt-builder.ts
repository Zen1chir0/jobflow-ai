import type { BuiltPrompt, DocumentGenerationInput } from "../document-generation.types.js";
import { buildPrompt } from "./prompt-builder-utils.js";

export function buildResumeJsonPrompt(input: DocumentGenerationInput): BuiltPrompt {
  return buildPrompt(
    input,
    "structured resume JSON",
    "ResumeJson",
    [
      "Return an object with summary, skills, experience, projects, education, and certifications.",
      "summary must be { text, evidenceFragmentIds }.",
      "experience entries must contain company, role, optional startDate/endDate, highlights, and evidenceFragmentIds.",
      "Dates must use YYYY-MM format or Present.",
      "projects must contain name, description, technologies, highlights, and evidenceFragmentIds."
    ].join(" ")
  );
}
