# JobFlow AI

JobFlow AI is a CLI-first Job Application Orchestration Platform built with a stage-gated development model.

## Current Status

Phase 8 lifecycle tracking.

Phase 7 ATS automation has been formally split into stage-gated subphases:

```text
Phase 7A - ATS Automation Foundation
Phase 7B - Greenhouse / Lever / Generic Strategies
Phase 7C - Workday State Machine
Phase 7D - ATS Reliability Hardening
```

Phase 7A foundation scaffolding, Phase 7B mock-driven Greenhouse/Lever/Generic strategies, Phase 7C Workday state-machine scaffolding, and Phase 7D ATS reliability boundaries are implemented. No live ATS automation exists yet.

Phase 8 lifecycle tracking is implemented with strict state transitions, application snapshots, immutable lifecycle events, timeline reconstruction, and a `jobflow lifecycle` command group.

## Commands

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

## Continuous Integration

GitHub Actions runs CI on pull requests, pushes to `main`, and manual workflow dispatch.

The CI workflow uses Node.js 22 on an Ubuntu runner and runs:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

CI uses placeholder environment variables only. It does not require real Supabase credentials, LLM keys, embedding provider calls, ATS credentials, Playwright browsers, LaTeX installation, live ATS websites, deployments, or artifact uploads.

## Phase 1 Discovery

Manual discovery smoke command:

```bash
jobflow discover --source manual --title "QA Automation Engineer" --company "Example Co" --url "https://example.com/jobs/qa" --description "Build and maintain automated tests."
```

Deterministic parsing smoke command:

```bash
jobflow parse --job-id <job_id>
```

Deterministic scoring smoke command:

```bash
jobflow score --job-id <job_id>
```

Resume fragment smoke commands:

```bash
jobflow fragments add --type project --text "Built a Playwright automation framework." --source-label "Example Project"
jobflow fragments context --job-id <job_id>
```

Structured document generation smoke commands:

```bash
jobflow generate resume --job-id <job_id>
jobflow generate cover-letter --job-id <job_id>
jobflow generate recruiter-message --job-id <job_id>
jobflow generate screening-response --job-id <job_id> --question "Why are you a fit for this role?"
```

Generation creates structured JSON artifacts only. It does not render LaTeX, create PDFs, automate ATS forms, or submit applications.

Resume rendering smoke command:

```bash
jobflow render --document-id <generated_resume_json_document_id> --template ats
```

Rendering consumes stored ResumeJson and writes local resume artifacts only. It does not generate content, automate ATS forms, or submit applications.

ATS automation foundation smoke command:

```bash
jobflow apply --job-id <job_id> --application-url <application_url> --resume-pdf <local_resume_pdf_path>
```

The current apply command is still safe for local use. Strategy execution is tested through local mock fixtures and adapters only; the CLI does not open a browser, interact with live ATS pages, or submit applications.

Lifecycle smoke commands:

```bash
jobflow lifecycle create --job-id <job_id>
jobflow lifecycle transition --application-id <application_id> --to PARSED
jobflow lifecycle timeline --application-id <application_id>
```

Lifecycle tracks application state and event history only. It does not perform ATS automation, open browsers, manage screenshots, store sessions, create observability logs, calculate analytics, or submit applications.

## Roadmap

```text
Phase 7A - ATS Automation Foundation
Phase 7B - Greenhouse / Lever / Generic Strategies
Phase 7C - Workday State Machine
Phase 7D - ATS Reliability Hardening
Phase 8  - Lifecycle
Phase 9  - Observability
Phase 10 - Analytics
```

Phase 7B provides mock-driven Greenhouse, Lever, and conservative Generic strategy behavior. Phase 7C detects Workday states and constructs checkpoints without automatically progressing through multiple Workday states. Phase 7D hardens ATS reliability boundaries for failures, screenshots, sessions, checkpoints, retries, and upload verification without adding live browser automation. Phase 8 tracks application lifecycle state after those workflow outputs. Live ATS automation is not allowed until explicitly approved in a later subphase, and every ATS path must stop before final submission.

## Architecture Rule

All executable workflows must follow:

```text
CLI
Use Case
Service
Repository
Database / Integration
```

The CLI only parses arguments, invokes use cases, and displays results.
