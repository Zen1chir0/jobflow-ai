# JobFlow AI Test Plan

This document defines the complete testing plan for the currently implemented JobFlow AI phases.

Implemented scope covered here:

```text
Phase 00 - Foundation
Phase 01 - Job Discovery
Phase 02 - Job Parsing
Phase 03 - Match Scoring
Phase 04 - Resume Intelligence
Phase 05 - Document Generation
Phase 06 - Resume Rendering
```

Future phases are intentionally excluded.

This document must not be used to justify ATS automation, lifecycle, observability service, or analytics work.

## Testing Philosophy

JobFlow AI is built as a stage-gated engineering platform. Testing must prove that each phase is correct, isolated, and ready before the next phase begins.

Core principles:

- Deterministic systems require direct unit tests.
- CLI files are tested for argument parsing and output only.
- Business logic belongs in services and use cases, not CLI tests.
- Repository tests validate database mapping and architectural boundaries.
- Supabase query syntax must stay inside repositories.
- Provider behavior must be mockable.
- Automated tests must not make live LLM or embedding API calls.
- Tests must never use real secrets.
- Tests must never print credentials, API keys, service role keys, or tokens.
- Phase completion gates must pass before approval.

## Test Command Reference

Required project gates:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Compiled CLI help smoke tests:

```bash
node dist\src\cli\index.js --help
node dist\src\cli\index.js discover --help
node dist\src\cli\index.js parse --help
node dist\src\cli\index.js score --help
node dist\src\cli\index.js fragments --help
node dist\src\cli\index.js generate --help
node dist\src\cli\index.js render --help
```

Targeted automated test commands:

```bash
npm test -- tests/unit/config
npm test -- tests/unit/services/discovery
npm test -- tests/unit/services/parsing
npm test -- tests/unit/services/scoring
npm test -- tests/unit/services/resume-intelligence
npm test -- tests/unit/services/document-generation
npm test -- tests/unit/services/resume-rendering
npm test -- tests/integration/repositories
npm test -- tests/integration/cli-discover.test.ts tests/integration/cli-parse.test.ts tests/integration/cli-score.test.ts tests/integration/cli-fragments.test.ts tests/integration/cli-generate.test.ts tests/integration/cli-render.test.ts
```

## Test Layers

Unit tests:

- Validate pure functions, services, domain rules, and use-case orchestration.
- Use fake repositories, fake providers, and deterministic input fixtures.
- Must not access Supabase, the filesystem, or live providers.

Integration tests:

- Validate repository mapping and CLI command behavior.
- Use mocked Supabase clients for repository tests.
- Use mocked use cases for CLI tests.
- Must not perform live database writes unless explicitly requested.

CLI smoke tests:

- Validate compiled command availability.
- Use `--help` unless a specific live functional test is explicitly requested.
- Must not expose secrets.

Manual functional tests:

- May use the hosted Supabase project after schema readiness.
- May use real `.env` credentials locally.
- Must never commit `.env` or paste secrets into logs, reports, screenshots, or issues.

## Phase-by-Phase Test Plan

### Phase 00 - Foundation

Automated coverage:

- Environment loading defaults
- Required environment validation
- Invalid environment rejection
- Stable application error codes
- Structured logger behavior
- Silent logging behavior
- Supabase client shell creation
- CLI health smoke behavior

Representative tests:

```text
tests/unit/config/env.test.ts
tests/unit/domain/application-error.test.ts
tests/unit/integrations/supabase-client.test.ts
tests/unit/utils/logger.test.ts
tests/integration/cli-health.test.ts
```

Manual smoke command:

```bash
node dist\src\cli\index.js health
```

Expected result:

```text
JobFlow AI ready (development)
```

### Phase 01 - Job Discovery

Automated coverage:

- Job normalization
- Required job field validation
- ATS type inference from application URL
- URL-based deduplication
- Discovery service orchestration
- Unsupported crawler source handling
- Discovery use case persistence flow
- Supabase job repository mapping
- Discover CLI option parsing and output

Representative tests:

```text
tests/unit/services/discovery/job-normalizer.test.ts
tests/unit/services/discovery/job-deduplicator.test.ts
tests/unit/services/discovery/job-discovery.service.test.ts
tests/unit/use-cases/discover-jobs.use-case.test.ts
tests/integration/repositories/job.repository.test.ts
tests/integration/cli-discover.test.ts
```

Manual functional command:

```bash
node dist\src\cli\index.js discover --source manual --title "QA Automation Engineer" --company "Example Co" --url "https://example.com/jobs/qa-automation" --description "Responsibilities: Build automated tests. Requirements: TypeScript and Playwright." --location "Remote"
```

Expected checks:

- A job row is created or updated in `jobs`.
- Duplicate URL submissions do not create duplicate rows.
- CLI output does not expose secrets.

### Phase 02 - Job Parsing

Automated coverage:

- HTML cleaning
- Section extraction
- Skill extraction
- Salary parsing
- Seniority extraction
- Job parsing service orchestration
- Parsed job profile repository mapping
- Parse use case orchestration
- Parse CLI option parsing and output
- Embedding interface exists without live provider calls

Representative tests:

```text
tests/unit/services/parsing/html-cleaner.test.ts
tests/unit/services/parsing/section-extractor.test.ts
tests/unit/services/parsing/skill-extractor.test.ts
tests/unit/services/parsing/salary-parser.test.ts
tests/unit/services/parsing/seniority-extractor.test.ts
tests/unit/services/parsing/job-parsing.service.test.ts
tests/unit/use-cases/parse-job.use-case.test.ts
tests/integration/repositories/parsed-job-profile.repository.test.ts
tests/integration/cli-parse.test.ts
```

Manual functional commands:

```bash
node dist\src\cli\index.js parse --job-id <job_id>
node dist\src\cli\index.js parse --all --limit 5
```

Expected checks:

- A parsed profile row exists in `parsed_job_profiles`.
- The related `jobs.parsed_at` value is populated.
- No live embedding provider call is required by automated tests.

### Phase 03 - Match Scoring

Automated coverage:

- Required skill intersection scoring
- Empty required skills behavior
- Experience/seniority lookup table
- Unknown seniority handling
- Direct industry matching
- Remote preference matching
- Compensation threshold scoring
- Currency mismatch handling
- Weighted final score formula
- Score use case orchestration
- Job match score repository mapping
- User profile repository mapping
- Score CLI option parsing and output

Representative tests:

```text
tests/unit/services/scoring/skill-match.scorer.test.ts
tests/unit/services/scoring/experience-match.scorer.test.ts
tests/unit/services/scoring/industry-match.scorer.test.ts
tests/unit/services/scoring/location-match.scorer.test.ts
tests/unit/services/scoring/compensation-match.scorer.test.ts
tests/unit/services/scoring/match-scoring.service.test.ts
tests/unit/use-cases/score-job.use-case.test.ts
tests/integration/repositories/job-match-score.repository.test.ts
tests/integration/repositories/user-profile.repository.test.ts
tests/integration/cli-score.test.ts
```

Manual functional command:

```bash
node dist\src\cli\index.js score --job-id <job_id>
```

Expected checks:

- A score row exists in `job_match_scores`.
- Individual score components and `final_score` are stored.
- The weighted score formula is preserved.
- The command does not perform parsing, generation, rendering, ATS automation, lifecycle, observability, or analytics work.

### Phase 04 - Resume Intelligence

Automated coverage:

- Atomic resume fragment normalization
- Fragment type validation
- Embedding dimension validation
- Existing parsed job embedding reuse
- Job text embedding fallback
- Default retrieval `topK=5`
- Default similarity threshold `0.72`
- Prompt context deduplication
- Prompt context ordering
- Resume intelligence service orchestration
- OpenAI-compatible provider configuration
- No live API calls in tests
- Resume fragment repository insert mapping
- `match_resume_fragments` RPC mapping
- Create fragment use case orchestration
- Retrieve context use case orchestration
- `fragments add` CLI parsing and output
- `fragments context` CLI parsing and output

Representative tests:

```text
tests/unit/integrations/openai-compatible-embedding-provider.test.ts
tests/unit/services/resume-intelligence/resume-fragmenter.test.ts
tests/unit/services/resume-intelligence/resume-retriever.test.ts
tests/unit/services/resume-intelligence/prompt-context-builder.test.ts
tests/unit/services/resume-intelligence/resume-intelligence.service.test.ts
tests/unit/use-cases/create-resume-fragment.use-case.test.ts
tests/unit/use-cases/retrieve-resume-context.use-case.test.ts
tests/integration/repositories/resume-fragment.repository.test.ts
tests/integration/cli-fragments.test.ts
```

Manual functional commands:

```bash
node dist\src\cli\index.js fragments add --type project --text "Built a Playwright automation framework for regression testing." --source-label "Example Project"
node dist\src\cli\index.js fragments context --job-id <job_id>
node dist\src\cli\index.js fragments context --job-id <job_id> --top-k 3 --threshold 0.8
```

Expected checks:

- Fragment rows are stored in `user_resume_fragments`.
- Retrieval goes through `match_resume_fragments`.
- Output contains context only.
- No resume JSON, cover letter, recruiter message, PDF, ATS action, lifecycle transition, observability service, or analytics output is produced.

Provider caveat:

- The configured provider/model must support embeddings for live fragment creation.
- Automated tests use fake providers and do not make live API calls.

### Phase 05 - Document Generation

Automated coverage:

- OpenAI-compatible generation provider configuration
- No live generation provider calls in tests
- Resume JSON prompt construction
- Cover letter prompt construction
- Recruiter message prompt construction
- Screening response prompt construction
- Schema validation for all generated artifact types
- Hallucination prevention for unsupported generated claims
- Output normalization for provider JSON objects
- Document generation service orchestration
- Generated document repository insert mapping
- Generate document use case orchestration
- `generate resume` CLI parsing and output
- `generate cover-letter` CLI parsing and output
- `generate recruiter-message` CLI parsing and output
- `generate screening-response` CLI parsing and output

Representative tests:

```text
tests/unit/integrations/openai-compatible-generation-provider.test.ts
tests/unit/services/document-generation/prompt-builders.test.ts
tests/unit/services/document-generation/validators.test.ts
tests/unit/services/document-generation/hallucination-guard.test.ts
tests/unit/services/document-generation/document-generation.service.test.ts
tests/unit/use-cases/generate-document.use-case.test.ts
tests/integration/repositories/generated-document.repository.test.ts
tests/integration/cli-generate.test.ts
```

Manual functional commands:

```bash
node dist\src\cli\index.js generate resume --job-id <job_id>
node dist\src\cli\index.js generate cover-letter --job-id <job_id>
node dist\src\cli\index.js generate recruiter-message --job-id <job_id>
node dist\src\cli\index.js generate screening-response --job-id <job_id> --question "Why are you a fit for this role?"
```

Expected checks:

- Rows are stored in `generated_documents`.
- `document_type` is one of `resume_json`, `cover_letter`, `recruiter_message`, or `screening_response`.
- `context_fragments` references retrieved Phase 4 fragment ids.
- Generated content is structured JSON only.
- Unsupported claims are rejected before persistence.
- No LaTeX rendering, PDF generation, ATS automation, lifecycle, observability service, analytics, or application submission is performed.

### Phase 06 - Resume Rendering

Automated coverage:

- Minimal ResumeJson rendering
- Complete ResumeJson rendering
- Dense ResumeJson rendering
- Empty education and certifications rendering
- Long skills list rendering
- Long experience list rendering
- Multi-paragraph summary rendering
- LaTeX escaping
- Template selection
- Artifact path generation
- Artifact storage
- PDF compiler wrapper behavior
- Generated resume repository mapping
- Render resume use case orchestration
- `render` CLI parsing and output

Representative tests:

```text
tests/unit/services/resume-rendering/latex-escape.test.ts
tests/unit/services/resume-rendering/template-selector.test.ts
tests/unit/services/resume-rendering/latex-template-renderer.test.ts
tests/unit/services/resume-rendering/artifact-path-builder.test.ts
tests/unit/services/resume-rendering/artifact-storage.test.ts
tests/unit/services/resume-rendering/resume-rendering.service.test.ts
tests/unit/integrations/latexmk-pdf-compiler.test.ts
tests/unit/use-cases/render-resume.use-case.test.ts
tests/integration/repositories/generated-resume.repository.test.ts
tests/integration/cli-render.test.ts
```

Manual functional command:

```bash
node dist\src\cli\index.js render --document-id <generated_resume_json_document_id> --template ats
```

Expected checks:

- Local artifacts are written under ignored `storage/resumes/`.
- `resume.json`, `resume.tex`, `resume.pdf`, and `metadata.json` are the expected artifact set.
- A row is stored in `generated_resumes`.
- Rendering consumes stored ResumeJson and user profile header fields only.
- No content generation, ATS automation, lifecycle, observability service, analytics, or application submission is performed.

## Unit Test Inventory

Foundation:

```text
tests/unit/config/env.test.ts
tests/unit/domain/application-error.test.ts
tests/unit/integrations/supabase-client.test.ts
tests/unit/utils/logger.test.ts
```

Discovery:

```text
tests/unit/services/discovery/job-normalizer.test.ts
tests/unit/services/discovery/job-deduplicator.test.ts
tests/unit/services/discovery/job-discovery.service.test.ts
tests/unit/use-cases/discover-jobs.use-case.test.ts
```

Parsing:

```text
tests/unit/services/parsing/html-cleaner.test.ts
tests/unit/services/parsing/section-extractor.test.ts
tests/unit/services/parsing/skill-extractor.test.ts
tests/unit/services/parsing/salary-parser.test.ts
tests/unit/services/parsing/seniority-extractor.test.ts
tests/unit/services/parsing/job-parsing.service.test.ts
tests/unit/use-cases/parse-job.use-case.test.ts
```

Scoring:

```text
tests/unit/services/scoring/skill-match.scorer.test.ts
tests/unit/services/scoring/experience-match.scorer.test.ts
tests/unit/services/scoring/industry-match.scorer.test.ts
tests/unit/services/scoring/location-match.scorer.test.ts
tests/unit/services/scoring/compensation-match.scorer.test.ts
tests/unit/services/scoring/match-scoring.service.test.ts
tests/unit/use-cases/score-job.use-case.test.ts
```

Resume intelligence:

```text
tests/unit/integrations/openai-compatible-embedding-provider.test.ts
tests/unit/services/resume-intelligence/resume-fragmenter.test.ts
tests/unit/services/resume-intelligence/resume-retriever.test.ts
tests/unit/services/resume-intelligence/prompt-context-builder.test.ts
tests/unit/services/resume-intelligence/resume-intelligence.service.test.ts
tests/unit/use-cases/create-resume-fragment.use-case.test.ts
tests/unit/use-cases/retrieve-resume-context.use-case.test.ts
```

Document generation:

```text
tests/unit/integrations/openai-compatible-generation-provider.test.ts
tests/unit/services/document-generation/prompt-builders.test.ts
tests/unit/services/document-generation/validators.test.ts
tests/unit/services/document-generation/hallucination-guard.test.ts
tests/unit/services/document-generation/document-generation.service.test.ts
tests/unit/use-cases/generate-document.use-case.test.ts
```

Resume rendering:

```text
tests/unit/services/resume-rendering/latex-escape.test.ts
tests/unit/services/resume-rendering/template-selector.test.ts
tests/unit/services/resume-rendering/latex-template-renderer.test.ts
tests/unit/services/resume-rendering/artifact-path-builder.test.ts
tests/unit/services/resume-rendering/artifact-storage.test.ts
tests/unit/services/resume-rendering/resume-rendering.service.test.ts
tests/unit/integrations/latexmk-pdf-compiler.test.ts
tests/unit/use-cases/render-resume.use-case.test.ts
```

## Integration Test Inventory

Repository integration tests with mocked Supabase clients:

```text
tests/integration/repositories/job.repository.test.ts
tests/integration/repositories/parsed-job-profile.repository.test.ts
tests/integration/repositories/job-match-score.repository.test.ts
tests/integration/repositories/user-profile.repository.test.ts
tests/integration/repositories/resume-fragment.repository.test.ts
tests/integration/repositories/generated-document.repository.test.ts
tests/integration/repositories/generated-resume.repository.test.ts
```

CLI integration tests with mocked use cases:

```text
tests/integration/cli-health.test.ts
tests/integration/cli-discover.test.ts
tests/integration/cli-parse.test.ts
tests/integration/cli-score.test.ts
tests/integration/cli-fragments.test.ts
tests/integration/cli-generate.test.ts
tests/integration/cli-render.test.ts
```

## CLI Smoke Test Inventory

Compiled command availability:

```bash
node dist\src\cli\index.js --help
node dist\src\cli\index.js discover --help
node dist\src\cli\index.js parse --help
node dist\src\cli\index.js score --help
node dist\src\cli\index.js fragments --help
node dist\src\cli\index.js generate --help
node dist\src\cli\index.js render --help
```

Manual functional command inventory:

```bash
node dist\src\cli\index.js health
node dist\src\cli\index.js discover --source manual --title "QA Automation Engineer" --company "Example Co" --url "https://example.com/jobs/qa-automation" --description "Responsibilities: Build automated tests."
node dist\src\cli\index.js parse --job-id <job_id>
node dist\src\cli\index.js parse --all --limit 5
node dist\src\cli\index.js score --job-id <job_id>
node dist\src\cli\index.js fragments add --type project --text "Built a Playwright automation framework." --source-label "Example Project"
node dist\src\cli\index.js fragments context --job-id <job_id>
node dist\src\cli\index.js generate resume --job-id <job_id>
node dist\src\cli\index.js generate cover-letter --job-id <job_id>
node dist\src\cli\index.js generate recruiter-message --job-id <job_id>
node dist\src\cli\index.js generate screening-response --job-id <job_id> --question "Why are you a fit for this role?"
node dist\src\cli\index.js render --document-id <generated_resume_json_document_id> --template ats
```

## Mocking Strategy

Mock repositories when testing use cases:

- Use cases should prove orchestration.
- They should not depend on Supabase client chains.

Mock use cases when testing CLI commands:

- CLI tests should validate option parsing and display output.
- CLI tests should not assert service formulas or repository behavior.

Mock embedding providers:

- Resume intelligence service tests must inject fake `EmbeddingProvider` implementations.
- Provider tests may mock `fetch`.
- No automated test may call a live embedding endpoint.

Mock generation providers:

- Document generation service tests must inject fake `GenerationProvider` implementations.
- Provider tests may mock `fetch`.
- No automated test may call a live chat completion endpoint.
- Generated content fixtures must use fake, evidence-backed data only.

Mock PDF compilers:

- Resume rendering service tests must inject fake `PdfCompiler` implementations.
- Compiler wrapper tests must mock process execution.
- Automated tests must not require a local LaTeX installation.
- Generated artifact fixtures must stay under temporary directories or ignored storage paths.

Mock Supabase clients in repository tests:

- Repository tests should verify table names, payload shape, filters, upserts, inserts, updates, and RPC arguments.
- Repository tests should not require hosted Supabase connectivity.

## Supabase Testing Strategy

Automated Supabase tests:

- Use mocked Supabase clients.
- Validate repository mapping and architectural boundaries.
- Do not perform live writes.
- Do not rely on hosted schema state.

Manual Supabase tests:

- May be run only when explicitly intended by the developer.
- Require `.env` credentials and applied database schema.
- Must use repository-backed CLI commands.
- Must not query Supabase from services, CLI files, or tests outside repository boundaries.

Tables covered by current tests:

```text
jobs
parsed_job_profiles
user_profile
job_match_scores
user_resume_fragments
generated_documents
generated_resumes
```

RPC covered by current tests:

```text
match_resume_fragments()
```

## LLM / Embedding / Generation Provider Testing Strategy

Automated tests:

- Must not make live API calls.
- Must not require a real `LLM_API_KEY`.
- Must use fake embedding providers or mocked `fetch`.
- Must use fake generation providers or mocked `fetch`.
- Must not print provider headers, API keys, or raw credential objects.

Provider configuration tests:

- Verify `LLM_BASE_URL` is used.
- Verify `LLM_MODEL` is used.
- Verify the provider is OpenAI-compatible without hardcoding OpenAI or ASI endpoints.
- Verify provider behavior remains swappable behind `EmbeddingProvider`.
- Verify generation behavior remains swappable behind `GenerationProvider`.

Known provider limitation:

- The current configured ASI/OpenAI-compatible model may not support embeddings.
- Live fragment creation requires an embedding-capable provider/model.
- If a provider does not support `/embeddings`, the boundary should fail safely and without exposing secrets.

## Security Test Rules

Never commit:

```text
.env
storage/playwright-state
screenshots
pdf artifacts
api keys
cookies
service role keys
```

Test data rules:

- Use fake placeholder secrets only.
- Do not use real API keys in fixtures.
- Do not snapshot environment objects.
- Do not print `SUPABASE_SERVICE_ROLE_KEY`.
- Do not print `LLM_API_KEY`.
- Do not print authorization headers.
- Do not include real provider responses that expose account metadata.
- Do not commit generated resume artifacts.

CLI output rules:

- Health output may show environment name only.
- Commands may show ids, counts, scores, and context text.
- Commands must not show credentials or full config objects.

## Regression Testing Checklist

Run before requesting phase approval:

```text
npm run lint
npm run typecheck
npm test
npm run build
```

Run compiled CLI smoke tests after build:

```text
node dist\src\cli\index.js --help
node dist\src\cli\index.js discover --help
node dist\src\cli\index.js parse --help
node dist\src\cli\index.js score --help
node dist\src\cli\index.js fragments --help
node dist\src\cli\index.js generate --help
node dist\src\cli\index.js render --help
```

Review checklist:

- No future-phase behavior was introduced.
- No live API calls were added to automated tests.
- No real secrets were added to tests or docs.
- Repository boundaries remain intact.
- CLI files contain no business logic.
- Deterministic services have direct unit tests.
- Repository mapping tests still pass.
- Phase report exists for completed phases.
- Known limitations are documented.
- No `git push` was run by Codex.

## Pre-Phase-Approval Checklist

Before approving any phase:

- The phase scope matches `CODEX_MASTER.md`.
- The implementation follows `CLI -> Use Case -> Service -> Repository -> Database / Integration`.
- Unit tests cover deterministic behavior.
- Integration tests cover repository and CLI boundaries.
- Lint passes.
- Typecheck passes.
- Tests pass.
- Build passes.
- CLI smoke tests pass when a CLI command exists.
- Documentation is updated.
- Phase report is generated under `docs/progress/`.
- Phase report contains every Section 28 required section.
- Phase report is committed locally before marking the phase complete.
- The next phase has not started automatically.

Phase 5 must not begin until the user explicitly approves it.
