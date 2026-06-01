import { ApplicationError } from "../../domain/errors/application-error.js";

export function unwrapProviderObject(value: unknown, expectedKey: string): unknown {
  if (!isObject(value)) {
    throw new ApplicationError("INVALID_GENERATED_DOCUMENT", "Generated output must be a JSON object");
  }

  return expectedKey in value ? value[expectedKey] : value;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

