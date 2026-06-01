export type ApplicationErrorCode =
  | "INVALID_ENVIRONMENT"
  | "INVALID_ENVIRONMENT_VARIABLE"
  | "INVALID_LOG_LEVEL"
  | "MISSING_ENVIRONMENT_VARIABLE"
  | "SUPABASE_CONFIGURATION_ERROR"
  | "INVALID_DISCOVERY_REQUEST"
  | "INVALID_JOB_DATA"
  | "JOB_REPOSITORY_ERROR"
  | "JOB_MATCH_SCORE_REPOSITORY_ERROR"
  | "PARSED_JOB_PROFILE_REPOSITORY_ERROR"
  | "JOB_NOT_FOUND"
  | "PARSED_JOB_PROFILE_NOT_FOUND"
  | "USER_PROFILE_NOT_FOUND"
  | "USER_PROFILE_REPOSITORY_ERROR"
  | "INVALID_PARSE_REQUEST"
  | "INVALID_SCORE_REQUEST"
  | "UNSUPPORTED_JOB_SOURCE";

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
