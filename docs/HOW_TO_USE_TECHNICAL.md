# How To Use JobFlow AI - Technical Guide

This guide explains how engineers, maintainers, open source contributors, and technical reviewers can operate and evaluate JobFlow AI.

For setup, see `docs/INSTALLATION.md`.

For environment rules, see `docs/ENVIRONMENT_SETUP.md`.

For the architecture map, see `docs/ARCHITECTURE_MAP.md`.

For the full architecture guide, see `docs/ARCHITECTURE.md`.

## System Overview

JobFlow AI is a TypeScript CLI application organized around this dependency flow:

```text
CLI
Use Cases
Services
Repositories
Supabase / Integrations
```

The system is deterministic-first. AI/provider usage exists behind explicit provider boundaries and should not leak into CLI, domain, or repository concerns.

The default OSS review path is local, deterministic, and mock-first.

Current validation status:

```text
Stage 1 Validation: PASS
Stage 2 Validation: PASS
Stage 3 Production Readiness: NO-GO
```

Stage 3 is a `NO-GO` for Production SaaS readiness, not OSS readiness.

## Architecture Entry Points

Important source areas:

```text
src/cli
src/use-cases
src/services
src/repositories
src/domain
src/integrations
src/templates
src/utils
```

Layer expectations:

| Layer | Responsibility |
| --- | --- |
| CLI | Parse args, construct dependencies, call use cases, render safe output |
| Use Cases | Coordinate application workflows |
| Services | Own deterministic business logic and orchestration |
| Repositories | Own persistence mapping and Supabase query syntax |
| Domain | Define pure types, schemas, validators, and state machines |
| Integrations | Isolate Supabase clients, provider adapters, rendering, and ATS boundaries |

Do not put business logic in CLI files.

Do not put Supabase query syntax outside repositories or approved integration boundaries.

Do not bypass ATS safety boundaries.

## CLI Commands

After installing dependencies and building:

```bash
npm ci
npm run build
node dist/src/cli/index.js --help
```

Implemented command groups:

```text
discover
parse
score
fragments
generate
render
apply
lifecycle
observability
analytics
```

Useful help commands:

```bash
node dist/src/cli/index.js discover --help
node dist/src/cli/index.js parse --help
node dist/src/cli/index.js score --help
node dist/src/cli/index.js fragments --help
node dist/src/cli/index.js generate --help
node dist/src/cli/index.js render --help
node dist/src/cli/index.js apply --help
node dist/src/cli/index.js lifecycle --help
node dist/src/cli/index.js observability --help
node dist/src/cli/index.js analytics --help
```

## Typical Technical Workflow

A typical technical flow connects the subsystems in this order:

```text
Discovery
Parsing
Scoring
Resume Intelligence
Document Generation
Rendering
ATS Preparation
Lifecycle
Observability
Analytics
```

### Discovery

Discovery normalizes and persists job opportunities.

Expected input:

```text
Job source data or manually supplied job details.
```

Expected output:

```text
Normalized job records.
```

### Parsing

Parsing turns raw job descriptions into structured job profiles using deterministic services.

Expected input:

```text
Raw or normalized job description content.
```

Expected output:

```text
Parsed responsibilities, required skills, preferred skills, seniority, industry, compensation, and metadata.
```

### Scoring

Scoring computes transparent job-match values.

Expected input:

```text
Parsed job profile and user profile data.
```

Expected output:

```text
Skill, experience, industry, location, compensation, and final match scores.
```

### Resume Intelligence

Resume intelligence stores and retrieves resume fragments and prepares prompt context.

Expected input:

```text
User profile data, resume fragments, and job context.
```

Expected output:

```text
Relevant resume fragments and structured prompt context.
```

### Document Generation

Document generation creates structured application documents through provider boundaries.

Expected input:

```text
Job context, selected resume fragments, and generation request type.
```

Expected output:

```text
Resume JSON, cover letter content, recruiter message content, or screening responses.
```

Provider behavior should remain mock-first for automated tests.

### Rendering

Rendering converts validated ResumeJson into local rendering artifacts and metadata.

Expected input:

```text
ResumeJson and template selection.
```

Expected output:

```text
LaTeX source, PDF path metadata, JSON artifact metadata, and local artifact paths.
```

Full PDF compilation can require optional local LaTeX tooling outside the mocked automated tests.

### ATS Preparation

ATS preparation detects ATS type, resolves strategy behavior, and records checkpointable automation state.

Expected input:

```text
Application URL, ATS type, application data, and strategy context.
```

Expected output:

```text
Prepared application data and reliability checkpoints.
```

The workflow must stop before final submission.

## Lifecycle Integration

The approved lifecycle states are:

```text
DISCOVERED
PARSED
SCORED
GENERATED
RENDERED
READY_FOR_APPLICATION
HUMAN_APPROVAL_REQUIRED
APPLIED
INTERVIEWING
OFFER
REJECTED
WITHDRAWN
HIRED
```

Lifecycle responsibilities:

- Validate state transitions.
- Persist application state.
- Create application events.
- Reconstruct timelines.

The `HUMAN_APPROVAL_REQUIRED` state is a safety boundary. It must not be bypassed by automated final submission behavior.

## Observability Integration

Observability records execution history and recovery context.

Primary concepts:

```text
execution_logs
automation_checkpoints
execution_id
```

Expected observability behavior:

- Record workflow start, success, warning, and failure events.
- Preserve execution ID continuity where supported.
- Sanitize errors and metadata before logging.
- Store checkpoints for ATS reliability workflows.

Known limitation:

```text
Execution ID propagation is not universal across all historical workflows yet.
```

## Analytics Integration

Analytics is read-only.

Analytics areas:

- Funnel analytics.
- Lifecycle analytics.
- Execution analytics.
- ATS reliability analytics.
- Job pipeline analytics.
- Document generation analytics.

Expected behavior:

- Read from repositories and database views.
- Compute summaries through services/calculators.
- Render safe CLI output.
- Avoid writing application records.

## ATS Safety Model

The ATS model is intentionally constrained.

Rules:

- No final ATS submission automation exists.
- Human approval remains mandatory.
- Automated tests use mocks and fixtures.
- Live ATS websites are not part of automated validation.
- Browser session files and screenshots must remain ignored.
- Strategies must not bypass the submit guard.

This is a core product boundary, not a missing feature.

## Environment Requirements

Default OSS review requires:

```text
Node.js
npm
repository checkout
```

Recommended:

```text
Node.js 22
```

Local deterministic validation does not require:

- Live Supabase credentials.
- Live provider keys.
- Live ATS websites.
- Production database access.
- Production provider access.

For private staging or production-adjacent rules, see `docs/ENVIRONMENT_SETUP.md`.

## Validation Commands

Run the core gates:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

After build, run CLI smoke checks:

```bash
node dist/src/cli/index.js --help
node dist/src/cli/index.js analytics --help
```

Current validation evidence:

```text
111 test files passed
180 tests passed
```

Stage interpretation:

```text
Stage 1 Validation: PASS
Stage 2 Validation: PASS
Stage 3 Production Readiness: NO-GO
```

Stage 3 is a `NO-GO` for Production SaaS readiness. It is not a blocker for OSS readiness.

## Troubleshooting

If install fails:

- Confirm Node.js and npm are installed.
- Confirm you are in the repository root.
- Run `npm ci`.

If CLI help fails:

- Run `npm run build`.
- Use the compiled entrypoint under `dist/src/cli/index.js`.

If tests fail:

- Confirm private environment files are not overriding test placeholders.
- Confirm no live service configuration is required for the failing test.
- Inspect the specific Vitest failure before changing code.

If staging validation is needed:

- Use staging-only credentials.
- Confirm `NODE_ENV=staging`.
- Do not use production credentials.
- Do not print credential values.
- Use disposable records and clean them up.

## Known Limitations

Known technical limitations:

- Production RLS/access policies are not verified.
- Production read-only schema verification has not been completed.
- Remote GitHub Actions green status still needs target-commit verification after public push.
- Production runbooks and rollback procedures are not complete.
- Backup/restore validation is not complete.
- Live ATS automation is not production-ready.
- No final ATS submission automation exists.
- Execution ID propagation is not universal across all historical workflows.
- No dashboard, billing, tenant model, or production deployment exists.

These limitations keep the project out of Production SaaS readiness today. They do not invalidate the OSS submission target.
