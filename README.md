# JobFlow AI

JobFlow AI is a CLI-first Job Application Orchestration Platform built with a stage-gated development model.

## Current Status

Phase 6 resume rendering.

Phase 7 ATS automation has been formally split into stage-gated subphases:

```text
Phase 7A - ATS Automation Foundation
Phase 7B - Greenhouse / Lever / Generic Strategies
Phase 7C - Workday State Machine
Phase 7D - ATS Reliability Hardening
```

No ATS automation implementation has started yet.

## Commands

```bash
npm run lint
npm run typecheck
npm test
```

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

Phase 7A may scaffold `jobflow apply --help`, but live ATS automation is not allowed until the approved subphase scope permits it. Every ATS path must stop before final submission.

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
