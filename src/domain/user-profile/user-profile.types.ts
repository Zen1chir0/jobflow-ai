import type { RemoteType } from "../jobs/job.types.js";

export type BaselineSeniority = "intern" | "junior" | "mid" | "senior" | "lead";

export type UserProfile = {
  id: string;
  fullName: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  targetRoles: string[];
  targetIndustries: string[];
  verifiedSkills: string[];
  preferredRemoteTypes: RemoteType[];
  minimumSalary?: number;
  salaryCurrency: string;
  baselineSeniority: BaselineSeniority;
};
