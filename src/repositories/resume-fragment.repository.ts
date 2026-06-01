import type { PostgrestError } from "@supabase/supabase-js";

import { ApplicationError } from "../domain/errors/application-error.js";
import type {
  NewResumeFragment,
  ResumeFragment,
  ResumeFragmentType
} from "../domain/resumes/resume-fragment.types.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type JsonObject = Record<string, unknown>;

export type ResumeFragmentRow = {
  id: string;
  user_profile_id: string | null;
  fragment_text: string;
  fragment_type: string;
  source_label: string | null;
  metadata: JsonObject;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
};

export type MatchedResumeFragmentRow = {
  id: string;
  fragment_text: string;
  fragment_type: string;
  metadata: JsonObject;
  similarity: number;
};

type ResumeFragmentPayload = {
  fragment_text: string;
  fragment_type: ResumeFragmentType;
  metadata: JsonObject;
  embedding: number[];
  user_profile_id?: string;
  source_label?: string;
};

type MatchResumeFragmentsArgs = {
  query_embedding: number[];
  match_threshold: number;
  match_count: number;
};

type SupabaseSingleResult = {
  data: ResumeFragmentRow | null;
  error: PostgrestError | null;
};

type SupabaseListResult = {
  data: ResumeFragmentRow[] | null;
  error: PostgrestError | null;
};

type SupabaseRpcResult = {
  data: MatchedResumeFragmentRow[] | null;
  error: PostgrestError | null;
};

type ResumeFragmentTableClient = {
  insert(payload: ResumeFragmentPayload): {
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

export type SupabaseResumeFragmentClient = {
  from(table: "user_resume_fragments"): ResumeFragmentTableClient;
  rpc(functionName: "match_resume_fragments", args: MatchResumeFragmentsArgs): Promise<SupabaseRpcResult>;
};

export interface ResumeFragmentRepository {
  create(fragment: NewResumeFragment): Promise<ResumeFragment>;
  findByUserProfileId(userProfileId: string): Promise<ResumeFragment[]>;
  matchResumeFragments(queryEmbedding: number[], threshold: number, count: number): Promise<ResumeFragment[]>;
}

export class SupabaseResumeFragmentRepository implements ResumeFragmentRepository {
  constructor(
    private readonly client: SupabaseResumeFragmentClient = createSupabaseClient() as unknown as SupabaseResumeFragmentClient
  ) {}

  async create(fragment: NewResumeFragment): Promise<ResumeFragment> {
    const result = await this.client
      .from("user_resume_fragments")
      .insert(toPayload(fragment))
      .select("*")
      .single();

    if (result.error) {
      throw new ApplicationError("RESUME_FRAGMENT_REPOSITORY_ERROR", "Unable to create resume fragment", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("RESUME_FRAGMENT_REPOSITORY_ERROR", "Resume fragment create returned no data");
    }

    return fromRow(result.data);
  }

  async findByUserProfileId(userProfileId: string): Promise<ResumeFragment[]> {
    const result = await this.client
      .from("user_resume_fragments")
      .select("*")
      .eq("user_profile_id", userProfileId)
      .order("created_at", { ascending: true });

    if (result.error) {
      throw new ApplicationError("RESUME_FRAGMENT_REPOSITORY_ERROR", "Unable to find resume fragments", {
        cause: result.error
      });
    }

    return (result.data ?? []).map(fromRow);
  }

  async matchResumeFragments(queryEmbedding: number[], threshold: number, count: number): Promise<ResumeFragment[]> {
    const result = await this.client.rpc("match_resume_fragments", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: count
    });

    if (result.error) {
      throw new ApplicationError("RESUME_FRAGMENT_REPOSITORY_ERROR", "Unable to match resume fragments", {
        cause: result.error
      });
    }

    return (result.data ?? []).map(fromMatchedRow);
  }
}

function toPayload(fragment: NewResumeFragment): ResumeFragmentPayload {
  return {
    fragment_text: fragment.fragmentText,
    fragment_type: fragment.fragmentType,
    metadata: fragment.metadata,
    embedding: fragment.embedding,
    ...(fragment.userProfileId ? { user_profile_id: fragment.userProfileId } : {}),
    ...(fragment.sourceLabel ? { source_label: fragment.sourceLabel } : {})
  };
}

function fromRow(row: ResumeFragmentRow): ResumeFragment {
  return {
    id: row.id,
    fragmentText: row.fragment_text,
    fragmentType: row.fragment_type as ResumeFragmentType,
    metadata: row.metadata,
    embedding: row.embedding ?? [],
    ...(row.user_profile_id ? { userProfileId: row.user_profile_id } : {}),
    ...(row.source_label ? { sourceLabel: row.source_label } : {})
  };
}

function fromMatchedRow(row: MatchedResumeFragmentRow): ResumeFragment {
  return {
    id: row.id,
    fragmentText: row.fragment_text,
    fragmentType: row.fragment_type as ResumeFragmentType,
    metadata: row.metadata,
    embedding: [],
    similarity: row.similarity
  };
}
