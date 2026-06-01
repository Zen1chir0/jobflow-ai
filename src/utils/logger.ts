export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export type LogContext = {
  executionId?: string;
  service?: string;
  step?: string;
  metadata?: Record<string, unknown>;
};

export type LogEntry = LogContext & {
  level: Exclude<LogLevel, "silent">;
  message: string;
  timestamp: string;
};

export type LoggerSink = Pick<Console, "debug" | "info" | "warn" | "error">;

export type Logger = {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
};

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50
};

export function createLogger(level: LogLevel = "info", sink: LoggerSink = console): Logger {
  return {
    debug: (message, context) => write("debug", level, sink, message, context),
    info: (message, context) => write("info", level, sink, message, context),
    warn: (message, context) => write("warn", level, sink, message, context),
    error: (message, context) => write("error", level, sink, message, context)
  };
}

function write(
  entryLevel: Exclude<LogLevel, "silent">,
  configuredLevel: LogLevel,
  sink: LoggerSink,
  message: string,
  context: LogContext = {}
): void {
  if (LEVEL_PRIORITY[entryLevel] < LEVEL_PRIORITY[configuredLevel]) {
    return;
  }

  const entry: LogEntry = {
    ...context,
    level: entryLevel,
    message,
    timestamp: new Date().toISOString()
  };

  sink[entryLevel](entry);
}
