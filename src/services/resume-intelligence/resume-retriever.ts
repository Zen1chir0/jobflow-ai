import type { ParsedJobProfile } from "../../domain/jobs/parsed-job-profile.types.js";
import type { ResumeFragment } from "../../domain/resumes/resume-fragment.types.js";
import type { EmbeddingProvider } from "../../integrations/embeddings/embedding-provider.interface.js";
import type { ResumeFragmentRepository } from "../../repositories/resume-fragment.repository.js";

export type RetrieveResumeFragmentsOptions = {
  topK?: number;
  threshold?: number;
};

export const DEFAULT_RESUME_RETRIEVAL_TOP_K = 5;
export const DEFAULT_RESUME_RETRIEVAL_THRESHOLD = 0.72;

export class ResumeRetriever {
  constructor(
    private readonly resumeFragmentRepository: ResumeFragmentRepository,
    private readonly embeddingProvider: EmbeddingProvider
  ) {}

  async retrieveForParsedJob(
    parsedJobProfile: ParsedJobProfile,
    options: RetrieveResumeFragmentsOptions = {}
  ): Promise<ResumeFragment[]> {
    const queryEmbedding = parsedJobProfile.embedding ?? (await this.embeddingProvider.embed(buildQueryText(parsedJobProfile)));

    return this.resumeFragmentRepository.matchResumeFragments(
      queryEmbedding,
      options.threshold ?? DEFAULT_RESUME_RETRIEVAL_THRESHOLD,
      options.topK ?? DEFAULT_RESUME_RETRIEVAL_TOP_K
    );
  }
}

function buildQueryText(profile: ParsedJobProfile): string {
  return [
    ...profile.responsibilities,
    ...profile.requiredSkills,
    ...profile.preferredSkills,
    profile.seniority,
    profile.industry ?? "",
    getDescriptionClean(profile.rawMetadata)
  ]
    .filter(Boolean)
    .join("\n");
}

function getDescriptionClean(metadata: Record<string, unknown>): string {
  const value = metadata.descriptionClean;
  return typeof value === "string" ? value : "";
}
