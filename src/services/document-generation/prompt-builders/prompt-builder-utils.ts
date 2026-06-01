import type { BuiltPrompt, DocumentGenerationInput } from "../document-generation.types.js";

export function buildBaseSystemPrompt(artifactName: string): string {
  return [
    `You generate ${artifactName} for JobFlow AI.`,
    "Return only valid JSON matching the requested schema.",
    "Use only the supplied resume context and user profile as evidence.",
    "Do not invent companies, dates, projects, certifications, technologies, responsibilities, achievements, or metrics.",
    "If evidence is unavailable, omit the claim."
  ].join(" ");
}

export function buildEvidencePayload(input: DocumentGenerationInput): string {
  return JSON.stringify(
    {
      job: {
        id: input.job.id,
        title: input.job.title,
        company: input.job.company,
        location: input.job.location,
        remoteType: input.job.remoteType,
        applicationUrl: input.job.applicationUrl
      },
      parsedJobProfile: input.parsedJobProfile,
      matchScore: input.matchScore,
      userProfile: {
        fullName: input.userProfile.fullName,
        headline: input.userProfile.headline,
        targetRoles: input.userProfile.targetRoles,
        targetIndustries: input.userProfile.targetIndustries,
        verifiedSkills: input.userProfile.verifiedSkills,
        baselineSeniority: input.userProfile.baselineSeniority
      },
      resumeContext: {
        contextText: input.resumeContext.contextText,
        fragments: input.resumeContext.fragments.map((fragment) => ({
          id: fragment.id,
          type: fragment.fragmentType,
          text: fragment.fragmentText,
          similarity: fragment.similarity
        }))
      },
      screeningQuestion: input.screeningQuestion
    },
    null,
    2
  );
}

export function buildPrompt(
  input: DocumentGenerationInput,
  artifactName: string,
  responseSchemaName: string,
  schemaInstruction: string
): BuiltPrompt {
  const systemPrompt = buildBaseSystemPrompt(artifactName);
  const userPrompt = [
    "Evidence payload:",
    buildEvidencePayload(input),
    "Schema instruction:",
    schemaInstruction,
    "Every non-empty generated claim must include evidence fragment ids when the schema provides an evidence field."
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
    responseSchemaName,
    auditPrompt: `${systemPrompt}\n\n${userPrompt}`
  };
}

