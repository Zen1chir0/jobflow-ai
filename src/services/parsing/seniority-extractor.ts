import type { SeniorityLevel } from "../../domain/jobs/parsed-job-profile.types.js";

const SENIORITY_PATTERNS: Array<{ seniority: SeniorityLevel; pattern: RegExp }> = [
  { seniority: "lead", pattern: /\b(lead|principal|staff|manager)\b/i },
  { seniority: "senior", pattern: /\b(senior|sr\.?)\b/i },
  { seniority: "mid", pattern: /\b(mid|intermediate|2\+ years|3\+ years)\b/i },
  { seniority: "junior", pattern: /\b(junior|jr\.?|entry[- ]level|1\+ years)\b/i },
  { seniority: "intern", pattern: /\b(intern|internship)\b/i }
];

export class SeniorityExtractor {
  extract(text: string): SeniorityLevel {
    return SENIORITY_PATTERNS.find((candidate) => candidate.pattern.test(text))?.seniority ?? "unknown";
  }
}
