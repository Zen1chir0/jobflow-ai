export type PdfCompileRequest = {
  texPath: string;
  outputDirectory: string;
  expectedPdfPath: string;
};

export type PdfCompileResult = {
  pdfPath: string;
  compiler: string;
};

export interface PdfCompiler {
  readonly name: string;
  compile(request: PdfCompileRequest): Promise<PdfCompileResult>;
}

