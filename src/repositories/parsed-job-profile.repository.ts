import type { PostgrestError } from "@supabase/supabase-js";

import { ApplicationError } from "../domain/errors/application-error.js";
import type {
  NewParsedJobProfile,
  ParsedJobCompensation,
  ParsedJobProfile,
  SeniorityLevel
} from "../domain/jobs/parsed-job-profile.types.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type JsonObject = Record<string, unknown>;

export type ParsedJobProfileRow = {
  id: string;
  job_id: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  seniority: string;
  industry: string | null;
  compensation: JsonObject;
  raw_metadata: JsonObject;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
};

type ParsedJobProfilePayload = {
  job_id: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  seniority: SeniorityLevel;
  compensation: ParsedJobCompensation;
  raw_metadata: JsonObject;
  industry?: string;
  embedding?: number[];
};

type SupabaseSingleResult = {
  data: ParsedJobProfileRow | null;
  error: PostgrestError | null;
};

type SupabaseMaybeSingleResult = {
  data: ParsedJobProfileRow | null;
  error: PostgrestError | null;
};

type ParsedJobProfileTableClient = {
  upsert(payload: ParsedJobProfilePayload, options: { onConflict: string }): {
    select(columns: string): {
      single(): Promise<SupabaseSingleResult>;
    };
  };
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): Promise<SupabaseMaybeSingleResult>;
    };
  };
};

export type SupabaseParsedJobProfileClient = {
  from(table: "parsed_job_profiles"): ParsedJobProfileTableClient;
};

export interface ParsedJobProfileRepository {
  upsert(profile: NewParsedJobProfile): Promise<ParsedJobProfile>;
  findByJobId(jobId: string): Promise<ParsedJobProfile | null>;
}

export class SupabaseParsedJobProfileRepository implements ParsedJobProfileRepository {
  constructor(
    private readonly client: SupabaseParsedJobProfileClient = createSupabaseClient() as unknown as SupabaseParsedJobProfileClient
  ) {}

  async upsert(profile: NewParsedJobProfile): Promise<ParsedJobProfile> {
    const result = await this.client
      .from("parsed_job_profiles")
      .upsert(toPayload(profile), { onConflict: "job_id" })
      .select("*")
      .single();

    if (result.error) {
      throw new ApplicationError("PARSED_JOB_PROFILE_REPOSITORY_ERROR", "Unable to upsert parsed job profile", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("PARSED_JOB_PROFILE_REPOSITORY_ERROR", "Parsed profile upsert returned no data");
    }

    return fromRow(result.data);
  }

  async findByJobId(jobId: string): Promise<ParsedJobProfile | null> {
    const result = await this.client
      .from("parsed_job_profiles")
      .select("*")
      .eq("job_id", jobId)
      .maybeSingle();

    if (result.error) {
      throw new ApplicationError("PARSED_JOB_PROFILE_REPOSITORY_ERROR", "Unable to find parsed job profile", {
        cause: result.error
      });
    }

    return result.data ? fromRow(result.data) : null;
  }
}

function toPayload(profile: NewParsedJobProfile): ParsedJobProfilePayload {
  return {
    job_id: profile.jobId,
    responsibilities: profile.responsibilities,
    required_skills: profile.requiredSkills,
    preferred_skills: profile.preferredSkills,
    seniority: profile.seniority,
    compensation: profile.compensation,
    raw_metadata: profile.rawMetadata,
    ...(profile.industry ? { industry: profile.industry } : {}),
    ...(profile.embedding ? { embedding: profile.embedding } : {})
  };
}

function fromRow(row: ParsedJobProfileRow): ParsedJobProfile {
  return {
    jobId: row.job_id,
    responsibilities: row.responsibilities,
    requiredSkills: row.required_skills,
    preferredSkills: row.preferred_skills,
    seniority: row.seniority as SeniorityLevel,
    compensation: row.compensation,
    rawMetadata: row.raw_metadata,
    ...(row.industry ? { industry: row.industry } : {}),
    ...(row.embedding ? { embedding: row.embedding } : {})
  };
}
