import { describe, expect, it, vi } from "vitest";

import { createLogger, type LoggerSink } from "../../../src/utils/logger";

describe("createLogger", () => {
  it("writes structured entries at or above the configured level", () => {
    const sink = createSink();
    const logger = createLogger("warn", sink);

    logger.info("Skipped");
    logger.warn("Important", { executionId: "exec_123", service: "foundation" });

    expect(sink.info).not.toHaveBeenCalled();
    expect(sink.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        executionId: "exec_123",
        level: "warn",
        message: "Important",
        service: "foundation"
      })
    );
  });

  it("honors silent logging", () => {
    const sink = createSink();
    const logger = createLogger("silent", sink);

    logger.error("Hidden");

    expect(sink.error).not.toHaveBeenCalled();
  });
});

function createSink(): LoggerSink {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}
