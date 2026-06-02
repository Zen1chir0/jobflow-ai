import type { ATSCheckpointRecord } from "../../../domain/ats/ats-reliability.types.js";
import type { ATSCheckpointStore } from "./ats-checkpoint-store.interface.js";

export class InMemoryATSCheckpointStore implements ATSCheckpointStore {
  private readonly records: ATSCheckpointRecord[] = [];

  save(record: ATSCheckpointRecord): Promise<ATSCheckpointRecord> {
    this.records.push(record);
    return Promise.resolve(record);
  }

  findLatest(input: { executionId: string; jobId: string }): Promise<ATSCheckpointRecord | null> {
    const record = [...this.records]
      .reverse()
      .find((candidate) => candidate.executionId === input.executionId && candidate.jobId === input.jobId);

    return Promise.resolve(record ?? null);
  }
}
