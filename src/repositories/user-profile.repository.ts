import type { PostgrestError } from "@supabase/supabase-js";

import { ApplicationError } from "../domain/errors/application-error.js";
import type { RemoteType } from "../domain/jobs/job.types.js";
import type { BaselineSeniority, UserProfile } from "../domain/user-profile/user-profile.types.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

export type UserProfileRow = {
  id: string;
  full_name: string;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  target_roles: string[];
  target_industries: string[];
  verified_skills: string[];
  preferred_remote_types: string[];
  minimum_salary: number | null;
  salary_currency: string;
  baseline_seniority: string;
};

type SupabaseMaybeSingleResult = {
  data: UserProfileRow | null;
  error: PostgrestError | null;
};

type UserProfileTableClient = {
  select(columns: string): {
    order(column: string, options: { ascending: boolean }): {
      limit(count: number): {
        maybeSingle(): Promise<SupabaseMaybeSingleResult>;
      };
    };
  };
};

export type SupabaseUserProfileClient = {
  from(table: "user_profile"): UserProfileTableClient;
};

export interface UserProfileRepository {
  findDefault(): Promise<UserProfile | null>;
}

export class SupabaseUserProfileRepository implements UserProfileRepository {
  constructor(
    private readonly client: SupabaseUserProfileClient = createSupabaseClient() as unknown as SupabaseUserProfileClient
  ) {}

  async findDefault(): Promise<UserProfile | null> {
    const result = await this.client
      .from("user_profile")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      throw new ApplicationError("USER_PROFILE_REPOSITORY_ERROR", "Unable to find default user profile", {
        cause: result.error
      });
    }

    return result.data ? fromRow(result.data) : null;
  }
}

function fromRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    targetRoles: row.target_roles,
    targetIndustries: row.target_industries,
    verifiedSkills: row.verified_skills,
    preferredRemoteTypes: row.preferred_remote_types as RemoteType[],
    salaryCurrency: row.salary_currency,
    baselineSeniority: row.baseline_seniority as BaselineSeniority,
    ...(row.headline ? { headline: row.headline } : {}),
    ...(row.email ? { email: row.email } : {}),
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.location ? { location: row.location } : {}),
    ...(row.linkedin_url ? { linkedinUrl: row.linkedin_url } : {}),
    ...(row.github_url ? { githubUrl: row.github_url } : {}),
    ...(row.portfolio_url ? { portfolioUrl: row.portfolio_url } : {}),
    ...(row.minimum_salary !== null ? { minimumSalary: row.minimum_salary } : {})
  };
}
