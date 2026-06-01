import type { CoverLetterDraft } from "../../domain/documents/cover-letter.types.js";
import type { GeneratedDocumentContent, GeneratedDocumentType } from "../../domain/documents/generated-document.types.js";
import type { RecruiterMessageDraft } from "../../domain/documents/recruiter-message.types.js";
import type { ResumeJson } from "../../domain/documents/resume-json.types.js";
import type { ScreeningResponseDraft } from "../../domain/documents/screening-response.types.js";
import type { GenerationProvider } from "../../integrations/generation/generation-provider.interface.js";
import { buildCoverLetterPrompt } from "./prompt-builders/cover-letter.prompt-builder.js";
import { buildRecruiterMessagePrompt } from "./prompt-builders/recruiter-message.prompt-builder.js";
import { buildResumeJsonPrompt } from "./prompt-builders/resume-json.prompt-builder.js";
import { buildScreeningResponsePrompt } from "./prompt-builders/screening-response.prompt-builder.js";
import type { ArtifactMap, BuiltPrompt, DocumentGenerationInput, DocumentGenerationResult } from "./document-generation.types.js";
import { HallucinationGuard } from "./hallucination-guard.js";
import { validateCoverLetterDraft } from "./validators/cover-letter.validator.js";
import { validateRecruiterMessageDraft } from "./validators/recruiter-message.validator.js";
import { validateResumeJson } from "./validators/resume-json.validator.js";
import { validateScreeningResponseDraft } from "./validators/screening-response.validator.js";

export class DocumentGenerationService {
  constructor(
    private readonly generationProvider: GenerationProvider,
    private readonly hallucinationGuard = new HallucinationGuard()
  ) {}

  async generate<TType extends GeneratedDocumentType>(
    documentType: TType,
    input: DocumentGenerationInput
  ): Promise<DocumentGenerationResult<ArtifactMap[TType]>> {
    const prompt = buildPromptForType(documentType, input);
    const response = await this.generationProvider.generateStructured({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      responseSchemaName: prompt.responseSchemaName
    });
    const content = validateForType(documentType, response.content) as ArtifactMap[TType];

    this.hallucinationGuard.verify({
      documentType,
      content,
      resumeContext: input.resumeContext,
      userProfile: input.userProfile
    });

    return {
      documentType,
      content,
      prompt: prompt.auditPrompt,
      contextFragmentIds: input.resumeContext.fragments.map((fragment) => fragment.id),
      provider: response.provider,
      model: response.model
    };
  }
}

function buildPromptForType(documentType: GeneratedDocumentType, input: DocumentGenerationInput): BuiltPrompt {
  switch (documentType) {
    case "resume_json":
      return buildResumeJsonPrompt(input);
    case "cover_letter":
      return buildCoverLetterPrompt(input);
    case "recruiter_message":
      return buildRecruiterMessagePrompt(input);
    case "screening_response":
      return buildScreeningResponsePrompt(input);
  }
}

function validateForType(documentType: GeneratedDocumentType, value: unknown): GeneratedDocumentContent {
  switch (documentType) {
    case "resume_json":
      return validateResumeJson(value) satisfies ResumeJson;
    case "cover_letter":
      return validateCoverLetterDraft(value) satisfies CoverLetterDraft;
    case "recruiter_message":
      return validateRecruiterMessageDraft(value) satisfies RecruiterMessageDraft;
    case "screening_response":
      return validateScreeningResponseDraft(value) satisfies ScreeningResponseDraft;
  }
}

