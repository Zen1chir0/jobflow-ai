import type { ResumeJson } from "../../domain/documents/resume-json.types.js";
import type { UserProfile } from "../../domain/user-profile/user-profile.types.js";
import { escapeLatex } from "./latex-escape.js";

type RenderInput = {
  resumeJson: ResumeJson;
  userProfile: UserProfile;
  templateSource: string;
};

export class LatexTemplateRenderer {
  render(input: RenderInput): string {
    return input.templateSource
      .replace("{{HEADER}}", renderHeader(input.userProfile))
      .replace("{{SUMMARY}}", renderSummary(input.resumeJson))
      .replace("{{SKILLS}}", renderSkills(input.resumeJson))
      .replace("{{EXPERIENCE}}", renderExperience(input.resumeJson))
      .replace("{{PROJECTS}}", renderProjects(input.resumeJson))
      .replace("{{EDUCATION}}", renderEducation(input.resumeJson))
      .replace("{{CERTIFICATIONS}}", renderCertifications(input.resumeJson));
  }
}

function renderHeader(profile: UserProfile): string {
  const links = [profile.email, profile.phone, profile.location, profile.linkedinUrl, profile.githubUrl, profile.portfolioUrl]
    .filter((item): item is string => Boolean(item))
    .map(escapeLatex)
    .join(" $\\cdot$ ");

  return [`\\begin{center}`, `{\\LARGE ${escapeLatex(profile.fullName)}}\\\\`, links, `\\end{center}`].join("\n");
}

function renderSummary(resumeJson: ResumeJson): string {
  return renderSection("Summary", escapeLatex(resumeJson.summary.text).replace(/\n+/g, "\\\\\n"));
}

function renderSkills(resumeJson: ResumeJson): string {
  if (resumeJson.skills.length === 0) {
    return "";
  }

  return renderSection("Skills", escapeLatex(resumeJson.skills.join(", ")));
}

function renderExperience(resumeJson: ResumeJson): string {
  if (resumeJson.experience.length === 0) {
    return "";
  }

  const entries = resumeJson.experience
    .map((item) => {
      const dates = [item.startDate, item.endDate].filter(Boolean).join(" -- ");
      return [
        `\\resumeSubheading{${escapeLatex(item.role)}}{${escapeLatex(item.company)}}{${escapeLatex(dates)}}`,
        renderBullets(item.highlights.map((highlight) => highlight.text))
      ].join("\n");
    })
    .join("\n");

  return renderSection("Experience", entries);
}

function renderProjects(resumeJson: ResumeJson): string {
  if (resumeJson.projects.length === 0) {
    return "";
  }

  const entries = resumeJson.projects
    .map((item) =>
      [
        `\\resumeSubheading{${escapeLatex(item.name)}}{${escapeLatex(item.technologies.join(", "))}}{}`,
        escapeLatex(item.description),
        renderBullets(item.highlights.map((highlight) => highlight.text))
      ].join("\n")
    )
    .join("\n");

  return renderSection("Projects", entries);
}

function renderEducation(resumeJson: ResumeJson): string {
  if (resumeJson.education.length === 0) {
    return "";
  }

  return renderSection(
    "Education",
    resumeJson.education
      .map((item) => `\\resumeSubheading{${escapeLatex(item.credential)}}{${escapeLatex(item.institution)}}{}`)
      .join("\n")
  );
}

function renderCertifications(resumeJson: ResumeJson): string {
  if (resumeJson.certifications.length === 0) {
    return "";
  }

  return renderSection(
    "Certifications",
    renderBullets(
      resumeJson.certifications.map((item) =>
        [item.name, item.issuer].filter((value): value is string => Boolean(value)).join(" - ")
      )
    )
  );
}

function renderSection(title: string, body: string): string {
  return [`\\section*{${title}}`, body].join("\n");
}

function renderBullets(items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  return ["\\begin{itemize}", ...items.map((item) => `  \\item ${escapeLatex(item)}`), "\\end{itemize}"].join("\n");
}
