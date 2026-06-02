const REDACTED = "[REDACTED]";

const SENSITIVE_KEY_PATTERNS = [
  /api[_-]?key/i,
  /authorization/i,
  /bearer/i,
  /cookie/i,
  /session/i,
  /token/i,
  /secret/i,
  /service[_-]?role/i,
  /password/i,
  /^env$/i
];

const SENSITIVE_VALUE_PATTERNS = [
  /sk-[A-Za-z0-9_-]+/g,
  /Bearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s]+/gi,
  /LLM_API_KEY\s*=\s*[^\s]+/gi
];

export class FailureContextNormalizer {
  normalize(input: {
    error: unknown;
    metadata?: Record<string, unknown>;
  }): {
    errorMessage: string;
    errorStack?: string;
    metadata: Record<string, unknown>;
  } {
    const errorMessage = sanitizeString(readErrorMessage(input.error));
    const errorStack = readErrorStack(input.error);
    const sanitizedStack = errorStack ? sanitizeString(errorStack) : undefined;

    return {
      errorMessage,
      metadata: sanitizeMetadata(input.metadata ?? {}),
      ...(sanitizedStack ? { errorStack: sanitizedStack } : {})
    };
  }
}

export function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return sanitizeValue(metadata) as Record<string, unknown>;
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};

    for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = isSensitiveKey(key) ? REDACTED : sanitizeValue(childValue);
    }

    return sanitized;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  return value;
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function sanitizeString(value: string): string {
  return SENSITIVE_VALUE_PATTERNS.reduce((current, pattern) => current.replace(pattern, REDACTED), value);
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown failure";
}

function readErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }

  return undefined;
}
