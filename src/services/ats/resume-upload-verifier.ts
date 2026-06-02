import { basename } from "node:path";

import { ApplicationError } from "../../domain/errors/application-error.js";
import { ResumePdfPathValidator } from "./resume-pdf-path.validator.js";
import type { ATSPageAdapter } from "./ats-page-adapter.interface.js";
import type { SemanticLocatorCandidate } from "./semantic-locator.service.js";
import { SemanticLocatorService } from "./semantic-locator.service.js";

export type ResumeUploadRequest = {
  adapter: ATSPageAdapter;
  filePath: string;
  candidates: SemanticLocatorCandidate[];
};

export class ResumeUploadVerifier {
  constructor(
    private readonly semanticLocator = new SemanticLocatorService(),
    private readonly resumePdfPathValidator = new ResumePdfPathValidator()
  ) {}

  async uploadAndVerify(request: ResumeUploadRequest): Promise<{ uploaded: boolean; fileName: string }> {
    const resumePdfPath = this.resumePdfPathValidator.validate(request.filePath);
    const fileName = basename(resumePdfPath);
    const fileInput = await this.semanticLocator.resolve(
      {
        fieldKey: "resume_upload",
        candidates: request.candidates
      },
      request.adapter
    );

    await request.adapter.uploadFile(fileInput, resumePdfPath);

    if (!(await request.adapter.hasVisibleText(fileName))) {
      throw new ApplicationError("RESUME_UPLOAD_VERIFICATION_FAILED", "Resume upload could not be verified");
    }

    return { uploaded: true, fileName };
  }
}
