# JobFlow AI

JobFlow AI is a CLI-first, deterministic-first, AI-assisted job application orchestration platform with phase-gated architecture, tests, CI, lifecycle tracking, observability, analytics, and ATS safety boundaries.

## What JobFlow AI Is

JobFlow AI is an open-source engineering project for coordinating the job application workflow from discovery through parsing, scoring, resume intelligence, document generation, resume rendering, ATS preparation, lifecycle tracking, observability, and analytics.

It is built as a backend-first TypeScript CLI platform with a strong separation between command handling, use cases, services, repositories, domain logic, and integrations.

The project demonstrates a disciplined AI-assisted development process:

```text
Plan
Approve
Implement
Test
Audit
Document
Validate
```

## What JobFlow AI Is Not

JobFlow AI is not production SaaS today.

It is also not:

- An autonomous job application submitter.
- A live ATS submission bot.
- A multi-user hosted product.
- A billing or account-management platform.
- A dashboard-first analytics product.
- A production deployment template.

No final ATS submission automation exists.

Human approval remains mandatory.

## Why It Matters

JobFlow AI demonstrates how AI-assisted development can remain maintainable when governed by architecture boundaries, deterministic services, phase gates, tests, audits, and validation reports.

The project intentionally uses deterministic logic for safety-critical workflow steps such as parsing, scoring, lifecycle state transitions, observability, analytics, and ATS submission guards. AI/provider integrations are kept behind explicit boundaries and are tested with mock-first behavior.

For the OpenAI OSS application framing, see [docs/OPENAI_OSS_APPLICATION_NARRATIVE.md](docs/OPENAI_OSS_APPLICATION_NARRATIVE.md).

## Core Features

- Manual job discovery and normalized job persistence.
- Deterministic job parsing into structured job profiles.
- Transparent match scoring across skills, experience, industry, location, and compensation.
- Resume fragment storage, retrieval, and prompt context construction.
- Provider-agnostic document generation for resume JSON, cover letters, recruiter messages, and screening responses.
- Resume JSON validation and LaTeX/PDF rendering boundaries.
- ATS detection, strategy registry, semantic locator foundation, retry/checkpoint support, and submit guard.
- Application lifecycle tracking with approved state transitions and event timelines.
- Observability through execution logs, failure records, and automation checkpoints.
- Read-only analytics for funnel, lifecycle, execution, ATS reliability, pipeline, and document-generation summaries.
- GitHub Actions CI for lint, typecheck, tests, and build.

## Architecture Overview

JobFlow AI follows this primary dependency flow:

```text
CLI
Use Cases
Services
Repositories
Supabase / Integrations
```

Core boundaries:

| Layer | Responsibility |
| --- | --- |
| CLI | Parse arguments, call use cases, render safe command output |
| Use Cases | Coordinate workflow-level application behavior |
| Services | Own business logic and deterministic orchestration |
| Repositories | Own Supabase query syntax and persistence mapping |
| Domain | Define pure types, state machines, and validation rules |
| Integrations | Isolate providers, Supabase clients, rendering, and ATS/browser boundaries |

Subsystems:

- Discovery
- Parsing
- Match scoring
- Resume intelligence
- Document generation
- Resume rendering
- ATS safety and strategies
- Lifecycle
- Observability
- Analytics

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture guide.

For a compact reviewer map, see [docs/ARCHITECTURE_MAP.md](docs/ARCHITECTURE_MAP.md).

## Safety Boundaries

JobFlow AI is built around explicit safety rules:

- No final ATS submission automation exists.
- Human approval remains mandatory before any real application action.
- ATS workflows are mock-first and fixture-driven by default.
- Provider calls are behind integration boundaries.
- Automated tests do not require live provider keys.
- CLI and domain layers do not perform direct Supabase queries.
- Analytics is read-only.
- Secrets, cookies, browser session files, screenshots with personal data, and private generated artifacts must not be committed.
- Production database writes are not part of validation.

## Validation Evidence

Current validation status:

```text
Stage 1 Validation: PASS
Stage 2 Validation: PASS
Stage 3 Production Readiness: NO-GO
```

Stage 3 is a `NO-GO` for Production SaaS readiness.

That is not a blocker for OSS readiness.

The Stage 3 result means the project is not yet approved as a production-operated SaaS because production RLS/access policies, production read-only schema verification, remote CI status evidence, release runbooks, rollback procedures, backup/restore validation, and operational readiness still need production hardening.

Latest recorded automated validation:

```text
111 test files passed
180 tests passed
```

Core local gates:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Validation reports:

- [Stage 1 Local Deterministic Validation](docs/progress/STAGE_01_LOCAL_DETERMINISTIC_VALIDATION.md)
- [Stage 2 Controlled Integration Validation](docs/progress/STAGE_02_CONTROLLED_INTEGRATION_VALIDATION.md)
- [Stage 3 Production Readiness Validation](docs/progress/STAGE_03_PRODUCTION_READINESS_VALIDATION.md)
- [Project Health and Readiness Assessment](docs/progress/PROJECT_HEALTH_AND_READINESS_ASSESSMENT.md)

## Quick Start

Requirements:

- Node.js 22
- npm

Install and run the local validation gates:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
node dist/src/cli/index.js --help
```

The deterministic local test suite uses fake or mocked credentials. It does not require live Supabase credentials, live provider keys, live ATS websites, or production resources.

For a fuller setup path, see [docs/INSTALLATION.md](docs/INSTALLATION.md).

For credential and environment rules, see [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md).

For a safe local demo walkthrough, see [docs/DEMO_WORKFLOW.md](docs/DEMO_WORKFLOW.md).

For fake reviewer examples, see [docs/examples](docs/examples).

Useful CLI help commands after build:

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

## Repository Structure

```text
src/
  cli/                 CLI commands and output rendering
  config/              Environment validation and configuration
  domain/              Pure domain types, lifecycle state machine, schemas
  integrations/        Supabase, provider, ATS, rendering integration boundaries
  repositories/        Persistence mappings and Supabase query ownership
  services/            Business logic and subsystem orchestration
  use-cases/           Workflow-level application coordination

tests/
  integration/         Mocked repository, CLI, and workflow integration tests
  unit/                Deterministic unit tests

docs/
  ARCHITECTURE.md      Architecture guide
  DATABASE.md          Database schema and lifecycle documentation
  TEST.md              Test strategy and validation commands
  progress/            Phase reports, audits, and readiness validation history
```

## Current Status

JobFlow AI has completed Phase 00 through Phase 10:

```text
Foundation
Discovery
Parsing
Match Scoring
Resume Intelligence
Document Generation
Resume Rendering
ATS Foundation and Strategies
Lifecycle
Observability
Analytics
```

Current OSS-facing classification:

```text
Open Source Submission Readiness in progress
```

Production classification:

```text
Staging-validated Advanced Portfolio System
```

It is architecturally mature, well-tested, and staging-validated. It is not production SaaS yet.

## Known Limitations

Important limitations:

- Production RLS/access policies are not verified.
- Production read-only schema verification has not been completed.
- Remote GitHub Actions green status still needs public verification for the target commit.
- Production release, rollback, incident response, and backup/restore runbooks are not complete.
- No deployment target is validated.
- No dashboard or frontend exists.
- No billing, tenancy, or multi-user SaaS operations exist.
- Live ATS automation is not production-ready.
- No final ATS submission automation exists.
- Execution ID propagation is not universal across all historical workflows.

These limitations are documented openly so reviewers can distinguish OSS readiness from Production SaaS readiness.

## Roadmap

For the current OSS-focused roadmap, see [docs/ROADMAP.md](docs/ROADMAP.md).

Immediate OSS readiness priorities:

- Add public-facing license, contribution, and security documentation.
- Rewrite README for evaluator clarity.
- Add installation and environment setup guides.
- Add a concise architecture map.
- Add safe demo workflow and example data guidance.
- Add issue and pull request templates.

Future production hardening:

- Production RLS and access policy audit.
- Production read-only schema verification.
- Release and rollback runbooks.
- Incident response checklist.
- Backup and restore validation.
- Provider usage and budget policy.
- Execution ID propagation follow-up.

Explicitly future:

- Dashboard UI.
- External monitoring and alerting.
- Multi-user SaaS tenancy.
- Billing.
- Production live ATS workflows.

## Contributing

Contributions should preserve the project's architecture boundaries, deterministic-first design, mock-first testing posture, and ATS safety rules.

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contributor guidelines.

## Security

Do not commit credentials, provider keys, Supabase service role keys, cookies, browser session files, screenshots containing personal data, or private generated artifacts.

Security issues should be reported responsibly and should not be opened publicly if they include secrets or exploitable details.

See [SECURITY.md](SECURITY.md) for the security policy.

## License

JobFlow AI is released under the MIT License.

See [LICENSE](LICENSE).
