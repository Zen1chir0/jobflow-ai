import type { ATSCheckpointRecord } from "../../../domain/ats/ats-reliability.types.js";

export interface ATSCheckpointStore {
  save(record: ATSCheckpointRecord): Promise<ATSCheckpointRecord>;
  findLatest(input: { executionId: string; jobId: string }): Promise<ATSCheckpointRecord | null>;
}
