import type { ResumeJson } from "../documents/resume-json.types.js";
import type { ResumeTemplate } from "./resume-template.types.js";

export type ResumeArtifactPaths = {
  directory: string;
  resumeJsonPath: string;
  texPath: string;
  pdfPath: string;
  metadataPath: string;
};

export type RenderedResumeMetadata = {
  jobId: string;
  generatedDocumentId: string;
  template: ResumeTemplate;
  compiler: string;
  renderedAt: string;
};

export type NewGeneratedResume = {
  jobId: string;
  generatedDocumentId: string;
  template: ResumeTemplate;
  resumeJson: ResumeJson;
  latexSource: string;
  texPath: string;
  pdfPath: string;
  metadataPath: string;
  compiler: string;
};

export type GeneratedResume = NewGeneratedResume & {
  id: string;
  createdAt: string;
};

