import type { ATSDetectionInput, ATSType } from "../../../domain/ats/ats.types.js";
import { WorkdayCheckpointBuilder } from "../workday/workday-checkpoint-builder.js";
import { WorkdayPageStateDetector } from "../workday/workday-page-state-detector.js";
import { SubmitGuard } from "../submit-guard.js";
import type { ATSStrategy } from "../ats-strategy.interface.js";
import type { ATSStrategyExecutionRequest, ATSStrategyExecutionResult } from "../ats-interaction.types.js";

export class WorkdayStrategy implements ATSStrategy {
  readonly type: ATSType = "workday";

  constructor(
    private readonly pageStateDetector = new WorkdayPageStateDetector(),
    private readonly checkpointBuilder = new WorkdayCheckpointBuilder(),
    private readonly submitGuard = new SubmitGuard()
  ) {}

  detect(input: ATSDetectionInput): boolean {
    return /myworkdayjobs\.com|workday|wd1\.myworkdaysite\.com/i.test([input.url, input.html, input.pageText].join("\n"));
  }

  async execute(request: ATSStrategyExecutionRequest): Promise<ATSStrategyExecutionResult> {
    const currentState = await this.pageStateDetector.detectCurrentState(request.page);
    const checkpoint = this.checkpointBuilder.build({
      jobId: request.jobId,
      currentState
    });

    this.submitGuard.assertSafeAction("Human Review Required");

    return {
      jobId: request.jobId,
      atsType: this.type,
      resumePdfPath: request.resumePdfPath,
      status: "HUMAN_APPROVAL_REQUIRED",
      requiresHumanApproval: true,
      message: `Workday current state detected: ${currentState}. Phase 7C stops without automatic state progression.`,
      checkpoint,
      filledFields: [],
      resumeUpload: {
        uploaded: false,
        fileName: request.resumePdfPath.split(/[\\/]/).at(-1) ?? request.resumePdfPath
      },
      screeningQuestions: []
    };
  }
}
