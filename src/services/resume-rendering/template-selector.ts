import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ApplicationError } from "../../domain/errors/application-error.js";
import { RESUME_TEMPLATES, type ResumeTemplate } from "../../domain/resumes/resume-template.types.js";

export class TemplateSelector {
  constructor(private readonly templates: Partial<Record<ResumeTemplate, string>> = loadDefaultTemplates()) {}

  select(template: ResumeTemplate): string {
    if (!RESUME_TEMPLATES.includes(template)) {
      throw new ApplicationError("RESUME_RENDERING_ERROR", `Unsupported resume template: ${template}`);
    }

    const selected = this.templates[template];

    if (!selected) {
      throw new ApplicationError("RESUME_RENDERING_ERROR", `Resume template not found: ${template}`);
    }

    return selected;
  }
}

function loadDefaultTemplates(): Partial<Record<ResumeTemplate, string>> {
  return {
    ats: readFileSync(join(process.cwd(), "src", "templates", "latex", "ats.tex"), "utf8")
  };
}

