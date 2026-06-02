import { join, normalize } from "node:path";

import type { ATSType } from "../../../domain/ats/ats.types.js";
import { ApplicationError } from "../../../domain/errors/application-error.js";

const SCREENSHOT_ROOT = "storage/screenshots";

export class ScreenshotPathBuilder {
  build(input: { executionId: string; atsType: ATSType; step: string }): string {
    const fileName = `${sanitizeSegment(input.executionId)}_${sanitizeSegment(input.atsType)}_${sanitizeSegment(input.step)}.png`;
    const normalizedPath = normalize(join(SCREENSHOT_ROOT, fileName)).replaceAll("\\", "/");

    if (!normalizedPath.startsWith(`${SCREENSHOT_ROOT}/`)) {
      throw new ApplicationError("INVALID_ATS_ARTIFACT_PATH", "Screenshot path must stay under storage/screenshots");
    }

    return normalizedPath;
  }
}

function sanitizeSegment(value: string): string {
  if (value.includes("..") || value.includes("/") || value.includes("\\")) {
    throw new ApplicationError("INVALID_ATS_ARTIFACT_PATH", "Invalid screenshot path segment");
  }

  const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");

  if (!sanitized) {
    throw new ApplicationError("INVALID_ATS_ARTIFACT_PATH", "Invalid screenshot path segment");
  }

  return sanitized;
}
