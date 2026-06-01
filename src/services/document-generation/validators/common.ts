import { ApplicationError } from "../../../domain/errors/application-error.js";
import type { EvidenceBackedText } from "../../../domain/documents/resume-json.types.js";
import { isObject, isStringArray } from "../output-normalizer.js";

export function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", `${label} must be an object`);
  }
}

export function assertEvidenceBackedText(value: unknown, label: string): asserts value is EvidenceBackedText {
  assertObject(value, label);

  if (typeof value.text !== "string" || !isStringArray(value.evidenceFragmentIds)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", `${label} must include text and evidenceFragmentIds`);
  }
}

export function assertEvidenceTextArray(value: unknown, label: string): asserts value is EvidenceBackedText[] {
  if (!Array.isArray(value)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", `${label} must be an array`);
  }

  value.forEach((item, index) => assertEvidenceBackedText(item, `${label}[${index}]`));
}

