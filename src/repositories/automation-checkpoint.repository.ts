import type { PostgrestError } from "@supabase/supabase-js";

import type {
  AutomationCheckpoint,
  NewAutomationCheckpoint
} from "../domain/observability/observability.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type JsonObject = Record<string, unknown>;

export type AutomationCheckpointRow = {
  id: string;
  application_id: string;
  execution_id: string;
  ats_type: string;
  current_step: string;
  checkpoint_data: JsonObject | null;
  is_completed: boolean | null;
  created_at: string;
  updated_at: string;
};

type AutomationCheckpointPayload = {
  application_id: string;
  execution_id: string;
  ats_type: string;
  current_step: string;
  checkpoint_data: JsonObject;
  is_completed: boolean;
};

type SupabaseSingleResult = {
  data: AutomationCheckpointRow | null;
  error: PostgrestError | null;
};

type SupabaseListResult = {
  data: AutomationCheckpointRow[] | null;
  error: PostgrestError | null;
};

type AutomationCheckpointTableClient = {
  insert(payload: AutomationCheckpointPayload): {
    select(columns: string): {
      single(): Promise<SupabaseSingleResult>;
    };
  };
  select(columns: string): {
    eq(column: string, value: string): {
      order(column: string, options: { ascending: boolean }): Promise<SupabaseListResult>;
    };
  };
};

export type SupabaseAutomationCheckpointClient = {
  from(table: "automation_checkpoints"): AutomationCheckpointTableClient;
};

export interface AutomationCheckpointRepository {
  create(checkpoint: NewAutomationCheckpoint): Promise<AutomationCheckpoint>;
  findByExecutionId(executionId: string): Promise<AutomationCheckpoint[]>;
}

export class SupabaseAutomationCheckpointRepository implements AutomationCheckpointRepository {
  constructor(
    private readonly client: SupabaseAutomationCheckpointClient =
      createSupabaseClient() as unknown as SupabaseAutomationCheckpointClient
  ) {}

  async create(checkpoint: NewAutomationCheckpoint): Promise<AutomationCheckpoint> {
    const result = await this.client
      .from("automation_checkpoints")
      .insert(toPayload(checkpoint))
      .select("*")
      .single();

    if (result.error) {
      throw new ApplicationError("AUTOMATION_CHECKPOINT_REPOSITORY_ERROR", "Unable to create checkpoint", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("AUTOMATION_CHECKPOINT_REPOSITORY_ERROR", "Checkpoint create returned no data");
    }

    return fromAutomationCheckpointRow(result.data);
  }

  async findByExecutionId(executionId: string): Promise<AutomationCheckpoint[]> {
    const result = await this.client
      .from("automation_checkpoints")
      .select("*")
      .eq("execution_id", executionId)
      .order("created_at", { ascending: true });

    if (result.error) {
      throw new ApplicationError("AUTOMATION_CHECKPOINT_REPOSITORY_ERROR", "Unable to find checkpoints", {
        cause: result.error
      });
    }

    return (result.data ?? []).map(fromAutomationCheckpointRow);
  }
}

function toPayload(checkpoint: NewAutomationCheckpoint): AutomationCheckpointPayload {
  return {
    application_id: checkpoint.applicationId,
    execution_id: checkpoint.executionId,
    ats_type: checkpoint.atsType,
    current_step: checkpoint.currentStep,
    checkpoint_data: checkpoint.checkpointData ?? {},
    is_completed: checkpoint.isCompleted ?? false
  };
}

function fromAutomationCheckpointRow(row: AutomationCheckpointRow): AutomationCheckpoint {
  return {
    id: row.id,
    applicationId: row.application_id,
    executionId: row.execution_id,
    atsType: row.ats_type,
    currentStep: row.current_step,
    checkpointData: row.checkpoint_data ?? {},
    isCompleted: row.is_completed ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
