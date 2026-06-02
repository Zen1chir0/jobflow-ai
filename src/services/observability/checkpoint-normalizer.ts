import { sanitizeMetadata } from "./failure-context-normalizer.js";

export class CheckpointNormalizer {
  normalize(checkpointData: Record<string, unknown> = {}): Record<string, unknown> {
    return sanitizeMetadata(checkpointData);
  }
}
