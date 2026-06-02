import type { ATSType } from "../../../domain/ats/ats.types.js";
import { ResumeUploadVerifier } from "../resume-upload-verifier.js";
import { ScreeningQuestionHandler } from "../screening-question-handler.js";
import { SubmitGuard } from "../submit-guard.js";
import type { ATSStrategy } from "../ats-strategy.interface.js";
import type { ATSStrategyExecutionRequest, ATSStrategyExecutionResult } from "../ats-interaction.types.js";
import { fillPersonalFields, type PersonalFieldDefinition } from "./strategy-field-utils.js";

const GENERIC_FIELDS: PersonalFieldDefinition[] = [
  {
    fieldKey: "first_name",
    value: (profile) => profile.firstName,
    candidates: [
      { strategy: "label", value: /first name/i },
      { strategy: "placeholder", value: /first name/i }
    ]
  },
  {
    fieldKey: "last_name",
    value: (profile) => profile.lastName,
    candidates: [
      { strategy: "label", value: /last name/i },
      { strategy: "placeholder", value: /last name/i }
    ]
  },
  {
    fieldKey: "email",
    value: (profile) => profile.email,
    candidates: [
      { strategy: "label", value: /email/i },
      { strategy: "placeholder", value: /email/i }
    ]
  }
];

export class GenericStrategy implements ATSStrategy {
  readonly type: ATSType = "generic";

  constructor(
    private readonly uploadVerifier = new ResumeUploadVerifier(),
    private readonly screeningQuestionHandler = new ScreeningQuestionHandler(),
    private readonly submitGuard = new SubmitGuard()
  ) {}

  detect(): boolean {
    return true;
  }

  async execute(request: ATSStrategyExecutionRequest): Promise<ATSStrategyExecutionResult> {
    const filledFields = await fillPersonalFields(request.page, request.applicantProfile, GENERIC_FIELDS);
    const resumeUpload = await this.uploadVerifier.uploadAndVerify({
      adapter: request.page,
      filePath: request.resumePdfPath,
      candidates: [
        { strategy: "label", value: /resume/i },
        { strategy: "css", value: "input[type='file']" }
      ]
    });
    const screeningQuestions = await this.screeningQuestionHandler.answerSafeQuestions({
      adapter: request.page,
      answers: request.screeningAnswers ?? [],
      questions: [
        {
          question: "Why are you interested in this role?",
          candidates: [{ strategy: "label", value: /why are you interested in this role\?/i }]
        }
      ]
    });

    this.submitGuard.assertSafeAction("Human Review Required");

    return {
      jobId: request.jobId,
      atsType: this.type,
      resumePdfPath: request.resumePdfPath,
      status: "HUMAN_APPROVAL_REQUIRED",
      requiresHumanApproval: true,
      message: "Generic mock application filled conservatively. Review manually before submission.",
      filledFields,
      resumeUpload,
      screeningQuestions
    };
  }
}
