# Phase 02 Job Parsing

## Overview

Phase 2 implemented the deterministic Job Parsing Service for JobFlow AI.

The purpose of this phase was to convert discovered job descriptions into structured parsed job profiles while staying strictly inside parser scope. No scoring, AI generation, resume intelligence retrieval, rendering, ATS automation, lifecycle service, observability service, or analytics work was implemented.

## Objectives

Original Phase 2 goals:

- HTML cleaner
- Skill extraction
- Salary parsing
- Seniority extraction
- Embeddings
- Parse command
- Parser tests
- Extraction tests

User constraint:

- Embeddings may be represented as an optional field or provider interface only.
- Do not call the live LLM or embedding API in Phase 2 unless explicitly approved.
- Keep Phase 2 deterministic and parser-focused.

## Implemented Components

Files created:

```text
src/domain/jobs/parsed-job-profile.types.ts
src/integrations/embeddings/embedding-provider.interface.ts
src/services/parsing/html-cleaner.ts
src/services/parsing/section-extractor.ts
src/services/parsing/skill-extractor.ts
src/services/parsing/salary-parser.ts
src/services/parsing/seniority-extractor.ts
src/services/parsing/job-parsing.service.ts
src/repositories/parsed-job-profile.repository.ts
src/use-cases/parse-job.use-case.ts
src/cli/commands/parse.command.ts
tests/unit/services/parsing/html-cleaner.test.ts
tests/unit/services/parsing/section-extractor.test.ts
tests/unit/services/parsing/skill-extractor.test.ts
tests/unit/services/parsing/salary-parser.test.ts
tests/unit/services/parsing/seniority-extractor.test.ts
tests/unit/services/parsing/job-parsing.service.test.ts
tests/unit/use-cases/parse-job.use-case.test.ts
tests/integration/repositories/parsed-job-profile.repository.test.ts
tests/integration/cli-parse.test.ts
docs/progress/PHASE_02_JOB_PARSING.md
```

## Files Modified

Files modified:

```text
README.md
src/cli/index.ts
src/domain/errors/application-error.ts
src/index.ts
src/repositories/job.repository.ts
tests/integration/repositories/job.repository.test.ts
tests/unit/use-cases/discover-jobs.use-case.test.ts
```

Environment/readiness files from prior approved planning tasks were already modified before Phase 2 began and remain in the working set:

```text
.env.example
docs/ARCHITECTURE.md
docs/REQUIRED_SERVICES_AND_KEYS.md
src/config/env.ts
tests/integration/cli-health.test.ts
tests/unit/config/env.test.ts
tests/unit/integrations/supabase-client.test.ts
```

## Architecture Decisions

Decision:
Keep parsing deterministic.

Reason:
CODEX_MASTER.md requires deterministic before AI. Phase 2 extraction is implemented with deterministic text cleaning, section matching, known-skill matching, salary parsing, and seniority rules.

Decision:
Represent embeddings as an interface only.

Reason:
Phase 2 includes embeddings, but the user explicitly disallowed live LLM or embedding API calls. `EmbeddingProvider` establishes a future boundary without invoking external services.

Decision:
Use a separate parsed job profile repository.

Reason:
Repositories are the only layer allowed to access Supabase. Parsed profile persistence belongs in `src/repositories/parsed-job-profile.repository.ts`, not services or CLI files.

Decision:
Extend `JobRepository` only with parser-safe methods.

Reason:
Phase 2 requires loading unparsed jobs and marking jobs parsed. The methods added are `findUnparsed` and `markParsed`; no scoring or lifecycle transitions were introduced.

Decision:
Keep CLI parsing orchestration-only.

Reason:
The parse command only parses options, invokes `ParseJobUseCase`, and displays results. Business parsing logic remains in services and repositories.

## Testing Summary

Tests added:

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

Test coverage added for:

- HTML cleaning
- Section extraction
- Skill extraction
- Salary parsing
- Seniority extraction
- Job parsing service orchestration
- No live embedding calls during parsing
- Parse use case repository orchestration
- Parsed job profile repository mapping
- Job repository Phase 2 methods
- Parse CLI option parsing and output

Test results:

```text
20 test files passed
34 tests passed
```

## Project Metrics

Files Created:
21

Files Modified:
7

Directories Created:
7

Test Files Added:
9

Tests Added:
13

Commands Verified:
5

Documentation Files Updated:
2

## Risks Identified

Risk 1

Description:

```text
Deterministic skill extraction depends on a static known-skill list and may miss valid skills not yet listed.
```

Impact:

```text
Medium
```

Mitigation:

```text
Expand the known-skill vocabulary through tests and documented additions before scoring relies on extracted skills.
```

---

Risk 2

Description:

```text
Salary parsing is deterministic but intentionally conservative and may not cover every international compensation format.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add salary parser fixtures for new formats before Phase 3 compensation scoring consumes parsed compensation.
```

---

Risk 3

Description:

```text
Embeddings are represented by an interface only, so semantic retrieval is not operational yet.
```

Impact:

```text
Low
```

Mitigation:

```text
Implement provider-agnostic embedding generation in the appropriate future phase after explicit approval.
```

## Commands Executed

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js parse --help
```

## Completion Gate Evidence

Lint:
PASSED

Typecheck:
PASSED

Tests:
PASSED

Build:
PASSED

CLI Smoke Test:
PASSED

Completion gate command results:

```text
npm run lint                      PASSED
npm run typecheck                 PASSED
npm test                          PASSED
npm run build                     PASSED
node dist\src\cli\index.js parse --help PASSED
```

## Known Limitations

- No scoring implementation was added.
- No match scoring formulas were added.
- No resume intelligence retrieval was added.
- No live embedding API calls were made.
- No LLM calls were made.
- No AI document generation was added.
- No LaTeX rendering was added.
- No ATS automation was added.
- No lifecycle service was added.
- No observability service was added.
- No analytics service was added.
- Parsed skill vocabulary is intentionally limited and deterministic.
- Salary parsing is intentionally conservative.

## Lessons Learned

- Parser-focused architecture stays clean when text extraction is separated into small deterministic services.
- Embedding readiness can be represented by an interface without crossing into live provider integration.
- Repository interfaces need to grow with phase scope, but Supabase syntax can remain isolated.
- CLI smoke tests remain valuable because they verify compiled command registration and help output.

## Next Phase Prerequisites

Before Phase 3 starts:

- User must explicitly approve Phase 3 progression.
- Phase 2 report must be committed to the repository.
- Phase 3 must remain limited to Match Scoring Service scope.
- Phase 3 may consume parsed job profiles but must not introduce AI generation.
- Phase 3 must store individual score components and final score, never final score alone.

