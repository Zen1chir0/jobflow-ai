import { join } from "node:path";

import type { ResumeArtifactPaths } from "../../domain/resumes/rendered-resume.types.js";

export class ArtifactPathBuilder {
  constructor(private readonly storageRoot = "storage/resumes") {}

  build(jobId: string, generatedDocumentId: string): ResumeArtifactPaths {
    const directory = join(this.storageRoot, sanitizePathPart(jobId), sanitizePathPart(generatedDocumentId));

    return {
      directory,
      resumeJsonPath: join(directory, "resume.json"),
      texPath: join(directory, "resume.tex"),
      pdfPath: join(directory, "resume.pdf"),
      metadataPath: join(directory, "metadata.json")
    };
  }
}

function sanitizePathPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

