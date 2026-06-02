import type {
  ApplicantProfile,
  ATSAutomationPlan,
  ATSDetectionInput,
  ATSType,
  ScreeningAnswer
} from "../../domain/ats/ats.types.js";

export interface ATSStrategy {
  readonly type: ATSType;

  detect(input: ATSDetectionInput): boolean | Promise<boolean>;

  initialize?(): Promise<void>;

  fillPersonalInfo?(data: ApplicantProfile): Promise<void>;

  uploadResume?(filePath: string): Promise<void>;

  answerScreeningQuestions?(answers: ScreeningAnswer[]): Promise<void>;

  pauseForHumanReview?(): Promise<ATSAutomationPlan>;
}
