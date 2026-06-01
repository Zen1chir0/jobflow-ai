import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";

import { ArtifactStorage } from "../../../../src/services/resume-rendering/artifact-storage.js";
import { buildResumeJson } from "../document-generation/support/document-generation.fixtures.js";

let tempDirectory: string | undefined;

describe("ArtifactStorage", () => {
  afterEach(async () => {
    if (tempDirectory) {
      await rm(tempDirectory, { recursive: true, force: true });
      tempDirectory = undefined;
    }
  });

  it("writes resume.json, resume.tex, and metadata.json", async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), "jobflow-render-"));
    const paths = {
      directory: tempDirectory,
      resumeJsonPath: join(tempDirectory, "resume.json"),
      texPath: join(tempDirectory, "resume.tex"),
      pdfPath: join(tempDirectory, "resume.pdf"),
      metadataPath: join(tempDirectory, "metadata.json")
    };

    await new ArtifactStorage().writeArtifacts(paths, buildResumeJson(), "latex", {
      jobId: "job_1",
      generatedDocumentId: "document_1",
      template: "ats",
      compiler: "mock",
      renderedAt: "2026-06-01T00:00:00.000Z"
    });

    expect(await readFile(paths.resumeJsonPath, "utf8")).toContain("Playwright");
    expect(await readFile(paths.texPath, "utf8")).toBe("latex");
    expect(await readFile(paths.metadataPath, "utf8")).toContain("document_1");
  });
});

