# JobFlow AI

JobFlow AI is a CLI-first Job Application Orchestration Platform built with a stage-gated development model.

## Current Status

Phase 0 foundation scaffold.

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
