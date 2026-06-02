import type { ATSDetectionInput, ATSType } from "../../../domain/ats/ats.types.js";
import { ResumeUploadVerifier } from "../resume-upload-verifier.js";
import { ScreeningQuestionHandler } from "../screening-question-handler.js";
import { SubmitGuard } from "../submit-guard.js";
import type { ATSStrategy } from "../ats-strategy.interface.js";
import type { ATSStrategyExecutionRequest, ATSStrategyExecutionResult } from "../ats-interaction.types.js";
import { fillPersonalFields, type PersonalFieldDefinition } from "./strategy-field-utils.js";

const LEVER_FIELDS: PersonalFieldDefinition[] = [
  {
    fieldKey: "first_name",
    value: (profile) => profile.firstName,
    candidates: [
      { strategy: "label", value: /first name/i },
      { strategy: "placeholder", value: /first name/i },
      { strategy: "css", value: "input[name='name']" }
    ]
  },
  {
    fieldKey: "last_name",
    value: (profile) => profile.lastName,
    candidates: [
      { strategy: "label", value: /last name/i },
      { strategy: "placeholder", value: /last name/i },
      { strategy: "associated_text", value: /full name/i }
    ]
  },
  {
    fieldKey: "email",
    value: (profile) => profile.email,
    candidates: [
      { strategy: "label", value: /email/i },
      { strategy: "placeholder", value: /email/i },
      { strategy: "css", value: "input[name='email']" }
    ]
  },
  {
    fieldKey: "linkedin",
    value: (profile) => profile.linkedin,
    candidates: [
      { strategy: "label", value: /linkedin/i },
      { strategy: "placeholder", value: /linkedin/i },
      { strategy: "css", value: "input[name='urls[LinkedIn]']" }
    ]
  }
];

export class LeverStrategy implements ATSStrategy {
  readonly type: ATSType = "lever";

  constructor(
    private readonly uploadVerifier = new ResumeUploadVerifier(),
    private readonly screeningQuestionHandler = new ScreeningQuestionHandler(),
    private readonly submitGuard = new SubmitGuard()
  ) {}

  detect(input: ATSDetectionInput): boolean {
    return /jobs\.lever\.co|\blever\b/i.test([input.url, input.html, input.pageText].join("\n"));
  }

  async execute(request: ATSStrategyExecutionRequest): Promise<ATSStrategyExecutionResult> {
    const filledFields = await fillPersonalFields(request.page, request.applicantProfile, LEVER_FIELDS);
    const resumeUpload = await this.uploadVerifier.uploadAndVerify({
      adapter: request.page,
      filePath: request.resumePdfPath,
      candidates: [
        { strategy: "label", value: /resume/i },
        { strategy: "associated_text", value: /resume\/cv/i },
        { strategy: "css", value: "input[type='file']" }
      ]
    });
    const screeningQuestions = await this.screeningQuestionHandler.answerSafeQuestions({
      adapter: request.page,
      answers: request.screeningAnswers ?? [],
      questions: [
        {
          question: "Why are you interested in Example Co?",
          candidates: [
            { strategy: "label", value: /why are you interested in example co/i },
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
      message: "Lever mock application filled. Review manually before submission.",
      filledFields,
      resumeUpload,
      screeningQuestions
    };
  }
}
