export const RESUME_TEMPLATES = ["ats"] as const;

export type ResumeTemplate = (typeof RESUME_TEMPLATES)[number];

