export type ExtractedSkills = {
  requiredSkills: string[];
  preferredSkills: string[];
};

const KNOWN_SKILLS = [
  "TypeScript",
  "JavaScript",
  "Playwright",
  "Cypress",
  "Selenium",
  "Node.js",
  "React",
  "Next.js",
  "PostgreSQL",
  "Supabase",
  "SQL",
  "GitHub Actions",
  "Docker",
  "n8n",
  "API Testing",
  "REST",
  "GraphQL",
  "CI/CD",
  "Test Automation",
  "QA Automation"
] as const;

export class SkillExtractor {
  extract(input: { requirements: string[]; preferred: string[]; fullText: string }): ExtractedSkills {
    return {
      requiredSkills: findSkills(input.requirements.join("\n") || input.fullText),
      preferredSkills: findSkills(input.preferred.join("\n"))
    };
  }
}

function findSkills(text: string): string[] {
  const matches = new Set<string>();

  for (const skill of KNOWN_SKILLS) {
    if (toSkillPattern(skill).test(text)) {
      matches.add(skill);
    }
  }

  return [...matches].sort((left, right) => left.localeCompare(right));
}

function toSkillPattern(skill: string): RegExp {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\ /g, "\\s+");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
}
