import { DEFAULT_LOG_LEVEL, SUPPORTED_NODE_ENVIRONMENTS } from "./constants.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { LogLevel } from "../utils/logger.js";

export type NodeEnvironment = (typeof SUPPORTED_NODE_ENVIRONMENTS)[number];

export type AppEnv = {
  nodeEnv: NodeEnvironment;
  logLevel: LogLevel;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type EnvSource = Record<string, string | undefined>;

const LOG_LEVELS = ["debug", "info", "warn", "error", "silent"] as const satisfies readonly LogLevel[];

export function loadEnv(source: EnvSource = process.env): AppEnv {
  const nodeEnv = parseNodeEnv(source.NODE_ENV);
  const logLevel = parseLogLevel(source.LOG_LEVEL);
  const supabaseUrl = required(source.SUPABASE_URL, "SUPABASE_URL");
  const supabaseAnonKey = required(source.SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY");

  return {
    nodeEnv,
    logLevel,
    supabaseUrl,
    supabaseAnonKey
  };
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
  if (!value || value.trim().length === 0) {
    throw new ApplicationError("MISSING_ENVIRONMENT_VARIABLE", `${key} is required`);
  }

  return value;
}
