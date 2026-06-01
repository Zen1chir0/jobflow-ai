import type { PostgrestError } from "@supabase/supabase-js";

import { ApplicationError } from "../domain/errors/application-error.js";
import type { ATSType, Job, JobSource, NewJob, RemoteType } from "../domain/jobs/job.types.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

export type JobRow = {
  id: string;
  source: string;
  source_job_id: string | null;
  title: string;
  company: string;
  location: string | null;
  remote_type: string | null;
  salary_raw: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  description_raw: string;
  description_clean: string | null;
  application_url: string;
  ats_type: string | null;
  discovered_at: string;
  parsed_at: string | null;
};

type JobPayload = {
  source: JobSource;
  source_job_id?: string;
  title: string;
  company: string;
  location?: string;
  remote_type: RemoteType;
  salary_raw?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  description_raw: string;
  description_clean?: string;
  application_url: string;
  ats_type: ATSType;
  discovered_at: string;
};

type SupabaseSingleResult = {
  data: JobRow | null;
  error: PostgrestError | null;
};

type SupabaseMaybeSingleResult = {
  data: JobRow | null;
  error: PostgrestError | null;
};

type SupabaseListResult = {
  data: JobRow[] | null;
  error: PostgrestError | null;
};

type SupabaseUpdateResult = {
  error: PostgrestError | null;
};

type JobUpdatePayload = {
  parsed_at?: string;
  description_clean?: string;
};

type JobTableClient = {
  upsert(payload: JobPayload, options: { onConflict: string }): {
    select(columns: string): {
      single(): Promise<SupabaseSingleResult>;
    };
  };
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): Promise<SupabaseMaybeSingleResult>;
    };
    is(column: string, value: null): {
      order(column: string, options: { ascending: boolean }): {
        limit(count: number): Promise<SupabaseListResult>;
      };
    };
  };
  update(payload: JobUpdatePayload): {
    eq(column: string, value: string): Promise<SupabaseUpdateResult>;
  };
};

export type SupabaseJobClient = {
  from(table: "jobs"): JobTableClient;
};

export interface JobRepository {
  upsert(job: NewJob): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findUnparsed(limit?: number): Promise<Job[]>;
  markParsed(jobId: string, parsedAt?: string, descriptionClean?: string): Promise<void>;
}

export class SupabaseJobRepository implements JobRepository {
  constructor(private readonly client: SupabaseJobClient = createSupabaseClient() as unknown as SupabaseJobClient) {}

  async upsert(job: NewJob): Promise<Job> {
    const result = await this.client
      .from("jobs")
      .upsert(toJobPayload(job), { onConflict: "application_url" })
      .select("*")
      .single();

    if (result.error) {
      throw new ApplicationError("JOB_REPOSITORY_ERROR", "Unable to upsert job", { cause: result.error });
    }

    if (!result.data) {
      throw new ApplicationError("JOB_REPOSITORY_ERROR", "Job upsert returned no data");
    }

    return fromJobRow(result.data);
  }

  async findById(id: string): Promise<Job | null> {
    const result = await this.client.from("jobs").select("*").eq("id", id).maybeSingle();

    if (result.error) {
      throw new ApplicationError("JOB_REPOSITORY_ERROR", "Unable to find job by id", { cause: result.error });
    }

    return result.data ? fromJobRow(result.data) : null;
  }

  async findUnparsed(limit = 20): Promise<Job[]> {
    const result = await this.client
      .from("jobs")
      .select("*")
      .is("parsed_at", null)
      .order("discovered_at", { ascending: true })
      .limit(limit);

    if (result.error) {
      throw new ApplicationError("JOB_REPOSITORY_ERROR", "Unable to find unparsed jobs", { cause: result.error });
    }

    return (result.data ?? []).map(fromJobRow);
  }

  async markParsed(jobId: string, parsedAt = new Date().toISOString(), descriptionClean?: string): Promise<void> {
    const result = await this.client
      .from("jobs")
      .update({
        parsed_at: parsedAt,
        ...(descriptionClean ? { description_clean: descriptionClean } : {})
      })
      .eq("id", jobId);

    if (result.error) {
      throw new ApplicationError("JOB_REPOSITORY_ERROR", "Unable to mark job parsed", { cause: result.error });
    }
  }
}

function toJobPayload(job: NewJob): JobPayload {
  return {
    source: job.source,
    title: job.title,
    company: job.company,
    remote_type: job.remoteType,
    description_raw: job.descriptionRaw,
    application_url: job.applicationUrl,
    ats_type: job.atsType,
    discovered_at: job.discoveredAt,
    ...(job.sourceJobId ? { source_job_id: job.sourceJobId } : {}),
    ...(job.location ? { location: job.location } : {}),
    ...(job.salaryRaw ? { salary_raw: job.salaryRaw } : {}),
    ...(job.salaryMin !== undefined ? { salary_min: job.salaryMin } : {}),
    ...(job.salaryMax !== undefined ? { salary_max: job.salaryMax } : {}),
    ...(job.currency ? { currency: job.currency } : {}),
    ...(job.descriptionClean ? { description_clean: job.descriptionClean } : {})
  };
}

function fromJobRow(row: JobRow): Job {
  return {
    id: row.id,
    source: row.source as JobSource,
    title: row.title,
    company: row.company,
    remoteType: (row.remote_type ?? "unknown") as RemoteType,
    descriptionRaw: row.description_raw,
    applicationUrl: row.application_url,
    atsType: (row.ats_type ?? "unknown") as ATSType,
    discoveredAt: row.discovered_at,
    ...(row.source_job_id ? { sourceJobId: row.source_job_id } : {}),
    ...(row.location ? { location: row.location } : {}),
    ...(row.salary_raw ? { salaryRaw: row.salary_raw } : {}),
    ...(row.salary_min !== null ? { salaryMin: row.salary_min } : {}),
    ...(row.salary_max !== null ? { salaryMax: row.salary_max } : {}),
    ...(row.currency ? { currency: row.currency } : {}),
    ...(row.description_clean ? { descriptionClean: row.description_clean } : {}),
    ...(row.parsed_at ? { parsedAt: row.parsed_at } : {})
  };
}
