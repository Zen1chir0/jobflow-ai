import { Command } from "commander";

import type { ResumeTemplate } from "../../domain/resumes/resume-template.types.js";
import { LatexmkPdfCompiler } from "../../integrations/pdf/latexmk-pdf-compiler.js";
import { SupabaseGeneratedDocumentRepository } from "../../repositories/generated-document.repository.js";
import { SupabaseGeneratedResumeRepository } from "../../repositories/generated-resume.repository.js";
import { SupabaseUserProfileRepository } from "../../repositories/user-profile.repository.js";
import { ResumeRenderingService } from "../../services/resume-rendering/resume-rendering.service.js";
import { RenderResumeUseCase, type RenderResumeResult } from "../../use-cases/render-resume.use-case.js";

type RenderOptions = {
  documentId: string;
  template?: ResumeTemplate;
};

type RenderUseCaseFactory = () => RenderResumeUseCase;

export function createRenderCommand(createRenderUseCase: RenderUseCaseFactory = createDefaultRenderUseCase): Command {
  return new Command("render")
    .description("Render generated ResumeJson into local LaTeX and PDF artifacts")
    .requiredOption("--document-id <documentId>", "generated resume_json document id")
    .option("--template <template>", "resume template", "ats")
    .action(async (options: RenderOptions) => {
      const result = await createRenderUseCase().execute({
        generatedDocumentId: options.documentId,
        ...(options.template ? { template: options.template } : {})
      });
      displayRenderResult(result);
    });
}

function createDefaultRenderUseCase(): RenderResumeUseCase {
  const resumeRenderingService = new ResumeRenderingService(new LatexmkPdfCompiler());

  return new RenderResumeUseCase(
    new SupabaseGeneratedDocumentRepository(),
    new SupabaseUserProfileRepository(),
    resumeRenderingService,
    new SupabaseGeneratedResumeRepository()
  );
}

function displayRenderResult(result: RenderResumeResult): void {
  console.log(`Rendered resume ${result.generatedResume.id}`);
  console.log(`Template ${result.generatedResume.template}`);
  console.log(`Compiler ${result.generatedResume.compiler}`);
}

