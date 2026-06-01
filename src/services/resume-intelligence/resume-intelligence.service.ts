import type { ParsedJobProfile } from "../../domain/jobs/parsed-job-profile.types.js";
import type {
  ResumeFragment,
  ResumeFragmentInput,
  RetrievedResumeContext
} from "../../domain/resumes/resume-fragment.types.js";
import type { EmbeddingProvider } from "../../integrations/embeddings/embedding-provider.interface.js";
import type { ResumeFragmentRepository } from "../../repositories/resume-fragment.repository.js";
import { PromptContextBuilder } from "./prompt-context-builder.js";
import { ResumeFragmenter } from "./resume-fragmenter.js";
import { ResumeRetriever, type RetrieveResumeFragmentsOptions } from "./resume-retriever.js";

export class ResumeIntelligenceService {
  private readonly resumeRetriever: ResumeRetriever;

  constructor(
    private readonly resumeFragmentRepository: ResumeFragmentRepository,
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly resumeFragmenter = new ResumeFragmenter(),
    private readonly promptContextBuilder = new PromptContextBuilder()
  ) {
    this.resumeRetriever = new ResumeRetriever(resumeFragmentRepository, embeddingProvider);
  }

  async createFragment(input: ResumeFragmentInput): Promise<ResumeFragment> {
    const embedding = await this.embeddingProvider.embed(input.fragmentText);
    const fragment = this.resumeFragmenter.create(input, embedding);

    return this.resumeFragmentRepository.create(fragment);
  }

  async retrieveContext(
    parsedJobProfile: ParsedJobProfile,
    options: RetrieveResumeFragmentsOptions = {}
  ): Promise<RetrievedResumeContext> {
    const fragments = await this.resumeRetriever.retrieveForParsedJob(parsedJobProfile, options);

    return {
      fragments,
      contextText: this.promptContextBuilder.build(fragments)
    };
  }
}
