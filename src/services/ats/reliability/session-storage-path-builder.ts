import { join, normalize } from "node:path";

import type { ATSType } from "../../../domain/ats/ats.types.js";
import { ApplicationError } from "../../../domain/errors/application-error.js";

const SESSION_ROOT = "storage/playwright-state";

export class SessionStoragePathBuilder {
  build(input: { atsType: ATSType; profileId: string }): string {
    const fileName = `${sanitizeSegment(input.atsType)}_${sanitizeSegment(input.profileId)}.json`;
    const normalizedPath = normalize(join(SESSION_ROOT, fileName)).replaceAll("\\", "/");

    if (!normalizedPath.startsWith(`${SESSION_ROOT}/`)) {
      throw new ApplicationError("INVALID_ATS_ARTIFACT_PATH", "Session storage path must stay under storage/playwright-state");
    }

    return normalizedPath;
  }
}

function sanitizeSegment(value: string): string {
  if (value.includes("..") || value.includes("/") || value.includes("\\")) {
    throw new ApplicationError("INVALID_ATS_ARTIFACT_PATH", "Invalid session storage path segment");
  }

  const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");

  if (!sanitized) {
    throw new ApplicationError("INVALID_ATS_ARTIFACT_PATH", "Invalid session storage path segment");
  }

  return sanitized;
}
