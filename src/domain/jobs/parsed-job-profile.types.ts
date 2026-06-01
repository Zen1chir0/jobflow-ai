export const SENIORITY_LEVELS = ["intern", "junior", "mid", "senior", "lead", "unknown"] as const;

export type SeniorityLevel = (typeof SENIORITY_LEVELS)[number];

export type ParsedJobCompensation = {
  min?: number;
  max?: number;
  currency?: string;
  raw?: string;
};

export type ParsedJobProfile = {
  jobId: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  seniority: SeniorityLevel;
  industry?: string;
  compensation: ParsedJobCompensation;
  rawMetadata: Record<string, unknown>;
  embedding?: number[];
};

export type NewParsedJobProfile = ParsedJobProfile;
