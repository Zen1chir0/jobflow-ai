import { describe, expect, it } from "vitest";

import { ArtifactPathBuilder } from "../../../../src/services/resume-rendering/artifact-path-builder.js";

describe("ArtifactPathBuilder", () => {
  it("builds stable artifact paths with sanitized path segments", () => {
    const paths = new ArtifactPathBuilder("storage/resumes").build("job/1", "doc:1");

    expect(paths.directory).toContain("job_1");
    expect(paths.resumeJsonPath).toContain("resume.json");
    expect(paths.texPath).toContain("resume.tex");
    expect(paths.pdfPath).toContain("resume.pdf");
    expect(paths.metadataPath).toContain("metadata.json");
  });
});

