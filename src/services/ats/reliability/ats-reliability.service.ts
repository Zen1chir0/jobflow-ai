import type { ATSCheckpointRecord, ATSFailureRecord, ATSFailureStep } from "../../../domain/ats/ats-reliability.types.js";
import type { ATSType } from "../../../domain/ats/ats.types.js";
import { ATSFailureCapture } from "./ats-failure-capture.js";
import type { ATSCheckpointStore } from "./ats-checkpoint-store.interface.js";
import { RetryPolicy } from "./retry-policy.js";
import { ScreenshotPathBuilder } from "./screenshot-path-builder.js";

export class ATSReliabilityService {
  constructor(
    private readonly checkpointStore: ATSCheckpointStore,
    private readonly failureCapture = new ATSFailureCapture(),
    private readonly screenshotPathBuilder = new ScreenshotPathBuilder(),
    private readonly retryPolicy = new RetryPolicy()
  ) {}

  async saveCheckpoint(record: ATSCheckpointRecord): Promise<ATSCheckpointRecord> {
    return this.checkpointStore.save(record);
  }

  captureFailure(input: {
    executionId: string;
    atsType: ATSType;
    jobId: string;
    step: ATSFailureStep;
    error: unknown;
    checkpoint?: unknown;
    createdAt?: string;
  }): ATSFailureRecord {
    const screenshotPath = this.screenshotPathBuilder.build({
      executionId: input.executionId,
      atsType: input.atsType,
      step: input.step
    });

    return this.failureCapture.capture({
      ...input,
      screenshotPath
    });
  }

  decideRetry(input: { attempt: number; errorCode: string; unsafeSubmitAttempt?: boolean }) {
    return this.retryPolicy.decide(input);
  }
}
