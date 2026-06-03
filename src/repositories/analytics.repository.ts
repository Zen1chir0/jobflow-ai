import type { PostgrestError } from "@supabase/supabase-js";

import type {
  AnalyticsApplicationEventRecord,
  AnalyticsApplicationRecord,
  AnalyticsCheckpointRecord,
  AnalyticsDataset,
  AnalyticsExecutionLogRecord,
  AnalyticsGeneratedDocumentRecord,
  AnalyticsGeneratedResumeRecord,
  AnalyticsJobRecord,
  AnalyticsParsedJobRecord,
  AnalyticsScoreRecord,
  ApplicationStateCountViewRecord,
  ApplicationSummaryViewRecord,
  PlatformPerformanceViewRecord
} from "../domain/analytics/analytics.types.js";
import type { ApplicationState } from "../domain/applications/application.types.js";
import type { ExecutionLogStatus } from "../domain/observability/observability.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type QueryResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
};

type ReadOnlyTableClient<T> = {
  select(columns: string): Promise<QueryResult<T>>;
};

export type AnalyticsApplicationRow = {
  id: string;
  current_state: string;
  ats_type: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalyticsApplicationEventRow = {
  id: string;
  application_id: string;
  from_state: string | null;
  to_state: string;
  event_type: string | null;
  execution_id: string | null;
  created_at: string;
};

export type AnalyticsExecutionLogRow = {
  id: string;
  execution_id: string;
  service: string;
  step: string;
  status: string;
  application_id: string | null;
  ats_type: string | null;
  error_message: string | null;
  created_at: string;
};

export type AnalyticsCheckpointRow = {
  id: string;
  application_id: string;
  execution_id: string;
  ats_type: string;
  current_step: string;
  is_completed: boolean | null;
  created_at: string;
};

export type AnalyticsJobRow = {
  id: string;
  discovered_at: string;
  parsed_at: string | null;
  source: string | null;
  ats_type: string | null;
};

export type AnalyticsParsedJobRow = {
  id: string;
  job_id: string;
};

export type AnalyticsScoreRow = {
  id: string;
  job_id: string;
  final_score: number;
};

export type AnalyticsGeneratedDocumentRow = {
  id: string;
  job_id: string;
  document_type: string;
  created_at: string;
};

export type AnalyticsGeneratedResumeRow = {
  id: string;
  job_id: string;
  template: string;
  created_at: string;
};

export type ApplicationSummaryViewRow = {
  application_id: string;
  title: string;
  company: string;
  source: string | null;
  ats_type: string | null;
  current_state: string;
  final_score: number | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationStateCountViewRow = {
  current_state: string;
  count: number;
};

export type PlatformPerformanceViewRow = {
  source: string;
  total_applications: number;
  positive_responses: number;
  positive_response_rate: number;
};

type AnalyticsTableName =
  | "applications"
  | "application_events"
  | "execution_logs"
  | "automation_checkpoints"
  | "jobs"
  | "parsed_job_profiles"
  | "job_match_scores"
  | "generated_documents"
  | "generated_resumes"
  | "application_summary_view"
  | "application_state_counts_view"
  | "platform_performance_view";

export type SupabaseAnalyticsClient = {
  from(table: AnalyticsTableName): ReadOnlyTableClient<unknown>;
};

export interface AnalyticsRepository {
  getDataset(): Promise<AnalyticsDataset>;
}

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(
    private readonly client: SupabaseAnalyticsClient = createSupabaseClient() as unknown as SupabaseAnalyticsClient
  ) {}

  async getDataset(): Promise<AnalyticsDataset> {
    const [
      applications,
      applicationEvents,
      executionLogs,
      automationCheckpoints,
      jobs,
      parsedJobProfiles,
      jobMatchScores,
      generatedDocuments,
      generatedResumes,
      applicationSummary,
      applicationStateCounts,
      platformPerformance
    ] = await Promise.all([
      this.select("applications", "*", fromApplicationRow),
      this.select("application_events", "*", fromApplicationEventRow),
      this.select("execution_logs", "*", fromExecutionLogRow),
      this.select("automation_checkpoints", "*", fromCheckpointRow),
      this.select("jobs", "*", fromJobRow),
      this.select("parsed_job_profiles", "*", fromParsedJobRow),
      this.select("job_match_scores", "*", fromScoreRow),
      this.select("generated_documents", "*", fromGeneratedDocumentRow),
      this.select("generated_resumes", "*", fromGeneratedResumeRow),
      this.select("application_summary_view", "*", fromApplicationSummaryRow),
      this.select("application_state_counts_view", "*", fromApplicationStateCountRow),
      this.select("platform_performance_view", "*", fromPlatformPerformanceRow)
    ]);

    return {
      applications,
      applicationEvents,
      executionLogs,
      automationCheckpoints,
      jobs,
      parsedJobProfiles,
      jobMatchScores,
      generatedDocuments,
      generatedResumes,
      applicationSummary,
      applicationStateCounts,
      platformPerformance
    };
  }

  private async select<T, R>(
    table: AnalyticsTableName,
    columns: string,
    mapper: (row: T) => R
  ): Promise<R[]> {
    const result = (await this.client.from(table).select(columns)) as QueryResult<T>;

    if (result.error) {
      throw new ApplicationError("ANALYTICS_REPOSITORY_ERROR", "Unable to load analytics dataset", {
        cause: result.error
      });
    }

    return (result.data ?? []).map(mapper);
  }
}

function fromApplicationRow(row: AnalyticsApplicationRow): AnalyticsApplicationRecord {
  return {
    id: row.id,
    currentState: row.current_state as ApplicationState,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.ats_type ? { atsType: row.ats_type } : {})
  };
}

function fromApplicationEventRow(row: AnalyticsApplicationEventRow): AnalyticsApplicationEventRecord {
  return {
    id: row.id,
    applicationId: row.application_id,
    toState: row.to_state as ApplicationState,
    createdAt: row.created_at,
    ...(row.from_state ? { fromState: row.from_state as ApplicationState } : {}),
    ...(row.event_type ? { eventType: row.event_type } : {}),
    ...(row.execution_id ? { executionId: row.execution_id } : {})
  };
}

function fromExecutionLogRow(row: AnalyticsExecutionLogRow): AnalyticsExecutionLogRecord {
  return {
    id: row.id,
    executionId: row.execution_id,
    service: row.service,
    step: row.step,
    status: row.status as ExecutionLogStatus,
    createdAt: row.created_at,
    ...(row.application_id ? { applicationId: row.application_id } : {}),
    ...(row.ats_type ? { atsType: row.ats_type } : {}),
    ...(row.error_message ? { errorMessage: row.error_message } : {})
  };
}

function fromCheckpointRow(row: AnalyticsCheckpointRow): AnalyticsCheckpointRecord {
  return {
    id: row.id,
    applicationId: row.application_id,
    executionId: row.execution_id,
    atsType: row.ats_type,
    currentStep: row.current_step,
    isCompleted: row.is_completed ?? false,
    createdAt: row.created_at
  };
}

function fromJobRow(row: AnalyticsJobRow): AnalyticsJobRecord {
  return {
    id: row.id,
    discoveredAt: row.discovered_at,
    ...(row.parsed_at ? { parsedAt: row.parsed_at } : {}),
    ...(row.source ? { source: row.source } : {}),
    ...(row.ats_type ? { atsType: row.ats_type } : {})
  };
}

function fromParsedJobRow(row: AnalyticsParsedJobRow): AnalyticsParsedJobRecord {
  return {
    id: row.id,
    jobId: row.job_id
  };
}

function fromScoreRow(row: AnalyticsScoreRow): AnalyticsScoreRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    finalScore: row.final_score
  };
}

function fromGeneratedDocumentRow(row: AnalyticsGeneratedDocumentRow): AnalyticsGeneratedDocumentRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    documentType: row.document_type,
    createdAt: row.created_at
  };
}

function fromGeneratedResumeRow(row: AnalyticsGeneratedResumeRow): AnalyticsGeneratedResumeRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    template: row.template,
    createdAt: row.created_at
  };
}

function fromApplicationSummaryRow(row: ApplicationSummaryViewRow): ApplicationSummaryViewRecord {
  return {
    applicationId: row.application_id,
    title: row.title,
    company: row.company,
    currentState: row.current_state as ApplicationState,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.source ? { source: row.source } : {}),
    ...(row.ats_type ? { atsType: row.ats_type } : {}),
    ...(row.final_score !== null ? { finalScore: row.final_score } : {})
  };
}

function fromApplicationStateCountRow(row: ApplicationStateCountViewRow): ApplicationStateCountViewRecord {
  return {
    currentState: row.current_state as ApplicationState,
    count: row.count
  };
}

function fromPlatformPerformanceRow(row: PlatformPerformanceViewRow): PlatformPerformanceViewRecord {
  return {
    source: row.source,
    totalApplications: row.total_applications,
    positiveResponses: row.positive_responses,
    positiveResponseRate: row.positive_response_rate
  };
}
