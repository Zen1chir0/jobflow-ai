import { ApplicationError } from "../domain/errors/application-error.js";
import type {
  ResumeFragment,
  ResumeFragmentInput,
  ResumeFragmentType
} from "../domain/resumes/resume-fragment.types.js";
import type { UserProfileRepository } from "../repositories/user-profile.repository.js";
import type { ResumeIntelligenceService } from "../services/resume-intelligence/resume-intelligence.service.js";

export type CreateResumeFragmentRequest = {
  fragmentText: string;
  fragmentType: ResumeFragmentType;
  sourceLabel?: string;
  userProfileId?: string;
};

export type CreateResumeFragmentResult = {
  fragment: ResumeFragment;
};

export class CreateResumeFragmentUseCase {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly resumeIntelligenceService: ResumeIntelligenceService
  ) {}

  async execute(request: CreateResumeFragmentRequest): Promise<CreateResumeFragmentResult> {
    if (!request.fragmentText.trim()) {
      throw new ApplicationError("INVALID_RESUME_INTELLIGENCE_REQUEST", "Resume fragment text is required");
    }

    const userProfileId = request.userProfileId ?? (await this.resolveDefaultUserProfileId());
    const fragmentInput: ResumeFragmentInput = {
      userProfileId,
      fragmentText: request.fragmentText,
      fragmentType: request.fragmentType,
      ...(request.sourceLabel ? { sourceLabel: request.sourceLabel } : {})
    };

    return {
      fragment: await this.resumeIntelligenceService.createFragment(fragmentInput)
    };
  }

  private async resolveDefaultUserProfileId(): Promise<string> {
    const userProfile = await this.userProfileRepository.findDefault();

    if (!userProfile) {
      throw new ApplicationError("USER_PROFILE_NOT_FOUND", "User profile not found");
    }

    return userProfile.id;
  }
}
