import type { ATSDetectionInput, ATSType } from "../../domain/ats/ats.types.js";

const ATS_SIGNATURES: ReadonlyArray<{
  type: ATSType;
  patterns: readonly RegExp[];
}> = [
  {
    type: "greenhouse",
    patterns: [/greenhouse\.io/i, /boards\.greenhouse\.io/i, /job_application/i]
  },
  {
    type: "lever",
    patterns: [/jobs\.lever\.co/i, /\blever\b/i]
  },
  {
    type: "workday",
    patterns: [/myworkdayjobs\.com/i, /wd\d+\.myworkdaysite\.com/i, /\bworkday\b/i]
  }
];

export class ATSTypeDetector {
  detect(input: ATSDetectionInput): ATSType {
    const haystack = [input.url, input.pageText, input.html].filter(Boolean).join("\n");

    for (const signature of ATS_SIGNATURES) {
      if (signature.patterns.some((pattern) => pattern.test(haystack))) {
        return signature.type;
      }
    }

    return "generic";
  }
}
