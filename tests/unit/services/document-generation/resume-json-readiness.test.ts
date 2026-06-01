import { describe, expect, it, vi } from "vitest";

import type { ResumeJson } from "../../../../src/domain/documents/resume-json.types.js";
import { DocumentGenerationService } from "../../../../src/services/document-generation/document-generation.service.js";
import { validateResumeJson } from "../../../../src/services/document-generation/validators/resume-json.validator.js";
import { buildGenerationInput, buildResumeJson } from "./support/document-generation.fixtures.js";

describe("ResumeJson renderer readiness", () => {
  it("accepts a minimal ResumeJson with required sections and empty arrays", () => {
    const resume = validateResumeJson({
      resumeJson: {
        summary: { text: "Built Playwright framework.", evidenceFragmentIds: ["fragment_1"] },
        skills: [],
        experience: [],
        projects: [],
        education: [],
        certifications: []
      }
    });

    expect(Object.keys(resume)).toEqual(["summary", "skills", "experience", "projects", "education", "certifications"]);
  });

  it("accepts a complete ResumeJson and normalizes away arbitrary provider fields", () => {
    const resume = validateResumeJson({
      resumeJson: {
        ...buildCompleteResumeJson(),
        providerNotes: "should not leak into renderer contract"
      }
    });

    expect(resume.experience[0]).toEqual(
      expect.objectContaining({
        company: "Example Co",
        startDate: "2024-01",
        endDate: "Present"
      })
    );
    expect("providerNotes" in resume).toBe(false);
  });

  it("rejects missing required sections and inconsistent dates", () => {
    expect(() =>
      validateResumeJson({
        resumeJson: {
          summary: { text: "Built Playwright framework.", evidenceFragmentIds: ["fragment_1"] },
          skills: [],
          experience: [],
          projects: [],
          education: []
        }
      })
    ).toThrow("ResumeJson education and certifications must be arrays");

    expect(() =>
      validateResumeJson({
        resumeJson: {
          ...buildCompleteResumeJson(),
          experience: [{ ...buildCompleteResumeJson().experience[0], startDate: "January 2024" }]
        }
      })
    ).toThrow("ResumeJson experience dates must use YYYY-MM or Present");
  });

  it("accepts rendering edge cases without schema-specific exceptions", () => {
    const resume = validateResumeJson({
      resumeJson: {
        ...buildCompleteResumeJson(),
        summary: {
          text: "Built Playwright framework.\nLed QA automation improvements.",
          evidenceFragmentIds: ["fragment_1"]
        },
        skills: Array.from({ length: 40 }, (_, index) => `Skill ${index + 1}`),
        experience: Array.from({ length: 8 }, (_, index) => ({
          ...buildCompleteResumeJson().experience[0],
          role: `QA Automation Engineer ${index + 1}`
        })),
        projects: Array.from({ length: 5 }, (_, index) => ({
          ...buildCompleteResumeJson().projects[0],
          name: `Playwright framework ${index + 1}`
        })),
        education: [],
        certifications: []
      }
    });

    expect(resume.skills).toHaveLength(40);
    expect(resume.experience).toHaveLength(8);
    expect(resume.projects).toHaveLength(5);
    expect(resume.education).toEqual([]);
    expect(resume.certifications).toEqual([]);
  });

  it("returns stable structure across repeated generation outputs", async () => {
    const provider = {
      generateStructured: vi
        .fn()
        .mockResolvedValueOnce({ content: { resumeJson: buildResumeJson() }, provider: "fake", model: "model" })
        .mockResolvedValueOnce({ content: { resumeJson: buildResumeJson() }, provider: "fake", model: "model" })
    };
    const service = new DocumentGenerationService(provider);

    const first = await service.generate("resume_json", buildGenerationInput());
    const second = await service.generate("resume_json", buildGenerationInput());

    expect(Object.keys(first.content)).toEqual(Object.keys(second.content));
    expect(first.contextFragmentIds).toEqual(["fragment_1"]);
    expect(second.contextFragmentIds).toEqual(["fragment_1"]);
  });

  it("fails before persistence-facing output when hallucination guard rejects a ResumeJson claim", async () => {
    const provider = {
      generateStructured: vi.fn().mockResolvedValue({
        content: {
          resumeJson: {
            ...buildResumeJson(),
            projects: [
              {
                name: "Unsupported Kubernetes Migration",
                description: "Reduced latency by 99%",
                technologies: ["Kubernetes"],
                highlights: [{ text: "Reduced latency by 99%", evidenceFragmentIds: ["fragment_1"] }],
                evidenceFragmentIds: ["fragment_1"]
              }
            ]
          }
        },
        provider: "fake",
        model: "model"
      })
    };
    const service = new DocumentGenerationService(provider);

    await expect(service.generate("resume_json", buildGenerationInput())).rejects.toThrow("Unsupported generated claim");
  });
});

function buildCompleteResumeJson(): ResumeJson {
  return {
    summary: { text: "Built Playwright framework for QA automation.", evidenceFragmentIds: ["fragment_1"] },
    skills: ["Playwright", "TypeScript"],
    experience: [
      {
        company: "Example Co",
        role: "QA Automation Engineer",
        startDate: "2024-01",
        endDate: "Present",
        highlights: [{ text: "Built Playwright framework.", evidenceFragmentIds: ["fragment_1"] }],
        evidenceFragmentIds: ["fragment_1"]
      }
    ],
    projects: [
      {
        name: "Playwright framework",
        description: "Built Playwright framework.",
        technologies: ["Playwright", "TypeScript"],
        highlights: [{ text: "Built Playwright framework.", evidenceFragmentIds: ["fragment_1"] }],
        evidenceFragmentIds: ["fragment_1"]
      }
    ],
    education: [
      {
        institution: "Example University",
        credential: "BS Computer Science",
        evidenceFragmentIds: ["fragment_1"]
      }
    ],
    certifications: [
      {
        name: "Playwright Certification",
        issuer: "Example Co",
        evidenceFragmentIds: ["fragment_1"]
      }
    ]
  };
}

