export const APPLICATION_STATES = [
  "DISCOVERED",
  "PARSED",
  "SCORED",
  "GENERATED",
  "RENDERED",
  "READY_FOR_APPLICATION",
  "HUMAN_APPROVAL_REQUIRED",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
  "HIRED"
] as const;

export type ApplicationState = (typeof APPLICATION_STATES)[number];

export type ApplicationEventType = "APPLICATION_CREATED" | "STATE_TRANSITION" | "MANUAL_OVERRIDE";

export type Application = {
  id: string;
  jobId: string;
  currentState: ApplicationState;
  selectedResumeId?: string;
  applicationUrl?: string;
  atsType?: string;
  notes?: string;
  lastExecutionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type NewApplication = {
  jobId: string;
  currentState?: ApplicationState;
  selectedResumeId?: string;
  applicationUrl?: string;
  atsType?: string;
  notes?: string;
  executionId?: string;
};

export type ApplicationEvent = {
  id: string;
  applicationId: string;
  fromState?: ApplicationState;
  toState: ApplicationState;
  eventType: ApplicationEventType;
  executionId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type NewApplicationEvent = {
  applicationId: string;
  fromState?: ApplicationState;
  toState: ApplicationState;
  eventType: ApplicationEventType;
  executionId?: string;
  metadata?: Record<string, unknown>;
};

export type ApplicationTimeline = {
  application: Application;
  events: ApplicationEvent[];
  reconstructedState: ApplicationState;
};
