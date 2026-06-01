import type { Job } from "../../domain/jobs/job.types.js";
import type { NewParsedJobProfile } from "../../domain/jobs/parsed-job-profile.types.js";
import type { HtmlCleaner } from "./html-cleaner.js";
import type { SalaryParser } from "./salary-parser.js";
import type { SectionExtractor } from "./section-extractor.js";
import type { SeniorityExtractor } from "./seniority-extractor.js";
import type { SkillExtractor } from "./skill-extractor.js";

export class JobParsingService {
  constructor(
    private readonly htmlCleaner: HtmlCleaner,
    private readonly sectionExtractor: SectionExtractor,
    private readonly skillExtractor: SkillExtractor,
    private readonly salaryParser: SalaryParser,
    private readonly seniorityExtractor: SeniorityExtractor
  ) {}

  parse(job: Job): NewParsedJobProfile {
    const descriptionClean = this.htmlCleaner.clean(job.descriptionRaw);
    const sections = this.sectionExtractor.extract(descriptionClean);
    const skills = this.skillExtractor.extract({
      requirements: sections.requirements,
      preferred: sections.preferred,
      fullText: descriptionClean
    });
    const compensation = this.salaryParser.parse(`${job.salaryRaw ?? ""}\n${sections.benefits.join("\n")}`);

    return {
      jobId: job.id,
      responsibilities: sections.responsibilities,
      requiredSkills: skills.requiredSkills,
      preferredSkills: skills.preferredSkills,
      seniority: this.seniorityExtractor.extract(`${job.title}\n${descriptionClean}`),
      compensation,
      rawMetadata: {
        descriptionClean,
        source: job.source,
        applicationUrl: job.applicationUrl
      }
    };
  }
}
