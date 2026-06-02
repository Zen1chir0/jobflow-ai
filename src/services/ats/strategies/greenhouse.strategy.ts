import type { ATSDetectionInput, ATSType } from "../../../domain/ats/ats.types.js";
import { ResumeUploadVerifier } from "../resume-upload-verifier.js";
import { ScreeningQuestionHandler } from "../screening-question-handler.js";
import { SubmitGuard } from "../submit-guard.js";
import type { ATSStrategy } from "../ats-strategy.interface.js";
import type { ATSStrategyExecutionRequest, ATSStrategyExecutionResult } from "../ats-interaction.types.js";
import { fillPersonalFields, type PersonalFieldDefinition } from "./strategy-field-utils.js";

const GREENHOUSE_FIELDS: PersonalFieldDefinition[] = [
  {
    fieldKey: "first_name",
    value: (profile) => profile.firstName,
    candidates: [
      { strategy: "label", value: /first name/i },
      { strategy: "data_attribute", value: "job_application[first_name]" },
      { strategy: "css", value: "input[name='job_application[first_name]']" }
    ]
  },
  {
    fieldKey: "last_name",
    value: (profile) => profile.lastName,
    candidates: [
      { strategy: "label", value: /last name/i },
      { strategy: "data_attribute", value: "job_application[last_name]" },
      { strategy: "css", value: "input[name='job_application[last_name]']" }
    ]
  },
  {
    fieldKey: "email",
    value: (profile) => profile.email,
    candidates: [
      { strategy: "label", value: /email/i },
      { strategy: "data_attribute", value: "job_application[email]" },
      { strategy: "css", value: "input[name='job_application[email]']" }
    ]
  },
  {
    fieldKey: "phone",
    value: (profile) => profile.phone,
    candidates: [
      { strategy: "label", value: /phone/i },
      { strategy: "data_attribute", value: "job_application[phone]" },
      { strategy: "css", value: "input[name='job_application[phone]']" }
    ]
  }
];

export class GreenhouseStrategy implements ATSStrategy {
  readonly type: ATSType = "greenhouse";

  constructor(
    private readonly uploadVerifier = new ResumeUploadVerifier(),
    private readonly screeningQuestionHandler = new ScreeningQuestionHandler(),
    private readonly submitGuard = new SubmitGuard()
  ) {}

  detect(input: ATSDetectionInput): boolean {
    return /greenhouse\.io|boards\.greenhouse\.io|job_application/i.test([input.url, input.html, input.pageText].join("\n"));
  }

  async execute(request: ATSStrategyExecutionRequest): Promise<ATSStrategyExecutionResult> {
    const filledFields = await fillPersonalFields(request.page, request.applicantProfile, GREENHOUSE_FIELDS);
    const resumeUpload = await this.uploadVerifier.uploadAndVerify({
      adapter: request.page,
      filePath: request.resumePdfPath,
      candidates: [
        { strategy: "label", value: /resume/i },
        { strategy: "data_attribute", value: "job_application[resume]" },
        { strategy: "css", value: "input[type='file']" }
      ]
    });
    const screeningQuestions = await this.screeningQuestionHandler.answerSafeQuestions({
      adapter: request.page,
      answers: request.screeningAnswers ?? [],
      questions: [
        {
          question: "Why are you interested in this role?",
          candidates: [
            { strategy: "label", value: /why are you interested in this role/i },
            { strategy: "associated_text", value: /why are you interested/i }
          ]
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
      message: "Greenhouse mock application filled. Review manually before submission.",
      filledFields,
      resumeUpload,
      screeningQuestions
    };
  }
}
