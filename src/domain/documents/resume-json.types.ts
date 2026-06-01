export type EvidenceBackedText = {
  text: string;
  evidenceFragmentIds: string[];
};

export type ResumeJsonExperience = {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  highlights: EvidenceBackedText[];
  evidenceFragmentIds: string[];
};

export type ResumeJsonProject = {
  name: string;
  description: string;
  technologies: string[];
  highlights: EvidenceBackedText[];
  evidenceFragmentIds: string[];
};

export type ResumeJsonEducation = {
  institution: string;
  credential: string;
  evidenceFragmentIds: string[];
};

export type ResumeJsonCertification = {
  name: string;
  issuer?: string;
  evidenceFragmentIds: string[];
};

export type ResumeJson = {
  summary: EvidenceBackedText;
  skills: string[];
  experience: ResumeJsonExperience[];
  projects: ResumeJsonProject[];
  education: ResumeJsonEducation[];
  certifications: ResumeJsonCertification[];
};

