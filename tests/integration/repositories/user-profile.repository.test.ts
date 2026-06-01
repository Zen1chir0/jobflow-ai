import { describe, expect, it } from "vitest";

import {
  SupabaseUserProfileRepository,
  type UserProfileRow
} from "../../../src/repositories/user-profile.repository.js";

describe("SupabaseUserProfileRepository", () => {
  it("loads the oldest user profile as the default scoring profile", async () => {
    const client = createFakeClient({
      id: "user_1",
      full_name: "Kenneth Flororita",
      headline: null,
      email: null,
      phone: null,
      location: "Philippines",
      linkedin_url: null,
      github_url: null,
      portfolio_url: null,
      target_roles: ["QA Automation Engineer"],
      target_industries: ["SaaS"],
      verified_skills: ["Playwright"],
      preferred_remote_types: ["remote"],
      minimum_salary: 80000,
      salary_currency: "PHP",
      baseline_seniority: "mid"
    });
    const repository = new SupabaseUserProfileRepository(client);

    const profile = await repository.findDefault();

    expect(client.lastTable).toBe("user_profile");
    expect(client.lastOrder).toEqual({ column: "created_at", options: { ascending: true } });
    expect(client.lastLimit).toBe(1);
    expect(profile).toEqual(
      expect.objectContaining({
        id: "user_1",
        fullName: "Kenneth Flororita",
        targetIndustries: ["SaaS"],
        verifiedSkills: ["Playwright"],
        preferredRemoteTypes: ["remote"],
        minimumSalary: 80000,
        salaryCurrency: "PHP",
        baselineSeniority: "mid"
      })
    );
  });
});

function createFakeClient(row: UserProfileRow | null) {
  return {
    lastTable: "",
    lastOrder: undefined as unknown,
    lastLimit: 0,
    from(table: "user_profile") {
      this.lastTable = table;

      return {
        select: () => ({
          order: (column: string, options: { ascending: boolean }) => {
            this.lastOrder = { column, options };

            return {
              limit: (count: number) => {
                this.lastLimit = count;

                return {
                  maybeSingle: () =>
                    Promise.resolve({
                      data: row,
                      error: null
                    })
                };
              }
            };
          }
        })
      };
    }
  };
}
