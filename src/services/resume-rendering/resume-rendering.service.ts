import type { ResumeJson } from "../../domain/documents/resume-json.types.js";
import type { ResumeArtifactPaths, RenderedResumeMetadata } from "../../domain/resumes/rendered-resume.types.js";
import type { ResumeTemplate } from "../../domain/resumes/resume-template.types.js";
import type { UserProfile } from "../../domain/user-profile/user-profile.types.js";
import type { PdfCompiler } from "../../integrations/pdf/pdf-compiler.interface.js";
import { ArtifactPathBuilder } from "./artifact-path-builder.js";
import { ArtifactStorage } from "./artifact-storage.js";
import { LatexTemplateRenderer } from "./latex-template-renderer.js";
import { TemplateSelector } from "./template-selector.js";

export type RenderResumeInput = {
  jobId: string;
  generatedDocumentId: string;
  resumeJson: ResumeJson;
  userProfile: UserProfile;
  template: ResumeTemplate;
};

export type RenderResumeResult = {
  latexSource: string;
  artifactPaths: ResumeArtifactPaths;
  compiler: string;
};

export class ResumeRenderingService {
  constructor(
    private readonly pdfCompiler: PdfCompiler,
    private readonly templateSelector = new TemplateSelector(),
    private readonly latexTemplateRenderer = new LatexTemplateRenderer(),
    private readonly artifactPathBuilder = new ArtifactPathBuilder(),
    private readonly artifactStorage = new ArtifactStorage()
  ) {}

  async render(input: RenderResumeInput): Promise<RenderResumeResult> {
    const templateSource = this.templateSelector.select(input.template);
    const latexSource = this.latexTemplateRenderer.render({
      resumeJson: input.resumeJson,
      userProfile: input.userProfile,
      templateSource
    });
    const artifactPaths = this.artifactPathBuilder.build(input.jobId, input.generatedDocumentId);
    const metadata: RenderedResumeMetadata = {
      jobId: input.jobId,
      generatedDocumentId: input.generatedDocumentId,
      template: input.template,
      compiler: this.pdfCompiler.name,
      renderedAt: new Date().toISOString()
    };

    await this.artifactStorage.writeArtifacts(artifactPaths, input.resumeJson, latexSource, metadata);
    const compileResult = await this.pdfCompiler.compile({
      texPath: artifactPaths.texPath,
      outputDirectory: artifactPaths.directory,
      expectedPdfPath: artifactPaths.pdfPath
    });

    return {
      latexSource,
      artifactPaths: {
        ...artifactPaths,
        pdfPath: compileResult.pdfPath
      },
      compiler: compileResult.compiler
    };
  }
}

