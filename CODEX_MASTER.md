# JobFlow AI

## Master Engineering Constitution

Version: 1.0

Authority Level: HIGHEST

This document is the supreme engineering authority for the JobFlow AI repository.

All code generation, refactoring, architectural decisions, testing decisions, and implementation plans must comply with this document.

If any document conflicts with this file:

```text
CODEX_MASTER.md
↓
PRD.md
↓
ARCHITECTURE.md
↓
DATABASE.md
↓
ATS_STRATEGIES.md
↓
RESUME_INTELLIGENCE.md
```

This file wins.

---

# SECTION 1

# Project Mission

JobFlow AI is a CLI-first Job Application Orchestration Platform.

This is NOT:

* a browser automation script
* a resume generator
* a job scraper
* a portfolio demo

Those are components.

JobFlow AI is a complete orchestration platform that manages the entire job application lifecycle.

Core Capabilities:

1. Job Discovery
2. Job Parsing
3. Deterministic Match Scoring
4. Resume Intelligence Retrieval
5. Document Generation
6. Resume Rendering
7A. ATS Automation Foundation
7B. Greenhouse / Lever / Generic Strategies
7C. Workday State Machine
7D. ATS Reliability Hardening
8. Lifecycle Tracking
9. Observability
10. Analytics

---

# SECTION 2

# Engineering Philosophy

Every engineering decision must optimize for:

```text
Correctness
Maintainability
Traceability
Testability
Reliability
Observability
```

NOT:

```text
Speed of implementation
Code golf
Clever tricks
Large one-shot implementations
Premature optimization
```

---

# SECTION 3

# Deterministic Before AI

This project follows a strict rule:

AI is the last resort.

If a problem can be solved deterministically:

DO NOT USE AI.

Examples:

### Deterministic

* ATS Detection
* Job Deduplication
* Score Calculation
* State Validation
* Event Logging
* Salary Parsing
* Skill Intersection
* ATS Routing

### AI-Powered

* Resume Bullets
* Resume Summary
* Cover Letter
* Recruiter Messages
* Screening Question Drafts

---

# SECTION 4

# Human Approval Boundary

The system must never submit applications automatically.

The system may:

* discover jobs
* parse jobs
* generate resumes
* fill ATS forms

The system must stop at:

```text
HUMAN_APPROVAL_REQUIRED
```

The user is responsible for final submission.

No implementation may bypass this rule.

---

# SECTION 5

# Development Methodology

JobFlow AI must be built using a Stage-Gated Development Model.

Components are implemented sequentially.

No component may begin until the previous component passes its completion gate.

---

# SECTION 6

# Development Phases

## Phase 0

Foundation

Includes:

* project setup
* typescript config
* linting
* testing framework
* cli bootstrap
* env config
* logger
* error handling
* supabase client shell

Completion Gate:

```bash
npm run lint
npm run typecheck
npm test
```

must pass.

---

## Phase 1

Job Discovery Service

Includes:

* crawler interface
* job repository
* normalizer
* deduplication
* discover command

Completion Gate:

* unit tests pass
* repository tests pass
* discover command works

No parsing logic allowed yet.

---

## Phase 2

Job Parsing Service

Includes:

* html cleaner
* skill extraction
* salary parsing
* seniority extraction
* embeddings

Completion Gate:

* parser tests pass
* extraction tests pass
* parse command works

No scoring implementation allowed yet.

---

## Phase 3

Match Scoring Service

Includes:

* skill scoring
* experience scoring
* location scoring
* compensation scoring
* weighted score calculation

Completion Gate:

* formula tests pass
* edge case tests pass
* score command works

No AI implementation allowed yet.

---

## Phase 4

Resume Intelligence Service

Includes:

* fragment repository
* embedding generation
* retrieval
* context builder

Completion Gate:

* retrieval tests pass
* similarity tests pass
* fragment tests pass

---

## Phase 5

Document Generation Service

Includes:

* ai client
* resume generation
* cover letter generation
* recruiter message generation

Completion Gate:

* generation tests pass
* schema validation passes

---

## Phase 6

Resume Rendering Service

Includes:

* latex templates
* latex renderer
* pdf compiler wrapper

Completion Gate:

* tex generation passes
* pdf generation passes

---

## Phase 7A

ATS Automation Foundation

Includes:

* ATSStrategy interface
* ATS type detection utilities
* ATSStrategyRegistry
* SemanticLocatorService
* applicant/profile input types
* resume PDF path validation helper
* submit guard utility
* mock ATS HTML fixture structure
* jobflow apply CLI scaffold

Must NOT include:

* live ATS automation
* Greenhouse execution strategy
* Lever execution strategy
* Generic execution strategy
* Workday state machine implementation
* final application submission

Completion Gate:

* detection tests pass
* registry tests pass
* semantic locator ordering tests pass
* submit guard tests pass
* no strategy can click final submit
* mock fixture structure exists
* `node dist\src\cli\index.js apply --help` passes

---

## Phase 7B

Greenhouse / Lever / Generic Strategies

Includes:

* Greenhouse strategy against mock fixture
* Lever strategy against mock fixture
* conservative Generic strategy against mock fixture
* personal information autofill
* resume upload verification
* safe screening answer filling
* human approval stop state

Must NOT include:

* Workday implementation
* lifecycle state machine
* observability service
* analytics service
* final application submission

Completion Gate:

* Greenhouse mock fixture tests pass
* Lever mock fixture tests pass
* Generic mock fixture tests pass
* upload verification tests pass
* human approval boundary tests pass
* no strategy clicks final submit

---

## Phase 7C

Workday State Machine

Includes:

* Workday state enum
* Workday transition validator
* Workday page-state detector
* Workday scaffold strategy
* mock Workday multi-step fixture
* login/session-required handling
* checkpoint boundary for each state

Must NOT include:

* treating Workday as a flat form
* aggressive live Workday automation claims
* lifecycle service
* observability service
* analytics service
* final application submission

Completion Gate:

* Workday state transition tests pass
* Workday mock multi-step fixture tests pass
* checkpoint boundary tests pass
* login/session-required handling tests pass
* no Workday flow clicks final submit

---

## Phase 7D

ATS Reliability Hardening

Includes:

* failure capture boundary
* screenshot path builder
* checkpoint persistence or checkpoint repository boundary
* session storage path handling
* retry/stability policy
* upload verification hardening
* cross-strategy failure tests
* screenshot/session artifact security review

Must NOT include:

* lifecycle service
* observability service
* analytics service
* final application submission

Completion Gate:

* screenshot path/security tests pass
* failure handling tests pass
* session persistence path tests pass
* recovery/checkpoint tests pass
* storage artifact security scan passes
* no final submit action is automated

---

## Phase 8

Lifecycle Service

Includes:

* state machine
* transition validator
* event repository

Completion Gate:

* lifecycle tests pass
* state reconstruction passes

---

## Phase 9

Observability Service

Includes:

* execution logs
* failure logs
* screenshot logs
* checkpoint logs

Completion Gate:

* logging tests pass

---

## Phase 10

Analytics Service

Includes:

* analytics queries
* metrics
* reporting

Completion Gate:

* analytics tests pass

---

# SECTION 7

# Completion Rule

Code existing is not completion.

A component is complete only when:

1. Types compile.
2. Tests pass.
3. Lint passes.
4. Documentation updated.
5. Completion gate satisfied.

---

# SECTION 8

# Architecture Rule

All features follow:

```text
CLI
↓
Use Case
↓
Service
↓
Repository
↓
Database / Integration
```

No exceptions.

---

# SECTION 9

# CLI Rules

CLI files may:

* parse arguments
* invoke use cases
* display results

CLI files may NOT:

* query databases
* build prompts
* calculate scores
* execute Playwright workflows

CLI is orchestration only.

---

# SECTION 10

# Repository Rules

Repositories are the only layer allowed to directly access Supabase.

Allowed:

```text
repositories/*
```

Forbidden:

```text
services/*
cli/*
domain/*
```

Repositories expose methods.

Repositories do not expose Supabase syntax.

---

# SECTION 11

# Service Rules

Services contain business logic.

Services may:

* call repositories
* call integrations
* call utilities

Services may NOT:

* parse CLI arguments
* print to console
* bypass lifecycle validation

---

# SECTION 12

# Domain Layer Rules

Domain must remain pure.

Forbidden imports:

* Supabase
* Playwright
* OpenAI
* Claude
* Filesystem
* Environment Variables

Domain layer contains:

* entities
* types
* state machines
* constants

only.

---

# SECTION 13

# Resume Intelligence Rules

The master resume is NOT sent to the LLM.

Use:

```text
Job Description
↓
Embedding
↓
Similarity Search
↓
Top Resume Fragments
↓
Prompt Builder
↓
LLM
```

Default:

```text
Top K = 5
Threshold = 0.72
```

Every fragment must be atomic.

---

# SECTION 14

# Resume Rendering Rules

LLM generates:

```json
ResumeJson
```

Renderer generates:

```text
resume.tex
resume.pdf
```

AI must never directly generate PDFs.

Required artifacts:

```text
resume.json
resume.tex
resume.pdf
metadata.json
```

---

# SECTION 15

# Match Scoring Rules

Formula:

Final Score

=

40% Skill Match

*

25% Experience Match

*

10% Industry Match

*

10% Location Match

*

15% Compensation Match

Store:

* individual scores
* final score

Never store final score alone.

---

# SECTION 16

# ATS Rules

ATS automation uses Strategy Pattern.

Required Strategies:

```text
GreenhouseStrategy
LeverStrategy
WorkdayStrategy
GenericStrategy
```

No universal ATS script allowed.

---

# SECTION 17

# Locator Rules

Priority:

```text
ARIA
↓
Label
↓
Placeholder
↓
Associated Text
↓
Data Attributes
↓
CSS Fallback
```

CSS selectors are fallback only.

---

# SECTION 18

# Workday Rules

Workday must use state-machine navigation.

Required states:

```text
LOGIN_REQUIRED
PERSONAL_INFO
EXPERIENCE
DOCUMENT_UPLOAD
SCREENING
REVIEW
HUMAN_APPROVAL_REQUIRED
```

Treat Workday differently from Greenhouse and Lever.

---

# SECTION 19

# Lifecycle Rules

Applications use strict states.

Current state is a projection.

Events are the source of truth.

Every transition must:

* be validated
* generate event log
* be recoverable

---

# SECTION 20

# Observability Rules

Every operation receives:

```text
execution_id
```

Execution IDs must flow through:

* discovery
* parsing
* scoring
* generation
* rendering
* ats
* lifecycle
* analytics

Failures must:

1. log event
2. preserve context
3. capture screenshot if Playwright involved
4. save checkpoint

---

# SECTION 21

# Security Rules

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

Session state must remain local.

Do not push to the GitHub repository.

Codex may create local commits when required by the stage-gated completion process, but must not run:

```bash
git push
```

The user will review and push changes manually.

---

# SECTION 22

# Testing Rules

Every phase requires tests.

Mandatory categories:

```text
Unit Tests
Integration Tests
```

Deterministic systems require exhaustive testing.

Examples:

* scoring
* lifecycle
* parsing
* ats detection
* retrieval

are mandatory test targets.

GitHub Actions CI must protect the repository with the same core gates used during local stage-gated development:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

CI must use Node.js 22 on a GitHub-hosted Ubuntu runner.

CI must not require:

* real Supabase credentials
* real LLM keys
* real embedding provider calls
* real ATS credentials
* Playwright browsers
* LaTeX installation
* live ATS websites

CI may use fake placeholder environment variables only.

CI must never expose secrets.

---

# SECTION 23

# Scope Control

During a phase:

Only files related to that phase may be modified.

Example:

During Phase 1:

Allowed:

* discovery service
* job repository
* crawler interface

Forbidden:

* ats automation
* analytics
* resume generation

No future work allowed.

---

# SECTION 24

# Required Phase Reporting

Before implementation:

```text
Current Phase:
Target Component:
Files Expected To Change:
Tests Expected:
Completion Gate:
```

After implementation:

```text
Implemented:
Tests Added:
Commands Verified:
Completion Gate Status:
Next Phase Eligibility:
```

---

# SECTION 25

# Definition Of Done

A feature is done only when:

* architecture respected
* tests pass
* lint passes
* types pass
* observability added
* documentation updated
* no architectural violations introduced

---

# SECTION 26

# Final Instruction To Codex

Build JobFlow AI like an internal engineering platform.

Not like:

* a hackathon project
* a demo
* a portfolio toy
* a collection of scripts

Every implementation must make future maintenance easier than present development.

---

# SECTION 27

# Phase Advancement Rule

After completing a phase:

Codex MUST stop.

Codex MUST NOT automatically begin the next phase.

Codex MUST produce a completion report.

Example:

Current Phase:
Phase 0

Completion Gate Status:
PASSED

Artifacts Created:
...

Tests Added:
...

Commands Verified:
...

Phase Advancement Eligibility:
ELIGIBLE FOR PHASE 1

Status:
AWAITING USER APPROVAL

---

Only the user may authorize progression to the next phase.

Example:

"Proceed to Phase 1"

Without explicit approval, no additional implementation may begin.

---

# SECTION 28

# Mandatory Phase Documentation

Every completed phase must generate a permanent phase report.

Phase reports must be stored in:

```text
docs/progress/
```

Naming Convention:

```text
PHASE_00_FOUNDATION.md
PHASE_01_JOB_DISCOVERY.md
PHASE_02_JOB_PARSING.md
PHASE_03_MATCH_SCORING.md
PHASE_04_RESUME_INTELLIGENCE.md
PHASE_05_DOCUMENT_GENERATION.md
PHASE_06_RESUME_RENDERING.md
PHASE_07A_ATS_AUTOMATION_FOUNDATION.md
PHASE_07B_ATS_STRATEGIES.md
PHASE_07C_WORKDAY_STATE_MACHINE.md
PHASE_07D_ATS_RELIABILITY_HARDENING.md
PHASE_08_LIFECYCLE.md
PHASE_09_OBSERVABILITY.md
PHASE_10_ANALYTICS.md
```

---

# Required Rule

A phase is NOT considered complete until:

1. Completion gate passes.
2. Phase report is generated.
3. Phase report is committed to the repository.

Only then may the phase be marked complete.

---

# Required Contents

Every phase report must contain:

## Overview

Purpose of the phase.

---

## Objectives

Original goals for the phase.

---

## Implemented Components

List of all files created.

Example:

```text
src/services/discovery/job-discovery.service.ts
src/repositories/job.repository.ts
src/use-cases/discover-jobs.use-case.ts
```

---

## Files Modified

List all modified files.

---

## Architecture Decisions

Document important decisions.

Example:

```text
Decision:
Use Repository Pattern for database access.

Reason:
Prevent Supabase coupling inside services.
```

---

## Testing Summary

Document:

* tests added
* tests executed
* test results

Example:

```text
✓ Normalizer Tests
✓ Deduplication Tests
✓ Repository Tests
```

---

## Commands Executed

Example:

```bash
npm run lint
npm run typecheck
npm test
jobflow discover --help
```

---

## Completion Gate Evidence

Document proof that completion gate passed.

Example:

```text
Lint:
PASSED

Typecheck:
PASSED

Tests:
PASSED

CLI Smoke Test:
PASSED
```

---

## Known Limitations

Document intentionally deferred work.

Example:

```text
Workday state-machine support deferred to Phase 7C.
```

---

## Lessons Learned

Capture implementation insights.

Example:

```text
Discovered that job deduplication requires URL normalization before comparison.
```

---

## Next Phase Prerequisites

Document what must exist before the next phase starts.

---

# Engineering Journal Principle

The phase reports collectively serve as the project's engineering journal.

The project should be understandable from the phase reports alone, even if the original development chat history no longer exists.

### Project Metrics

Every phase report MUST contain a Project Metrics section.

Purpose:

* Track project growth across phases.
* Provide measurable implementation progress.
* Support future case studies.
* Create an engineering timeline.

Required Template:

```text
Project Metrics

Files Created:
<value>

Files Modified:
<value>

Directories Created:
<value>

Test Files Added:
<value>

Tests Added:
<value>

Commands Verified:
<value>
```

Optional Metrics:

```text
Lines Added:
<value>

Coverage Change:
<value>

Documentation Files Updated:
<value>
```

---

### Risks Identified

Every phase report MUST contain a Risks Identified section.

Purpose:

* Surface technical concerns early.
* Prevent known issues from being forgotten.
* Capture architectural risks before they become defects.
* Document implementation constraints and tradeoffs.

Required Template:

Risk 1

Description:

```text
<risk description>
```

Impact:

```text
Low | Medium | High
```

Mitigation:

```text
<planned mitigation strategy>
```

---

Risk 2

Description:

```text
<risk description>
```

Impact:

```text
Low | Medium | High
```

Mitigation:

```text
<planned mitigation strategy>
```

---

Risk 3

Description:

```text
<risk description>
```

Impact:

```text
Low | Medium | High
```

Mitigation:

```text
<planned mitigation strategy>
```

---

### Enforcement Rule

Phase reports MUST include:

* Overview
* Objectives
* Implemented Components
* Files Modified
* Architecture Decisions
* Testing Summary
* Project Metrics
* Risks Identified
* Commands Executed
* Completion Gate Evidence
* Known Limitations
* Lessons Learned
* Next Phase Prerequisites

A phase report missing any required section is considered incomplete.

A phase cannot be marked complete until its phase report satisfies all required sections.


---

# SECTION 29

# Production Readiness Validation

Completing Phase 10 does not automatically make JobFlow AI production-ready.

Before the project may be called production-candidate, it must pass the approved production readiness validation model:

```text
Stage 1 - Local Deterministic Validation
Stage 2 - Staging Integration Validation
Stage 3 - Production Readiness Validation
```

Stage 1 must validate code, tests, CLI smoke checks, architecture boundaries, security scans, and artifact tracking without live services.

Stage 2 must validate staging-safe integration behavior using non-production resources and explicit approval for any live provider or disposable write checks.

Stage 3 must validate the release candidate through full regression, CI, database verification, lifecycle consistency, observability traceability, analytics correctness, security review, manual acceptance, rollback planning, known limitations, and a go/no-go verdict.

Production readiness validation must not bypass:

* the human approval boundary
* repository boundaries
* provider boundaries
* lifecycle boundaries
* observability boundaries
* analytics read-only boundaries

No final ATS submission, production database write, live provider smoke test, live ATS validation, credential setup, or deployment behavior may occur without explicit user approval.

The permanent validation plan is stored at:

```text
docs/progress/PRODUCTION_READINESS_VALIDATION_PLAN.md
```

---

# Final Rule

Before requesting approval to proceed to the next phase, Codex must:

1. Generate the phase report.
2. Save it under docs/progress/.
3. Include its path in the completion report.

Example:

```text
Phase Report:
docs/progress/PHASE_03_MATCH_SCORING.md

Status:
AWAITING USER APPROVAL
```

Without a phase report, the phase is incomplete.

