import { env as processEnv, loadEnvFile } from "node:process";

import { DEFAULT_LOG_LEVEL, SUPPORTED_NODE_ENVIRONMENTS } from "./constants.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { LogLevel } from "../utils/logger.js";

export type NodeEnvironment = (typeof SUPPORTED_NODE_ENVIRONMENTS)[number];

export type AppEnv = {
  nodeEnv: NodeEnvironment;
  logLevel: LogLevel;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  llmProvider: string;
  llmBaseUrl: string;
  llmApiKey: string;
  llmModel: string;
};

type EnvSource = Record<string, string | undefined>;

const LOG_LEVELS = ["debug", "info", "warn", "error", "silent"] as const satisfies readonly LogLevel[];

export function loadEnv(source: EnvSource = loadProcessEnv()): AppEnv {
  const nodeEnv = parseNodeEnv(source.NODE_ENV);
  const logLevel = parseLogLevel(source.LOG_LEVEL);
  const supabaseUrl = requiredUrl(source.SUPABASE_URL, "SUPABASE_URL");
  const supabaseAnonKey = required(source.SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = required(source.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
  const llmProvider = required(source.LLM_PROVIDER, "LLM_PROVIDER");
  const llmBaseUrl = requiredUrl(source.LLM_BASE_URL, "LLM_BASE_URL");
  const llmApiKey = required(source.LLM_API_KEY, "LLM_API_KEY");
  const llmModel = required(source.LLM_MODEL, "LLM_MODEL");

  return {
    nodeEnv,
    logLevel,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    llmProvider,
    llmBaseUrl,
    llmApiKey,
    llmModel
  };
}

function loadProcessEnv(): EnvSource {
  try {
    loadEnvFile();
  } catch (error) {
    if (!isMissingDotEnvFile(error)) {
      throw new ApplicationError("INVALID_ENVIRONMENT_VARIABLE", "Unable to load local environment file", {
        cause: error
      });
    }
  }

  return processEnv;
}

function parseNodeEnv(value: string | undefined): NodeEnvironment {
  const candidate = value ?? "development";

  if (SUPPORTED_NODE_ENVIRONMENTS.includes(candidate as NodeEnvironment)) {
    return candidate as NodeEnvironment;
  }

  throw new ApplicationError("INVALID_ENVIRONMENT", `Unsupported NODE_ENV: ${candidate}`);
}

function parseLogLevel(value: string | undefined): LogLevel {
  const candidate = value ?? DEFAULT_LOG_LEVEL;

  if (LOG_LEVELS.includes(candidate as LogLevel)) {
    return candidate as LogLevel;
  }

  throw new ApplicationError("INVALID_LOG_LEVEL", `Unsupported LOG_LEVEL: ${candidate}`);
}

function required(value: string | undefined, key: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new ApplicationError("MISSING_ENVIRONMENT_VARIABLE", `${key} is required`);
  }

  return normalized;
}

function requiredUrl(value: string | undefined, key: string): string {
  const normalized = required(value, key);

  try {
    return new URL(normalized).toString();
  } catch (error) {
    throw new ApplicationError("INVALID_ENVIRONMENT_VARIABLE", `${key} must be a valid URL`, {
      cause: error
    });
  }
}

function isMissingDotEnvFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}
