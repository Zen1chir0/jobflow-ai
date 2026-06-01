import type { GeneratedResume } from "../domain/resumes/rendered-resume.types.js";
import type { ResumeTemplate } from "../domain/resumes/resume-template.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import type { GeneratedDocumentRepository } from "../repositories/generated-document.repository.js";
import type { GeneratedResumeRepository } from "../repositories/generated-resume.repository.js";
import type { UserProfileRepository } from "../repositories/user-profile.repository.js";
import { validateResumeJson } from "../services/document-generation/validators/resume-json.validator.js";
import type { ResumeRenderingService } from "../services/resume-rendering/resume-rendering.service.js";

export type RenderResumeRequest = {
  generatedDocumentId: string;
  template?: ResumeTemplate;
};

export type RenderResumeResult = {
  generatedResume: GeneratedResume;
};

export class RenderResumeUseCase {
  constructor(
    private readonly generatedDocumentRepository: GeneratedDocumentRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly resumeRenderingService: ResumeRenderingService,
    private readonly generatedResumeRepository: GeneratedResumeRepository
  ) {}

  async execute(request: RenderResumeRequest): Promise<RenderResumeResult> {
    if (!request.generatedDocumentId) {
      throw new ApplicationError("INVALID_RENDER_REQUEST", "Resume rendering requires a generated document id");
    }

    const [generatedDocument, userProfile] = await Promise.all([
      this.generatedDocumentRepository.findById(request.generatedDocumentId),
      this.userProfileRepository.findDefault()
    ]);

    if (!generatedDocument) {
      throw new ApplicationError("GENERATED_DOCUMENT_NOT_FOUND", "Generated document not found");
    }

    if (generatedDocument.documentType !== "resume_json") {
      throw new ApplicationError("INVALID_RENDER_REQUEST", "Only resume_json generated documents can be rendered");
    }

    if (!userProfile) {
      throw new ApplicationError("USER_PROFILE_NOT_FOUND", "Default user profile not found");
    }

    const resumeJson = validateResumeJson(generatedDocument.content);
    const template = request.template ?? "ats";
    const rendered = await this.resumeRenderingService.render({
      jobId: generatedDocument.jobId,
      generatedDocumentId: generatedDocument.id,
      resumeJson,
      userProfile,
      template
    });

    const generatedResume = await this.generatedResumeRepository.create({
      jobId: generatedDocument.jobId,
      generatedDocumentId: generatedDocument.id,
      template,
      resumeJson,
      latexSource: rendered.latexSource,
      texPath: rendered.artifactPaths.texPath,
      pdfPath: rendered.artifactPaths.pdfPath,
      metadataPath: rendered.artifactPaths.metadataPath,
      compiler: rendered.compiler
    });

    return { generatedResume };
  }
}

