import { execFile } from "node:child_process";

import { ApplicationError } from "../../domain/errors/application-error.js";
import type { PdfCompiler, PdfCompileRequest, PdfCompileResult } from "./pdf-compiler.interface.js";

type ExecFileLike = typeof execFile;

export class LatexmkPdfCompiler implements PdfCompiler {
  readonly name = "latexmk";

  constructor(private readonly execFileImpl: ExecFileLike = execFile) {}

  async compile(request: PdfCompileRequest): Promise<PdfCompileResult> {
    await new Promise<void>((resolve, reject) => {
      this.execFileImpl(
        "latexmk",
        ["-pdf", "-interaction=nonstopmode", "-halt-on-error", "-outdir", request.outputDirectory, request.texPath],
        (error) => {
          if (error) {
            reject(
              new ApplicationError("PDF_COMPILER_ERROR", "LaTeX PDF compilation failed", {
                cause: error
              })
            );
            return;
          }

          resolve();
        }
      );
    });

    return {
      pdfPath: request.expectedPdfPath,
      compiler: this.name
    };
  }
}

