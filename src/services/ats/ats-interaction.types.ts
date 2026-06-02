import type {
  ApplicantProfile,
  ATSAutomationPlan,
  ATSScreeningQuestionResult,
  ATSFieldFillResult,
  ATSResumeUploadResult,
  ScreeningAnswer
} from "../../domain/ats/ats.types.js";
import type { ATSPageAdapter } from "./ats-page-adapter.interface.js";

export type ATSStrategyExecutionRequest = {
  jobId: string;
  applicationUrl: string;
  applicantProfile: ApplicantProfile;
  resumePdfPath: string;
  screeningAnswers?: ScreeningAnswer[];
  page: ATSPageAdapter;
};

export type ATSStrategyExecutionResult = ATSAutomationPlan & {
  filledFields: ATSFieldFillResult[];
  resumeUpload: ATSResumeUploadResult;
  screeningQuestions: ATSScreeningQuestionResult[];
};
