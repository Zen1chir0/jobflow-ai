import { describe, expect, it, vi } from "vitest";

import type { ParsedJobProfile } from "../../../../src/domain/jobs/parsed-job-profile.types.js";
import type { ResumeFragment } from "../../../../src/domain/resumes/resume-fragment.types.js";
import type { EmbeddingProvider } from "../../../../src/integrations/embeddings/embedding-provider.interface.js";
import type { ResumeFragmentRepository } from "../../../../src/repositories/resume-fragment.repository.js";
import { ResumeRetriever } from "../../../../src/services/resume-intelligence/resume-retriever.js";

describe("ResumeRetriever", () => {
  it("uses existing parsed job embeddings when available", async () => {
    const fragments = [buildFragment()];
    const matchResumeFragments = vi.fn().mockResolvedValue(fragments);
    const embed = vi.fn();
    const retriever = new ResumeRetriever(
      {
        create: vi.fn(),
        findByUserProfileId: vi.fn(),
        matchResumeFragments
      } satisfies ResumeFragmentRepository,
      { embed } satisfies EmbeddingProvider
    );

    const result = await retriever.retrieveForParsedJob({
      ...buildParsedProfile(),
      embedding: [0.2, 0.3]
    });

    expect(embed).not.toHaveBeenCalled();
    expect(matchResumeFragments).toHaveBeenCalledWith([0.2, 0.3], 0.72, 5);
    expect(result).toEqual(fragments);
  });

  it("embeds deterministic job text when the parsed profile has no embedding", async () => {
    const embedding = [0.4, 0.5];
    const matchResumeFragments = vi.fn().mockResolvedValue([]);
    const embed = vi.fn().mockResolvedValue(embedding);
    const retriever = new ResumeRetriever(
      {
        create: vi.fn(),
        findByUserProfileId: vi.fn(),
        matchResumeFragments
      } satisfies ResumeFragmentRepository,
      { embed } satisfies EmbeddingProvider
    );

    await retriever.retrieveForParsedJob(buildParsedProfile(), { threshold: 0.8, topK: 3 });

    expect(embed).toHaveBeenCalledWith(expect.stringContaining("Playwright"));
    expect(matchResumeFragments).toHaveBeenCalledWith(embedding, 0.8, 3);
  });
});

function buildParsedProfile(): ParsedJobProfile {
  return {
    jobId: "job_1",
    responsibilities: ["Build test automation"],
    requiredSkills: ["Playwright"],
    preferredSkills: ["Supabase"],
    seniority: "mid",
    industry: "SaaS",
    compensation: {},
    rawMetadata: { descriptionClean: "Clean description" }
  };
}

function buildFragment(): ResumeFragment {
  return {
    id: "fragment_1",
    fragmentText: "Built Playwright framework.",
    fragmentType: "project",
    metadata: {},
    embedding: [],
    similarity: 0.9
  };
}
