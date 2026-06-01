import { ApplicationError } from "../../domain/errors/application-error.js";
import type {
  NewResumeFragment,
  ResumeFragmentInput,
  ResumeFragmentType
} from "../../domain/resumes/resume-fragment.types.js";
import { RESUME_FRAGMENT_TYPES } from "../../domain/resumes/resume-fragment.types.js";

const EXPECTED_EMBEDDING_DIMENSIONS = 1536;

export class ResumeFragmenter {
  create(input: ResumeFragmentInput, embedding: number[]): NewResumeFragment {
    const fragmentText = normalizeFragmentText(input.fragmentText);

    if (!fragmentText) {
      throw new ApplicationError("INVALID_RESUME_FRAGMENT", "Resume fragment text is required");
    }

    if (!isResumeFragmentType(input.fragmentType)) {
      throw new ApplicationError("INVALID_RESUME_FRAGMENT", "Resume fragment type is invalid");
    }

    if (embedding.length !== EXPECTED_EMBEDDING_DIMENSIONS) {
      throw new ApplicationError("INVALID_RESUME_FRAGMENT", "Resume fragment embedding dimensions are invalid");
    }

    return {
      fragmentText,
      fragmentType: input.fragmentType,
      metadata: input.metadata ?? {},
      embedding,
      ...(input.userProfileId ? { userProfileId: input.userProfileId } : {}),
      ...(input.sourceLabel ? { sourceLabel: input.sourceLabel.trim() } : {})
    };
  }
}

function normalizeFragmentText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isResumeFragmentType(value: string): value is ResumeFragmentType {
  return RESUME_FRAGMENT_TYPES.includes(value as ResumeFragmentType);
}
