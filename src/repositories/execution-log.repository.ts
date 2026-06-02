import type { PostgrestError } from "@supabase/supabase-js";

import type {
  ExecutionLog,
  ExecutionLogStatus,
  ExecutionServiceName,
  NewExecutionLog
} from "../domain/observability/observability.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type JsonObject = Record<string, unknown>;

export type ExecutionLogRow = {
  id: string;
  execution_id: string;
  service: string;
  step: string;
  status: string;
  job_id: string | null;
  application_id: string | null;
  ats_type: string | null;
  error_message: string | null;
  error_stack: string | null;
  metadata: JsonObject | null;
  created_at: string;
};

type ExecutionLogPayload = {
  execution_id: string;
  service: ExecutionServiceName;
  step: string;
  status: ExecutionLogStatus;
  metadata: JsonObject;
  job_id?: string;
  application_id?: string;
  ats_type?: string;
  error_message?: string;
  error_stack?: string;
};

type SupabaseSingleResult = {
  data: ExecutionLogRow | null;
  error: PostgrestError | null;
};

type SupabaseListResult = {
  data: ExecutionLogRow[] | null;
  error: PostgrestError | null;
};

type ExecutionLogTableClient = {
  insert(payload: ExecutionLogPayload): {
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

export type SupabaseExecutionLogClient = {
  from(table: "execution_logs"): ExecutionLogTableClient;
};

export interface ExecutionLogRepository {
  create(log: NewExecutionLog): Promise<ExecutionLog>;
  findByExecutionId(executionId: string): Promise<ExecutionLog[]>;
}

export class SupabaseExecutionLogRepository implements ExecutionLogRepository {
  constructor(
    private readonly client: SupabaseExecutionLogClient =
      createSupabaseClient() as unknown as SupabaseExecutionLogClient
  ) {}

  async create(log: NewExecutionLog): Promise<ExecutionLog> {
    const result = await this.client.from("execution_logs").insert(toPayload(log)).select("*").single();

    if (result.error) {
      throw new ApplicationError("EXECUTION_LOG_REPOSITORY_ERROR", "Unable to create execution log", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("EXECUTION_LOG_REPOSITORY_ERROR", "Execution log create returned no data");
    }

    return fromExecutionLogRow(result.data);
  }

  async findByExecutionId(executionId: string): Promise<ExecutionLog[]> {
    const result = await this.client
      .from("execution_logs")
      .select("*")
      .eq("execution_id", executionId)
      .order("created_at", { ascending: true });

    if (result.error) {
      throw new ApplicationError("EXECUTION_LOG_REPOSITORY_ERROR", "Unable to find execution logs", {
        cause: result.error
      });
    }

    return (result.data ?? []).map(fromExecutionLogRow);
  }
}

function toPayload(log: NewExecutionLog): ExecutionLogPayload {
  return {
    execution_id: log.executionId,
    service: log.service,
    step: log.step,
    status: log.status,
    metadata: log.metadata ?? {},
    ...(log.jobId ? { job_id: log.jobId } : {}),
    ...(log.applicationId ? { application_id: log.applicationId } : {}),
    ...(log.atsType ? { ats_type: log.atsType } : {}),
    ...(log.errorMessage ? { error_message: log.errorMessage } : {}),
    ...(log.errorStack ? { error_stack: log.errorStack } : {})
  };
}

function fromExecutionLogRow(row: ExecutionLogRow): ExecutionLog {
  return {
    id: row.id,
    executionId: row.execution_id,
    service: row.service as ExecutionServiceName,
    step: row.step,
    status: row.status as ExecutionLogStatus,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    ...(row.job_id ? { jobId: row.job_id } : {}),
    ...(row.application_id ? { applicationId: row.application_id } : {}),
    ...(row.ats_type ? { atsType: row.ats_type } : {}),
    ...(row.error_message ? { errorMessage: row.error_message } : {}),
    ...(row.error_stack ? { errorStack: row.error_stack } : {})
  };
}
