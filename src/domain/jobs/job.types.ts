export const JOB_SOURCES = ["manual", "remoteok", "linkedin", "wellfound", "company_page"] as const;

export const REMOTE_TYPES = ["remote", "hybrid", "onsite", "unknown"] as const;

export const ATS_TYPES = ["greenhouse", "lever", "workday", "generic", "unknown"] as const;

export type JobSource = (typeof JOB_SOURCES)[number];

export type RemoteType = (typeof REMOTE_TYPES)[number];

export type ATSType = (typeof ATS_TYPES)[number];

export type Job = {
  id: string;
  source: JobSource;
  sourceJobId?: string;
  title: string;
  company: string;
  location?: string;
  remoteType: RemoteType;
  salaryRaw?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  descriptionRaw: string;
  descriptionClean?: string;
  applicationUrl: string;
  atsType: ATSType;
  discoveredAt: string;
  parsedAt?: string;
};

export type NewJob = Omit<Job, "id" | "parsedAt"> & {
  id?: string;
  parsedAt?: string;
};
