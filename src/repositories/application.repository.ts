import type { PostgrestError } from "@supabase/supabase-js";

import type { Application, ApplicationState, NewApplication } from "../domain/applications/application.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

export type ApplicationRow = {
  id: string;
  job_id: string;
  current_state: string;
  selected_resume_id: string | null;
  application_url: string | null;
  ats_type: string | null;
  notes: string | null;
  last_execution_id: string | null;
  created_at: string;
  updated_at: string;
};

type ApplicationPayload = {
  job_id: string;
  current_state: ApplicationState;
  selected_resume_id?: string;
  application_url?: string;
  ats_type?: string;
  notes?: string;
  last_execution_id?: string;
};

export type ApplicationStateUpdate = {
  applicationId: string;
  toState: ApplicationState;
  executionId?: string;
};

type ApplicationUpdatePayload = {
  current_state: ApplicationState;
  last_execution_id?: string;
};

type SupabaseSingleResult = {
  data: ApplicationRow | null;
  error: PostgrestError | null;
};

type SupabaseMaybeSingleResult = {
  data: ApplicationRow | null;
  error: PostgrestError | null;
};

type ApplicationTableClient = {
  insert(payload: ApplicationPayload): {
    select(columns: string): {
      single(): Promise<SupabaseSingleResult>;
    };
  };
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): Promise<SupabaseMaybeSingleResult>;
    };
  };
  update(payload: ApplicationUpdatePayload): {
    eq(column: string, value: string): {
      select(columns: string): {
        single(): Promise<SupabaseSingleResult>;
      };
    };
  };
};

export type SupabaseApplicationClient = {
  from(table: "applications"): ApplicationTableClient;
};

export interface ApplicationRepository {
  create(application: NewApplication): Promise<Application>;
  findById(id: string): Promise<Application | null>;
  findByJobId(jobId: string): Promise<Application | null>;
  updateState(update: ApplicationStateUpdate): Promise<Application>;
}

export class SupabaseApplicationRepository implements ApplicationRepository {
  constructor(
    private readonly client: SupabaseApplicationClient = createSupabaseClient() as unknown as SupabaseApplicationClient
  ) {}

  async create(application: NewApplication): Promise<Application> {
    const result = await this.client.from("applications").insert(toPayload(application)).select("*").single();

    if (result.error) {
      throw new ApplicationError("APPLICATION_REPOSITORY_ERROR", "Unable to create application", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("APPLICATION_REPOSITORY_ERROR", "Application create returned no data");
    }

    return fromApplicationRow(result.data);
  }

  async findById(id: string): Promise<Application | null> {
    const result = await this.client.from("applications").select("*").eq("id", id).maybeSingle();

    if (result.error) {
      throw new ApplicationError("APPLICATION_REPOSITORY_ERROR", "Unable to find application by id", {
        cause: result.error
      });
    }

    return result.data ? fromApplicationRow(result.data) : null;
  }

  async findByJobId(jobId: string): Promise<Application | null> {
    const result = await this.client.from("applications").select("*").eq("job_id", jobId).maybeSingle();

    if (result.error) {
      throw new ApplicationError("APPLICATION_REPOSITORY_ERROR", "Unable to find application by job id", {
        cause: result.error
      });
    }

    return result.data ? fromApplicationRow(result.data) : null;
  }

  async updateState(update: ApplicationStateUpdate): Promise<Application> {
    const result = await this.client
      .from("applications")
      .update({
        current_state: update.toState,
        ...(update.executionId ? { last_execution_id: update.executionId } : {})
      })
      .eq("id", update.applicationId)
      .select("*")
      .single();

    if (result.error) {
      throw new ApplicationError("APPLICATION_REPOSITORY_ERROR", "Unable to update application state", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("APPLICATION_REPOSITORY_ERROR", "Application state update returned no data");
    }

    return fromApplicationRow(result.data);
  }
}

function toPayload(application: NewApplication): ApplicationPayload {
  return {
    job_id: application.jobId,
    current_state: application.currentState ?? "DISCOVERED",
    ...(application.selectedResumeId ? { selected_resume_id: application.selectedResumeId } : {}),
    ...(application.applicationUrl ? { application_url: application.applicationUrl } : {}),
    ...(application.atsType ? { ats_type: application.atsType } : {}),
    ...(application.notes ? { notes: application.notes } : {}),
    ...(application.executionId ? { last_execution_id: application.executionId } : {})
  };
}

function fromApplicationRow(row: ApplicationRow): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    currentState: row.current_state as ApplicationState,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.selected_resume_id ? { selectedResumeId: row.selected_resume_id } : {}),
    ...(row.application_url ? { applicationUrl: row.application_url } : {}),
    ...(row.ats_type ? { atsType: row.ats_type } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    ...(row.last_execution_id ? { lastExecutionId: row.last_execution_id } : {})
  };
}
