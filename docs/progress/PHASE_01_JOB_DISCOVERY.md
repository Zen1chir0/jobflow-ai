# Phase 01 Job Discovery

## Overview

Phase 1 implemented the Job Discovery Service for JobFlow AI.

The purpose of this phase was to establish a deterministic discovery pipeline that can collect job listings, normalize them, deduplicate them, persist them through the repository layer, and expose the workflow through the CLI.

## Objectives

Original Phase 1 goals:

- Crawler interface
- Job repository
- Job normalizer
- Job deduplication logic
- Discovery service
- Discovery use case
- Discovery CLI command
- Phase 1 tests

## Implemented Components

Files created:

```text
src/domain/jobs/job.types.ts
src/services/discovery/crawlers/crawler.interface.ts
src/services/discovery/crawlers/manual.crawler.ts
src/services/discovery/normalizers/job-normalizer.ts
src/services/discovery/deduplicators/job-deduplicator.ts
src/services/discovery/job-discovery.service.ts
src/repositories/job.repository.ts
src/use-cases/discover-jobs.use-case.ts
src/cli/commands/discover.command.ts
tests/unit/services/discovery/job-normalizer.test.ts
tests/unit/services/discovery/job-deduplicator.test.ts
tests/unit/services/discovery/job-discovery.service.test.ts
tests/unit/use-cases/discover-jobs.use-case.test.ts
tests/integration/repositories/job.repository.test.ts
tests/integration/cli-discover.test.ts
docs/progress/PHASE_01_JOB_DISCOVERY.md
```

## Files Modified

Files modified:

```text
tsconfig.json
README.md
src/index.ts
src/cli/index.ts
src/domain/errors/application-error.ts
```

## Architecture Decisions

Decision:
Implement discovery through `CLI -> Use Case -> Service -> Repository -> Supabase`.

Reason:
This preserves the core architecture rule and keeps CLI files limited to argument parsing, invoking the use case, and displaying results.

Decision:
Use `ManualCrawler` as the first concrete crawler.

Reason:
Manual discovery is deterministic, testable, and avoids live scraping or Playwright automation before the project has explicit crawler-specific requirements.

Decision:
Keep parsing-related fields out of Phase 1 behavior.

Reason:
Phase 1 may store raw descriptions and normalized discovery metadata, but skill extraction, salary parsing, embeddings, scoring, and parsed profiles belong to later phases.

Decision:
Use `SupabaseJobRepository` as the only Supabase-facing job persistence layer.

Reason:
Repository rules require Supabase syntax to stay inside `src/repositories/*`; services and CLI code depend on repository methods instead.

Decision:
Switch TypeScript output to Node-compatible ESM imports.

Reason:
The compiled CLI must execute in production. Extensionless ESM imports passed tests but failed when running the built CLI on Windows.

## Testing Summary

Tests added:

```text
tests/unit/services/discovery/job-normalizer.test.ts
tests/unit/services/discovery/job-deduplicator.test.ts
tests/unit/services/discovery/job-discovery.service.test.ts
tests/unit/use-cases/discover-jobs.use-case.test.ts
tests/integration/repositories/job.repository.test.ts
tests/integration/cli-discover.test.ts
```

Test coverage added for:

- Job normalization
- Required job field validation
- Deterministic ATS type inference from application URL
- URL-based deduplication
- Discovery service crawler, normalizer, and deduplicator orchestration
- Unsupported crawler source handling
- Discovery use case repository persistence
- Supabase job repository upsert mapping
- Supabase job repository lookup mapping
- Discover CLI option parsing and output

Test results:

```text
11 test files passed
19 tests passed
```

## Project Metrics

Files Created:
16

Files Modified:
5

Directories Created:
12

Test Files Added:
6

Tests Added:
11

Commands Verified:
5

Documentation Files Updated:
2

## Risks Identified

Risk 1

Description:

```text
The repository tests use a mocked Supabase client rather than a live Supabase test database.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add live Supabase integration tests once database migrations and local test database setup are introduced.
```

---

Risk 2

Description:

```text
Only manual discovery has a concrete crawler implementation in Phase 1.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add source-specific crawlers incrementally after their behavior and test fixtures are defined, keeping each behind the crawler interface.
```

---

Risk 3

Description:

```text
The discover command can only persist jobs when valid Supabase environment variables and a compatible jobs table exist.
```

Impact:

```text
Medium
```

Mitigation:

```text
Introduce database migrations and environment validation documentation before relying on live persistence workflows.
```

## Commands Executed

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js discover --help
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
npm run lint                          PASSED
npm run typecheck                     PASSED
npm test                              PASSED
npm run build                         PASSED
node dist\src\cli\index.js discover --help PASSED
```

## Known Limitations

- No job parsing was implemented.
- No skill extraction was implemented.
- No salary parsing was implemented.
- No embeddings were implemented.
- No match scoring was implemented.
- No resume intelligence was implemented.
- No AI integration was implemented.
- No document generation was implemented.
- No LaTeX rendering was implemented.
- No ATS automation was implemented.
- No lifecycle management was implemented.
- No observability service was implemented.
- No analytics service was implemented.
- No live crawler for RemoteOK, LinkedIn, Wellfound, or company pages was implemented.
- No database migrations were added in this phase.

## Lessons Learned

- A CLI can pass TypeScript checks and still fail after build if ESM import paths are not Node-compatible.
- Windows ESM entrypoint checks require converting `import.meta.url` with `fileURLToPath` before comparing against `process.argv[1]`.
- Manual discovery provides a useful deterministic first crawler without crossing into scraping, parsing, or ATS automation.
- Repository tests can validate Supabase query boundaries without requiring services or CLI code to import Supabase syntax.
- Phase 1 remains cleaner when deduplication is based on normalized application URLs before persistence.

## Next Phase Prerequisites

Before Phase 2 starts:

- User must explicitly approve Phase 2 progression.
- Phase 1 report must be committed to the repository.
- Phase 2 implementation must remain limited to Job Parsing Service scope.
- Phase 2 may add HTML cleaning, skill extraction, salary parsing, seniority extraction, and embeddings.
- Phase 2 must not implement scoring, resume intelligence retrieval, AI generation, rendering, ATS automation, lifecycle, observability service, or analytics.

