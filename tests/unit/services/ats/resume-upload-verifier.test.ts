import { describe, expect, it } from "vitest";

import { ResumeUploadVerifier } from "../../../../src/services/ats/resume-upload-verifier.js";
import { FakeATSPageAdapter } from "./support/fake-ats-page-adapter.js";

describe("ResumeUploadVerifier", () => {
  it("uploads a PDF and verifies the visible filename", async () => {
    const adapter = new FakeATSPageAdapter("<label>Resume</label>", []);
    const verifier = new ResumeUploadVerifier();

    const result = await verifier.uploadAndVerify({
      adapter,
      filePath: "storage/resumes/job_1/resume.pdf",
      candidates: [{ strategy: "label", value: /resume/i }]
    });

    expect(result).toEqual({ uploaded: true, fileName: "resume.pdf" });
    expect(adapter.uploadedFiles).toHaveLength(1);
  });

  it("fails when the uploaded filename cannot be verified", async () => {
    const adapter = new FakeATSPageAdapter("<label>Resume</label>", []);
    adapter.hasVisibleText = () => Promise.resolve(false);
    const verifier = new ResumeUploadVerifier();

    await expect(
      verifier.uploadAndVerify({
        adapter,
        filePath: "storage/resumes/job_1/resume.pdf",
        candidates: [{ strategy: "label", value: /resume/i }]
      })
    ).rejects.toMatchObject({ code: "RESUME_UPLOAD_VERIFICATION_FAILED" });
  });
});
