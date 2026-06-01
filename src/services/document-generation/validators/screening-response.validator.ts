import { ApplicationError } from "../../../domain/errors/application-error.js";
import type { ScreeningResponseDraft } from "../../../domain/documents/screening-response.types.js";
import { isStringArray, unwrapProviderObject } from "../output-normalizer.js";
import { assertObject } from "./common.js";

export function validateScreeningResponseDraft(value: unknown): ScreeningResponseDraft {
  const candidate = unwrapProviderObject(value, "screeningResponse");
  assertObject(candidate, "ScreeningResponseDraft");

  if (
    typeof candidate.question !== "string" ||
    typeof candidate.answer !== "string" ||
    !isStringArray(candidate.evidenceFragmentIds)
  ) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "ScreeningResponseDraft shape is invalid");
  }

  return candidate as unknown as ScreeningResponseDraft;
}

