# JobFlow AI

JobFlow AI is a CLI-first Job Application Orchestration Platform built with a stage-gated development model.

## Current Status

Phase 10 analytics computation and retrieval.

Phase 7 ATS automation has been formally split into stage-gated subphases:

```text
Phase 7A - ATS Automation Foundation
Phase 7B - Greenhouse / Lever / Generic Strategies
Phase 7C - Workday State Machine
Phase 7D - ATS Reliability Hardening
```

Phase 7A foundation scaffolding, Phase 7B mock-driven Greenhouse/Lever/Generic strategies, Phase 7C Workday state-machine scaffolding, and Phase 7D ATS reliability boundaries are implemented. No live ATS automation exists yet.

Phase 8 lifecycle tracking is implemented with strict state transitions, application snapshots, immutable lifecycle events, timeline reconstruction, and a `jobflow lifecycle` command group.

Phase 9 observability is implemented for execution logs, failure logs, checkpoint records, execution ID traceability, and a `jobflow observability` command group. It stores trace data only and does not implement analytics, dashboards, real-time monitoring, browser sessions, or alerting.

Phase 10 analytics is implemented for read-only CLI summaries across application funnel, lifecycle, execution, ATS reliability, and job pipeline data. It does not create dashboards, charts, reports, alerts, lifecycle transitions, observability writes, or ATS automation.

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

Observability smoke commands:

```bash
jobflow observability logs --execution-id <execution_id>
jobflow observability record-log --service ats --step human_review --status success --execution-id <execution_id>
jobflow observability record-failure --service ats --step upload_resume --message "Upload failed" --execution-id <execution_id>
jobflow observability record-checkpoint --application-id <application_id> --ats-type greenhouse --current-step human_review --execution-id <execution_id>
```

Observability stores sanitized execution trace records only. It does not aggregate metrics, render dashboards, capture screenshots, read sessions, open browsers, or submit applications.

Analytics smoke commands:

```bash
jobflow analytics summary
jobflow analytics funnel
jobflow analytics lifecycle
jobflow analytics executions
jobflow analytics ats
jobflow analytics pipeline
```

Analytics reads existing records and renders safe aggregate summaries only. It does not expose raw metadata, checkpoint payloads, cookies, tokens, authorization headers, provider secrets, or service role keys.

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

Phase 7B provides mock-driven Greenhouse, Lever, and conservative Generic strategy behavior. Phase 7C detects Workday states and constructs checkpoints without automatically progressing through multiple Workday states. Phase 7D hardens ATS reliability boundaries for failures, screenshots, sessions, checkpoints, retries, and upload verification without adding live browser automation. Phase 8 tracks application lifecycle state after those workflow outputs. Phase 9 records sanitized traceability data for debugging and recovery. Phase 10 computes read-only CLI analytics from existing lifecycle and observability records. Live ATS automation is not allowed until explicitly approved in a later subphase, and every ATS path must stop before final submission.

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
