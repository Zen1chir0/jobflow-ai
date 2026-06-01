import { describe, expect, it } from "vitest";

import { LatexTemplateRenderer } from "../../../../src/services/resume-rendering/latex-template-renderer.js";
import type { ResumeJson } from "../../../../src/domain/documents/resume-json.types.js";
import type { UserProfile } from "../../../../src/domain/user-profile/user-profile.types.js";
import { buildResumeJson } from "../document-generation/support/document-generation.fixtures.js";

const template = "{{HEADER}}\n{{SUMMARY}}\n{{SKILLS}}\n{{EXPERIENCE}}\n{{PROJECTS}}\n{{EDUCATION}}\n{{CERTIFICATIONS}}";

describe("LatexTemplateRenderer", () => {
  it("renders minimal ResumeJson without optional section exceptions", () => {
    const latex = new LatexTemplateRenderer().render({
      resumeJson: {
        summary: { text: "Built QA automation.", evidenceFragmentIds: ["fragment_1"] },
        skills: [],
        experience: [],
        projects: [],
        education: [],
        certifications: []
      },
      userProfile: buildUserProfile(),
      templateSource: template
    });

    expect(latex).toContain("\\section*{Summary}");
    expect(latex).not.toContain("\\section*{Education}");
    expect(latex).not.toContain("\\section*{Certifications}");
  });

  it("renders complete and dense ResumeJson with escaped content", () => {
    const denseResume: ResumeJson = {
      ...buildResumeJson(),
      summary: { text: "Built QA & automation.\nImproved test coverage.", evidenceFragmentIds: ["fragment_1"] },
      skills: Array.from({ length: 30 }, (_, index) => `Skill_${index + 1}`),
      experience: Array.from({ length: 6 }, (_, index) => ({
        company: "Example & Co",
        role: `QA Engineer ${index + 1}`,
        startDate: "2024-01",
        endDate: "Present",
        highlights: [{ text: "Built Playwright framework.", evidenceFragmentIds: ["fragment_1"] }],
        evidenceFragmentIds: ["fragment_1"]
      })),
      education: [{ institution: "Example University", credential: "BS Computer Science", evidenceFragmentIds: ["fragment_1"] }],
      certifications: [{ name: "Testing Certification", issuer: "Example Co", evidenceFragmentIds: ["fragment_1"] }]
    };

    const latex = new LatexTemplateRenderer().render({
      resumeJson: denseResume,
      userProfile: buildUserProfile(),
      templateSource: template
    });

    expect(latex).toContain("QA \\& automation");
    expect(latex).toContain("Skill\\_30");
    expect(latex).toContain("\\section*{Experience}");
    expect(latex).toContain("\\section*{Education}");
    expect(latex).toContain("\\section*{Certifications}");
  });
});

function buildUserProfile(): UserProfile {
  return {
    id: "user_1",
    fullName: "Kenneth Flororita",
    email: "kenneth@example.test",
    phone: "123",
    location: "Remote",
    linkedinUrl: "https://linkedin.example/kenneth",
    githubUrl: "https://github.example/kenneth",
    portfolioUrl: "https://portfolio.example",
    targetRoles: ["QA Automation Engineer"],
    targetIndustries: ["Technology"],
    verifiedSkills: ["Playwright"],
    preferredRemoteTypes: ["remote"],
    salaryCurrency: "USD",
    baselineSeniority: "mid"
  };
}

