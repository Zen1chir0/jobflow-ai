# Architecture Map

This map gives reviewers a compact view of JobFlow AI's structure.

For the full architecture document, see:

```text
docs/ARCHITECTURE.md
```

## Core Flow

JobFlow AI follows this dependency flow:

```text
CLI
  |
  v
Use Cases
  |
  v
Services
  |
  v
Repositories
  |
  v
Supabase / Integrations
```

Rule:

```text
Business logic should not live in CLI command files.
Supabase query syntax should live in repositories.
Provider and ATS behavior should stay behind integration/service boundaries.
```

## Layer Responsibilities

| Layer | Path | Responsibility |
| --- | --- | --- |
| CLI | `src/cli` | Parse command arguments and render safe output |
| Use Cases | `src/use-cases` | Coordinate workflow-level application actions |
| Services | `src/services` | Own deterministic business logic and subsystem orchestration |
| Repositories | `src/repositories` | Map domain data to persistence and own Supabase query syntax |
| Domain | `src/domain` | Define pure types, schemas, state machines, and validation rules |
| Integrations | `src/integrations` | Isolate Supabase clients, provider adapters, and external boundaries |
| Templates | `src/templates` | Hold rendering templates |
| Utils | `src/utils` | Shared helpers such as IDs, logging, filesystem, and text utilities |

## CLI Commands

Implemented command groups:

```text
analytics
apply
discover
fragments
generate
lifecycle
observability
parse
render
score
```

CLI files should:

- Parse arguments.
- Construct dependencies.
- Invoke use cases.
- Render safe user-facing output.

CLI files should not:

- Contain business logic.
- Query Supabase directly.
- Call providers directly.
- Bypass ATS safety boundaries.

## Subsystem Map

| Subsystem | Main Path | Purpose |
| --- | --- | --- |
| Discovery | `src/services/discovery` | Normalize and persist job opportunities |
| Parsing | `src/services/parsing` | Clean and parse job descriptions deterministically |
| Scoring | `src/services/scoring` | Compute transparent job match scores |
| Resume Intelligence | `src/services/resume-intelligence` | Fragment, retrieve, and prepare resume context |
| Document Generation | `src/services/document-generation` | Generate structured application documents through provider boundaries |
| Rendering | `src/services/resume-rendering` | Render ResumeJson into local artifact metadata and files |
| ATS Safety | `src/services/ats` | Detect ATS type, resolve strategies, guard submission, handle reliability |
| Lifecycle | `src/services/lifecycle` | Validate application states and transitions |
| Observability | `src/services/observability` | Record execution logs, failures, and checkpoints |
| Analytics | `src/services/analytics` | Compute read-only platform analytics |

## Data Flow

Typical safe workflow:

```text
Manual job discovery
  |
  v
Job repository persistence
  |
  v
Deterministic job parsing
  |
  v
Match scoring
  |
  v
Resume fragment retrieval
  |
  v
Structured document generation
  |
  v
Resume rendering
  |
  v
ATS preparation
  |
  v
HUMAN_APPROVAL_REQUIRED
```

The workflow stops before final ATS submission.

## Lifecycle Model

Approved lifecycle states:

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

Lifecycle rules:

- State transitions must be validated.
- Application state changes should create lifecycle events.
- Final ATS submission remains outside automated behavior.

## Database Boundary

Repository layer owns database access.

Important repositories:

```text
job.repository.ts
parsed-job-profile.repository.ts
job-match-score.repository.ts
resume-fragment.repository.ts
generated-document.repository.ts
generated-resume.repository.ts
application.repository.ts
application-event.repository.ts
execution-log.repository.ts
automation-checkpoint.repository.ts
analytics.repository.ts
```

Key database-backed areas:

- Jobs.
- Parsed job profiles.
- Match scores.
- Generated documents.
- Generated resumes.
- Applications.
- Application events.
- Execution logs.
- Automation checkpoints.
- Analytics views.

## Provider Boundary

Provider behavior is isolated behind interfaces and provider-compatible adapters.

Rules:

- Business logic should not hardcode provider endpoints.
- Provider keys must come from configuration.
- Mock providers are the default for automated tests.
- Live provider usage requires explicit approval.

## ATS Boundary

ATS behavior is intentionally constrained.

Rules:

- ATS tests are mock-first and fixture-driven.
- Strategies must stop at the human approval boundary.
- No final submit click is automated.
- Browser session files and screenshots must remain ignored.

## Observability Boundary

Observability records:

```text
execution_logs
automation_checkpoints
```

Traceability rule:

```text
Execution IDs should remain consistent across related execution logs, checkpoints, failure records, and lifecycle records when a workflow chain supports them.
```

Known limitation:

```text
Execution ID propagation is not universal across all historical workflows yet.
```

## Analytics Boundary

Analytics is read-only.

Analytics areas:

- Funnel analytics.
- Lifecycle analytics.
- Execution analytics.
- ATS reliability analytics.
- Job pipeline analytics.
- Document generation analytics.

Rule:

```text
Analytics should consume records and views, not create application records.
```

## Validation Evidence

Current validation status:

```text
Stage 1 Validation: PASS
Stage 2 Validation: PASS
Stage 3 Production Readiness: NO-GO
```

Interpretation:

- Stage 1 proves local deterministic validation.
- Stage 2 proves controlled staging integration validation.
- Stage 3 is `NO-GO` for Production SaaS readiness because production security and operations hardening remain incomplete.

Stage 3 is not a blocker for OSS readiness.

## What Is Intentionally Deferred

Deferred until future approval:

- Production deployment.
- Production RLS implementation.
- Production read-only schema verification.
- Release and rollback runbooks.
- Backup/restore validation.
- Dashboard UI.
- Multi-user SaaS operations.
- Billing.
- Live ATS final submission.
- Phase 11.
