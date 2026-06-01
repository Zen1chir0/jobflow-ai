import { mkdir, writeFile } from "node:fs/promises";

import type { ResumeJson } from "../../domain/documents/resume-json.types.js";
import type { RenderedResumeMetadata, ResumeArtifactPaths } from "../../domain/resumes/rendered-resume.types.js";

export class ArtifactStorage {
  async writeArtifacts(
    paths: ResumeArtifactPaths,
    resumeJson: ResumeJson,
    latexSource: string,
    metadata: RenderedResumeMetadata
  ): Promise<void> {
    await mkdir(paths.directory, { recursive: true });
    await Promise.all([
      writeFile(paths.resumeJsonPath, `${JSON.stringify(resumeJson, null, 2)}\n`, "utf8"),
      writeFile(paths.texPath, latexSource, "utf8"),
      writeFile(paths.metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8")
    ]);
  }
}

