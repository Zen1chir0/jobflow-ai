# JobFlow AI

## Architecture Document

Version: 1.0

Author: Kenneth Flororita

Status: Planning

---

# 1. Architecture Overview

JobFlow AI is a CLI-first TypeScript application that orchestrates job discovery, job parsing, resume intelligence, LaTeX rendering, ATS autofill, lifecycle tracking, observability, and analytics.

The system is intentionally modular.

Each major capability must live in its own service layer.

The CLI should not contain business logic.

The CLI only receives user commands and delegates execution to application services.

---

# 2. Core Architecture Rule

Do not build this as one large script.

Every workflow should follow this structure:

```text
CLI Command
↓
Use Case / Application Service
↓
Domain Service
↓
Repository / Integration
↓
Database / External System
```

Example:

```text
jobflow discover
↓
DiscoverJobsUseCase
↓
JobDiscoveryService
↓
LinkedInCrawler / RemoteOKCrawler
↓
JobRepository
↓
Supabase
```

---

# 3. Recommended Folder Structure

```text
jobflow-ai/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── ATS_STRATEGIES.md
│   ├── RESUME_INTELLIGENCE.md
│   └── DECISIONS/
│
├── src/
│   ├── cli/
│   │   ├── index.ts
│   │   └── commands/
│   │       ├── discover.command.ts
│   │       ├── parse.command.ts
│   │       ├── score.command.ts
│   │       ├── generate.command.ts
│   │       ├── render.command.ts
│   │       ├── apply.command.ts
│   │       └── analytics.command.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── domain/
│   │   ├── jobs/
│   │   │   ├── job.types.ts
│   │   │   └── job.entity.ts
│   │   ├── applications/
│   │   │   ├── application.types.ts
│   │   │   └── application-state-machine.ts
│   │   ├── resumes/
│   │   │   ├── resume.types.ts
│   │   │   └── resume-fragment.types.ts
│   │   └── scoring/
│   │       └── scoring.types.ts
│   │
│   ├── use-cases/
│   │   ├── discover-jobs.use-case.ts
│   │   ├── parse-job.use-case.ts
│   │   ├── score-job.use-case.ts
│   │   ├── generate-resume.use-case.ts
│   │   ├── render-resume.use-case.ts
│   │   ├── autofill-application.use-case.ts
│   │   └── show-analytics.use-case.ts
│   │
│   ├── services/
│   │   ├── discovery/
│   │   │   ├── job-discovery.service.ts
│   │   │   ├── crawlers/
│   │   │   │   ├── crawler.interface.ts
│   │   │   │   ├── linkedin.crawler.ts
│   │   │   │   ├── remoteok.crawler.ts
│   │   │   │   └── company-page.crawler.ts
│   │   │   └── normalizers/
│   │   │       └── job-normalizer.ts
│   │   │
│   │   ├── parsing/
│   │   │   ├── job-parsing.service.ts
│   │   │   ├── html-cleaner.ts
│   │   │   ├── section-extractor.ts
│   │   │   └── job-metadata-extractor.ts
│   │   │
│   │   ├── scoring/
│   │   │   ├── match-scoring.service.ts
│   │   │   ├── skill-match.scorer.ts
│   │   │   ├── experience-match.scorer.ts
│   │   │   ├── industry-match.scorer.ts
│   │   │   ├── location-match.scorer.ts
│   │   │   └── compensation-match.scorer.ts
│   │   │
│   │   ├── resume-intelligence/
│   │   │   ├── resume-intelligence.service.ts
│   │   │   ├── resume-fragmenter.ts
│   │   │   ├── resume-retriever.ts
│   │   │   └── prompt-context-builder.ts
│   │   │
│   │   ├── document-generation/
│   │   │   ├── document-generation.service.ts
│   │   │   ├── resume-json-generator.ts
│   │   │   ├── cover-letter-generator.ts
│   │   │   └── recruiter-message-generator.ts
│   │   │
│   │   ├── resume-rendering/
│   │   │   ├── resume-rendering.service.ts
│   │   │   ├── latex-template-renderer.ts
│   │   │   ├── pdf-compiler.ts
│   │   │   └── artifact-storage.ts
│   │   │
│   │   ├── ats/
│   │   │   ├── ats-automation.service.ts
│   │   │   ├── ats-strategy.interface.ts
│   │   │   ├── ats-strategy-registry.ts
│   │   │   ├── strategies/
│   │   │   │   ├── greenhouse.strategy.ts
│   │   │   │   ├── lever.strategy.ts
│   │   │   │   ├── workday.strategy.ts
│   │   │   │   └── generic.strategy.ts
│   │   │   ├── locators/
│   │   │   │   ├── semantic-locator.service.ts
│   │   │   │   └── field-resolver.ts
│   │   │   └── session/
│   │   │       └── playwright-session.service.ts
│   │   │
│   │   ├── lifecycle/
│   │   │   ├── lifecycle.service.ts
│   │   │   └── state-transition.validator.ts
│   │   │
│   │   ├── observability/
│   │   │   ├── observability.service.ts
│   │   │   └── execution-logger.ts
│   │   │
│   │   └── analytics/
│   │       └── analytics.service.ts
│   │
│   ├── repositories/
│   │   ├── job.repository.ts
│   │   ├── application.repository.ts
│   │   ├── application-event.repository.ts
│   │   ├── resume-fragment.repository.ts
│   │   ├── generated-document.repository.ts
│   │   ├── generated-resume.repository.ts
│   │   └── observability.repository.ts
│   │
│   ├── integrations/
│   │   ├── supabase/
│   │   │   └── supabase.client.ts
│   │   ├── ai/
│   │   │   ├── ai-client.interface.ts
│   │   │   ├── openai.client.ts
│   │   │   └── claude.client.ts
│   │   └── embeddings/
│   │       └── embedding.client.ts
│   │
│   ├── templates/
│   │   └── latex/
│   │       ├── ats.tex
│   │       ├── compact.tex
│   │       ├── modern.tex
│   │       └── technical.tex
│   │
│   ├── utils/
│   │   ├── id.ts
│   │   ├── logger.ts
│   │   ├── fs.ts
│   │   └── text.ts
│   │
│   └── index.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── storage/
│   ├── resumes/
│   ├── latex/
│   ├── pdf/
│   ├── screenshots/
│   └── playwright-state/
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# 4. CLI Design

The CLI is the main user interface for the MVP.

Use `commander`.

Example commands:

```bash
jobflow discover --source remoteok --query "qa automation"
jobflow parse --job-id <job_id>
jobflow score --job-id <job_id>
jobflow generate --job-id <job_id>
jobflow render --resume-id <resume_id> --template ats
jobflow apply --job-id <job_id>
jobflow analytics
```

---

# 5. CLI Command Responsibilities

## discover

Discovers jobs from supported sources.

Should:

* run crawler
* normalize job records
* deduplicate jobs
* store jobs in Supabase

Should not:

* parse resume
* generate documents
* autofill forms

---

## parse

Parses one job or all unparsed jobs.

Should:

* clean raw HTML
* extract sections
* extract skills
* extract salary
* extract seniority
* generate job embedding
* update parsed job metadata

---

## score

Scores a job deterministically.

Should:

* load parsed job
* load user profile preferences
* compute scoring components
* store score breakdown

---

## generate

Generates application documents.

Should:

* retrieve relevant resume fragments
* build prompt context
* call AI client
* output structured resume JSON
* generate cover letter draft
* store generated documents

---

## render

Renders resume JSON into PDF.

Should:

* load generated resume JSON
* select LaTeX template
* render `.tex`
* compile `.pdf`
* store artifacts

---

## apply

Runs ATS autofill.

Should:

* load job
* load generated resume PDF
* detect ATS
* select strategy
* fill fields
* upload resume
* stop before final submission
* require human review

---

## analytics

Shows job search performance metrics.

Should:

* count applications by state
* calculate response rate
* calculate interview rate
* show platform performance
* show score distribution

---

# 6. Domain Types

## Job

```ts
export type Job = {
  id: string;
  source: JobSource;
  sourceJobId?: string;
  title: string;
  company: string;
  location?: string;
  remoteType?: "remote" | "hybrid" | "onsite" | "unknown";
  salaryRaw?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  descriptionRaw: string;
  descriptionClean?: string;
  applicationUrl: string;
  atsType?: ATSType;
  discoveredAt: string;
  parsedAt?: string;
};
```

---

## ParsedJobProfile

```ts
export type ParsedJobProfile = {
  jobId: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  seniority: "intern" | "junior" | "mid" | "senior" | "lead" | "unknown";
  industry?: string;
  compensation?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  embedding?: number[];
};
```

---

## ResumeFragment

```ts
export type ResumeFragment = {
  id: string;
  fragmentText: string;
  fragmentType:
    | "project"
    | "work_experience"
    | "skill"
    | "certification"
    | "leadership"
    | "education";
  embedding: number[];
  metadata: Record<string, unknown>;
};
```

---

## MatchScore

```ts
export type MatchScore = {
  jobId: string;
  skillMatch: number;
  experienceMatch: number;
  industryMatch: number;
  locationMatch: number;
  compensationMatch: number;
  finalScore: number;
};
```

---

## ResumeJson

```ts
export type ResumeJson = {
  name: string;
  headline: string;
  contact: {
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    location?: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    description: string;
    techStack: string[];
    bullets: string[];
  }[];
  education?: {
    school: string;
    degree: string;
    dates?: string;
  }[];
};
```

---

## ApplicationState

```ts
export type ApplicationState =
  | "DISCOVERED"
  | "ANALYZED"
  | "READY_TO_APPLY"
  | "AUTOFILL_STARTED"
  | "AUTOFILL_COMPLETED"
  | "SUBMITTED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN"
  | "GHOSTED";
```

---

# 7. Repository Pattern

Repositories are the only layer allowed to directly query Supabase.

Services must not contain raw SQL or Supabase query chains.

Example:

```ts
export interface JobRepository {
  upsert(job: Job): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findUnparsed(limit?: number): Promise<Job[]>;
  markParsed(jobId: string): Promise<void>;
}
```

---

# 8. Use Case Pattern

Use cases orchestrate multiple services.

Example:

```ts
export class GenerateResumeUseCase {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly resumeIntelligenceService: ResumeIntelligenceService,
    private readonly documentGenerationService: DocumentGenerationService,
    private readonly generatedDocumentRepository: GeneratedDocumentRepository
  ) {}

  async execute(jobId: string) {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    const fragments =
      await this.resumeIntelligenceService.retrieveRelevantFragments(job);

    const resumeJson =
      await this.documentGenerationService.generateResumeJson(job, fragments);

    return this.generatedDocumentRepository.saveResumeJson(job.id, resumeJson);
  }
}
```

---

# 9. ATS Strategy Pattern

All ATS-specific behavior must be isolated behind a common interface.

ATS automation is implemented through four approved subphases:

```text
Phase 7A - ATS Automation Foundation
Phase 7B - Greenhouse / Lever / Generic Strategies
Phase 7C - Workday State Machine
Phase 7D - ATS Reliability Hardening
```

Phase 7A establishes the strategy interface, registry, semantic locator layer, submit guard, path validation, and mock fixture structure. It must not perform live ATS automation.

Phase 7B implements Greenhouse, Lever, and conservative Generic strategies against local mock fixtures only. It must always stop at the human approval boundary and must not implement Workday.

Phase 7C implements Workday state-machine behavior against mock multi-step fixtures. Workday must not be treated as a flat form.

Phase 7D hardens failure capture, screenshot paths, session storage paths, checkpoint recovery, retry policy, and upload verification. It must not introduce lifecycle, observability, analytics, or final submission.

Required automation flow:

```text
CLI
Use Case
ATSAutomationService
ATSStrategyRegistry
Resolved ATSStrategy
Semantic Locator / Session / File Upload / Checkpoint helpers
Human Approval Required
```

```ts
export interface ATSStrategy {
  type: ATSType;

  detect(url: string, page: Page): Promise<boolean>;

  initialize(page: Page): Promise<void>;

  fillPersonalInfo(data: ApplicantProfile): Promise<void>;

  uploadResume(filePath: string): Promise<void>;

  answerScreeningQuestions(
    answers: ScreeningAnswer[]
  ): Promise<void>;

  pauseForHumanReview(): Promise<void>;
}
```

Supported strategies:

```text
GreenhouseStrategy
LeverStrategy
WorkdayStrategy
GenericStrategy
```

---

# 10. ATS Strategy Registry

The registry selects the correct strategy.

```ts
export class ATSStrategyRegistry {
  constructor(private readonly strategies: ATSStrategy[]) {}

  async resolve(url: string, page: Page): Promise<ATSStrategy> {
    for (const strategy of this.strategies) {
      const matched = await strategy.detect(url, page);

      if (matched) {
        return strategy;
      }
    }

    return new GenericStrategy();
  }
}
```

---

# 11. Semantic Locator Layer

Do not rely on brittle CSS selectors as the first option.

Locator resolution priority:

1. ARIA role
2. Accessible label
3. Associated text
4. Placeholder
5. Data attributes
6. CSS fallback

Example:

```ts
await page.getByRole("textbox", { name: /first name/i }).fill(firstName);
```

Fallback:

```ts
await page.locator('input[name*="first_name"]').fill(firstName);
```

---

# 12. Workday State Machine

Workday must not be handled as a simple form.

Workday requires stateful navigation.

Example states:

```text
LOGIN_REQUIRED
↓
PERSONAL_INFO
↓
EXPERIENCE
↓
DOCUMENT_UPLOAD
↓
SCREENING_QUESTIONS
↓
REVIEW
↓
HUMAN_APPROVAL_REQUIRED
```

Each state must:

* wait for page readiness
* resolve visible fields
* process current block
* persist checkpoint
* advance only after verification

---

# 13. Resume Intelligence Architecture

Do not send the entire master resume into the LLM.

Use vector retrieval.

Pipeline:

```text
Parsed Job Requirements
↓
Embedding Client
↓
pgvector Similarity Search
↓
Top N Resume Fragments
↓
Prompt Context Builder
↓
AI Client
```

Default:

```text
topN = 5
similarityThreshold = 0.72
```

---

# 14. Resume Rendering Architecture

# 14A. Provider-Agnostic LLM Architecture

LLM integrations must be provider-agnostic.

Business logic must never know whether the underlying provider is:

```text
OpenAI
ASI Cloud
OpenRouter
Anthropic
Future Provider
```

All future generation workflows should depend on an `LLMProvider` interface, not directly on a vendor SDK.

Recommended flow:

```text
LLMProvider Interface
↓
OpenAICompatibleProvider
↓
DocumentGenerationService
```

OpenAI-compatible providers may use the OpenAI SDK interface with custom configuration:

```ts
const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL
});
```

Example provider configuration:

```text
Provider: ASI Cloud
Base URL: https://inference.asicloud.cudos.org/v1
Model: openai/gpt-oss-120b
```

Required future environment variables:

```text
LLM_PROVIDER
LLM_BASE_URL
LLM_API_KEY
LLM_MODEL
```

Rules:

1. Do not hardcode OpenAI endpoints.
2. Model selection must be configurable.
3. Base URL must be configurable.
4. API key must be configurable.
5. Future providers must be swappable without changing business logic.
6. Provider implementations are responsible for translating configuration into the correct SDK client.

This architecture must not be implemented before the appropriate LLM-related phase.

---

LLM output must be structured JSON.

The LaTeX renderer owns formatting.

Pipeline:

```text
ResumeJson
↓
Handlebars / Mustache / EJS
↓
resume.tex
↓
latexmk
↓
resume.pdf
```

Required artifacts:

```text
resume.json
resume.tex
resume.pdf
metadata.json
```

---

# 15. Lifecycle Architecture

Applications must use a strict state machine.

Do not update state casually.

All state transitions must be validated.

Example valid transition:

```text
DISCOVERED → ANALYZED
```

Example invalid transition:

```text
DISCOVERED → INTERVIEW
```

unless manually overridden with metadata.

---

# 16. Observability Architecture

Every major execution must have an `execution_id`.

Use the same `execution_id` across:

* crawler logs
* parser logs
* scoring logs
* AI generation logs
* rendering logs
* ATS logs
* lifecycle events

Example:

```json
{
  "execution_id": "exec_123",
  "service": "ats",
  "step": "upload_resume",
  "status": "failed",
  "error": "file_input_not_found"
}
```

---

# 17. Testing Strategy

## Unit Tests

Test:

* scoring formula
* state transitions
* salary parser
* skill matcher
* normalizers

---

## Integration Tests

Test:

* Supabase repositories
* AI client mock
* resume rendering
* crawler output normalization

---

## E2E Tests

Test:

* CLI commands
* discovery to database
* resume generation to PDF
* ATS strategy with mock HTML pages

---

# 18. Development Order

Build in this order:

1. Project setup
2. CLI scaffold
3. Supabase client
4. Domain types
5. Repositories
6. Job discovery
7. Job parsing
8. Match scoring
9. Resume fragments
10. Resume retrieval
11. Document generation
12. LaTeX rendering
13. Phase 7A - ATS automation foundation
14. Phase 7B - Greenhouse / Lever / Generic strategies
15. Phase 7C - Workday state machine
16. Phase 7D - ATS reliability hardening
17. Lifecycle service
18. Observability service
19. Analytics service

---

# 19. Non-Negotiables

Codex must follow these constraints:

1. Do not put business logic inside CLI command files.
2. Do not directly query Supabase outside repositories.
3. Do not let AI generate final PDFs.
4. Do not auto-submit job applications.
5. Do not use CSS selectors as the first locator strategy.
6. Do not build frontend in MVP.
7. Do not collapse ATS strategies into one giant file.
8. Do not send full resume context into every LLM call.
9. Do not update application state without event logging.
10. Do not skip tests for scoring and state transitions.

---

# 20. MVP Target

The MVP is complete when the user can run:

```bash
jobflow discover --source remoteok --query "qa automation"
jobflow parse --all
jobflow score --all
jobflow generate --job-id <job_id>
jobflow render --resume-id <resume_id> --template ats
jobflow apply --job-id <job_id>
jobflow analytics
```

and the system can:

* discover jobs
* parse them
* rank them
* generate tailored resume JSON
* render LaTeX PDF resumes
* scaffold ATS automation safely through Phase 7A
* autofill Greenhouse, Lever, and conservative Generic applications through Phase 7B
* handle Workday through a state-machine strategy in Phase 7C
* recover from ATS automation failures through Phase 7D
* stop before submission
* track lifecycle state
* log failures
* show analytics
