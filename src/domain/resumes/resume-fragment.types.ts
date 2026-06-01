export const RESUME_FRAGMENT_TYPES = [
  "project",
  "work_experience",
  "skill",
  "certification",
  "leadership",
  "education"
] as const;

export type ResumeFragmentType = (typeof RESUME_FRAGMENT_TYPES)[number];

export type ResumeFragment = {
  id: string;
  userProfileId?: string;
  fragmentText: string;
  fragmentType: ResumeFragmentType;
  sourceLabel?: string;
  metadata: Record<string, unknown>;
  embedding: number[];
  similarity?: number;
};

export type NewResumeFragment = {
  userProfileId?: string;
  fragmentText: string;
  fragmentType: ResumeFragmentType;
  sourceLabel?: string;
  metadata: Record<string, unknown>;
  embedding: number[];
};

export type ResumeFragmentInput = {
  userProfileId?: string;
  fragmentText: string;
  fragmentType: ResumeFragmentType;
  sourceLabel?: string;
  metadata?: Record<string, unknown>;
};

export type RetrievedResumeContext = {
  fragments: ResumeFragment[];
  contextText: string;
};
