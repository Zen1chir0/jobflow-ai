export type JobSections = {
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  benefits: string[];
};

type SectionKey = keyof JobSections;

const SECTION_PATTERNS: Array<{ key: SectionKey; pattern: RegExp }> = [
  { key: "responsibilities", pattern: /^(responsibilities|what you'?ll do|role|duties)$/i },
  { key: "requirements", pattern: /^(requirements|qualifications|what you bring|required skills)$/i },
  { key: "preferred", pattern: /^(preferred|nice to have|bonus|preferred qualifications)$/i },
  { key: "benefits", pattern: /^(benefits|compensation|perks)$/i }
];

export class SectionExtractor {
  extract(cleanText: string): JobSections {
    const sections: JobSections = {
      responsibilities: [],
      requirements: [],
      preferred: [],
      benefits: []
    };
    let activeSection: SectionKey | undefined;

    for (const line of toLines(cleanText)) {
      const heading = resolveHeading(line);

      if (heading) {
        activeSection = heading;
        continue;
      }

      if (activeSection) {
        sections[activeSection].push(stripListMarker(line));
      }
    }

    return sections;
  }
}

function toLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveHeading(line: string): SectionKey | undefined {
  const normalized = stripListMarker(line).replace(/:$/, "");
  return SECTION_PATTERNS.find((candidate) => candidate.pattern.test(normalized))?.key;
}

function stripListMarker(line: string): string {
  return line.replace(/^[-*\u2022]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
}
