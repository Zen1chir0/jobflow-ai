export type ApplicationErrorCode =
  | "INVALID_ENVIRONMENT"
  | "INVALID_LOG_LEVEL"
  | "MISSING_ENVIRONMENT_VARIABLE"
  | "SUPABASE_CONFIGURATION_ERROR";

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;
  override readonly cause?: unknown;

  constructor(code: ApplicationErrorCode, message: string, options: { cause?: unknown } = {}) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.cause = options.cause;
  }
}
