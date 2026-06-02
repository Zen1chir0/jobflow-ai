import { ApplicationError } from "../../domain/errors/application-error.js";

const FINAL_SUBMIT_PATTERNS = [
  /\bsubmit\b/i,
  /\bsend application\b/i,
  /\bapply\b/i,
  /\bfinalize\b/i,
  /\bcomplete application\b/i
];

export class SubmitGuard {
  assertSafeAction(label: string): void {
    if (this.isFinalSubmitAction(label)) {
      throw new ApplicationError("UNSAFE_SUBMIT_ACTION", "Final application submission is not automated");
    }
  }

  isFinalSubmitAction(label: string): boolean {
    return FINAL_SUBMIT_PATTERNS.some((pattern) => pattern.test(label.trim()));
  }
}
