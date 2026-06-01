import { describe, expect, it } from "vitest";

import { LatexmkPdfCompiler } from "../../../src/integrations/pdf/latexmk-pdf-compiler.js";

describe("LatexmkPdfCompiler", () => {
  it("uses latexmk through a mockable process boundary", async () => {
    const calls: Array<{ command: string; args: string[] }> = [];
    const execFile = ((command: string, args: string[], callback: (error: Error | null) => void) => {
      calls.push({ command, args });
      callback(null);
      return {} as never;
    }) as never;
    const compiler = new LatexmkPdfCompiler(execFile);

    const result = await compiler.compile({
      texPath: "storage/resumes/job_1/document_1/resume.tex",
      outputDirectory: "storage/resumes/job_1/document_1",
      expectedPdfPath: "storage/resumes/job_1/document_1/resume.pdf"
    });

    expect(calls[0]?.command).toBe("latexmk");
    expect(calls[0]?.args).toContain("-pdf");
    expect(calls[0]?.args).toContain("-interaction=nonstopmode");
    expect(calls[0]?.args).toContain("-halt-on-error");
    expect(result).toEqual({
      pdfPath: "storage/resumes/job_1/document_1/resume.pdf",
      compiler: "latexmk"
    });
  });
});
