import type { ApplicationState } from "../applications/application.types.js";
import type { ExecutionLogStatus } from "../observability/observability.types.js";

export type AnalyticsApplicationRecord = {
  id: string;
  currentState: ApplicationState;
  atsType?: string;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsApplicationEventRecord = {
  id: string;
  applicationId: string;
  toState: ApplicationState;
  createdAt: string;
  fromState?: ApplicationState;
  eventType?: string;
  executionId?: string;
};

export type AnalyticsExecutionLogRecord = {
  id: string;
  executionId: string;
  service: string;
  step: string;
  status: ExecutionLogStatus;
  createdAt: string;
  atsType?: string;
  applicationId?: string;
  errorMessage?: string;
};

export type AnalyticsCheckpointRecord = {
  id: string;
  applicationId: string;
  executionId: string;
  atsType: string;
  currentStep: string;
  isCompleted: boolean;
  createdAt: string;
};

export type AnalyticsJobRecord = {
  id: string;
  discoveredAt: string;
  parsedAt?: string;
  source?: string;
  atsType?: string;
};

export type AnalyticsParsedJobRecord = {
  id: string;
  jobId: string;
};

export type AnalyticsScoreRecord = {
  id: string;
  jobId: string;
  finalScore: number;
};

export type AnalyticsGeneratedDocumentRecord = {
  id: string;
  jobId: string;
  documentType: string;
  createdAt: string;
};

export type AnalyticsGeneratedResumeRecord = {
  id: string;
  jobId: string;
  template: string;
  createdAt: string;
};

export type ApplicationSummaryViewRecord = {
  applicationId: string;
  title: string;
  company: string;
  source?: string;
  atsType?: string;
  currentState: ApplicationState;
  finalScore?: number;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStateCountViewRecord = {
  currentState: ApplicationState;
  count: number;
};

export type PlatformPerformanceViewRecord = {
  source: string;
  totalApplications: number;
  positiveResponses: number;
  positiveResponseRate: number;
};

export type AnalyticsDataset = {
  applications: AnalyticsApplicationRecord[];
  applicationEvents: AnalyticsApplicationEventRecord[];
  executionLogs: AnalyticsExecutionLogRecord[];
  automationCheckpoints: AnalyticsCheckpointRecord[];
  jobs: AnalyticsJobRecord[];
  parsedJobProfiles: AnalyticsParsedJobRecord[];
  jobMatchScores: AnalyticsScoreRecord[];
  generatedDocuments: AnalyticsGeneratedDocumentRecord[];
  generatedResumes: AnalyticsGeneratedResumeRecord[];
  applicationSummary: ApplicationSummaryViewRecord[];
  applicationStateCounts: ApplicationStateCountViewRecord[];
  platformPerformance: PlatformPerformanceViewRecord[];
};

export type FunnelStepAnalytics = {
  fromState: ApplicationState;
  toState: ApplicationState;
  fromCount: number;
  toCount: number;
  transitionCount: number;
  conversionRate: number;
  dropOffRate: number;
};

export type ApplicationFunnelAnalytics = {
  totalApplications: number;
  steps: FunnelStepAnalytics[];
};

export type LifecycleAnalytics = {
  totalApplications: number;
  stateCounts: Record<string, number>;
  transitionCounts: Record<string, number>;
  hiredCount: number;
  rejectedCount: number;
  withdrawnCount: number;
};

export type ExecutionAnalytics = {
  totalLogRecords: number;
  trackedExecutionCount: number;
  untrackedRecordCount: number;
  successCount: number;
  failureCount: number;
  warningCount: number;
  successRate: number;
  failureRate: number;
  failureCategories: Record<string, number>;
  executionVolumeByService: Record<string, number>;
  coverage: {
    trackedRecords: number;
    untrackedRecords: number;
    unknownCoverage: boolean;
  };
};

export type ATSReliabilityAnalytics = {
  checkpointCount: number;
  completedCheckpointCount: number;
  failureCount: number;
  atsTypeDistribution: Record<string, number>;
  failureCountsByAtsType: Record<string, number>;
};

export type JobPipelineAnalytics = {
  jobsDiscovered: number;
  jobsParsed: number;
  jobsScored: number;
  generatedDocuments: number;
  generatedResumes: number;
  documentsByType: Record<string, number>;
  renderedResumesByTemplate: Record<string, number>;
};

export type PlatformAnalyticsSummary = {
  funnel: ApplicationFunnelAnalytics;
  lifecycle: LifecycleAnalytics;
  executions: ExecutionAnalytics;
  atsReliability: ATSReliabilityAnalytics;
  jobPipeline: JobPipelineAnalytics;
};
