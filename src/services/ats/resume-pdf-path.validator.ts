import { extname, isAbsolute, normalize } from "node:path";

import { ApplicationError } from "../../domain/errors/application-error.js";

export class ResumePdfPathValidator {
  validate(filePath: string): string {
    const normalizedPath = normalize(filePath.trim());

    if (!normalizedPath) {
      throw new ApplicationError("INVALID_RESUME_PDF_PATH", "Resume PDF path is required");
    }

    if (extname(normalizedPath).toLowerCase() !== ".pdf") {
      throw new ApplicationError("INVALID_RESUME_PDF_PATH", "Resume path must point to a PDF file");
    }

    if (normalizedPath.includes("..")) {
      throw new ApplicationError("INVALID_RESUME_PDF_PATH", "Resume path must not traverse directories");
    }

    return isAbsolute(normalizedPath) ? normalizedPath : normalizedPath.replaceAll("\\", "/");
  }
}
