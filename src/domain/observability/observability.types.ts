export type ExecutionLogStatus = "started" | "success" | "failed" | "warning";

export type ExecutionServiceName =
  | "discovery"
  | "parsing"
  | "scoring"
  | "resume_intelligence"
  | "generation"
  | "rendering"
  | "ats"
  | "lifecycle"
  | "observability";

export type ExecutionLog = {
  id: string;
  executionId: string;
  service: ExecutionServiceName;
  step: string;
  status: ExecutionLogStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  jobId?: string;
  applicationId?: string;
  atsType?: string;
  errorMessage?: string;
  errorStack?: string;
};

export type NewExecutionLog = {
  executionId: string;
  service: ExecutionServiceName;
  step: string;
  status: ExecutionLogStatus;
  metadata?: Record<string, unknown>;
  jobId?: string;
  applicationId?: string;
  atsType?: string;
  errorMessage?: string;
  errorStack?: string;
};

export type AutomationCheckpoint = {
  id: string;
  applicationId: string;
  executionId: string;
  atsType: string;
  currentStep: string;
  checkpointData: Record<string, unknown>;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewAutomationCheckpoint = {
  applicationId: string;
  executionId: string;
  atsType: string;
  currentStep: string;
  checkpointData?: Record<string, unknown>;
  isCompleted?: boolean;
};
