export type ATSType = "greenhouse" | "lever" | "workday" | "generic";

export type ATSDetectionInput = {
  url: string;
  pageText?: string;
  html?: string;
};

export type ApplicantProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
};

export type ScreeningAnswer = {
  question: string;
  answer: string;
};

export type ATSAutomationStatus = "FOUNDATION_READY" | "HUMAN_APPROVAL_REQUIRED";

export type ATSAutomationPlan = {
  jobId: string;
  atsType: ATSType;
  resumePdfPath: string;
  status: ATSAutomationStatus;
  requiresHumanApproval: boolean;
  message: string;
};
