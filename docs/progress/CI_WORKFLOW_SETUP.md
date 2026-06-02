# CI Workflow Setup

## Overview

This infrastructure update added a GitHub Actions CI workflow for JobFlow AI.

The workflow protects the growing codebase by running the same core validation gates used during stage-gated local development:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

No Phase 7C Workday implementation, Playwright dependency, lifecycle service, observability service, analytics service, deployment workflow, live Supabase call, live LLM call, live ATS automation, or artifact upload was added.

## Files Created

```text
.github/workflows/ci.yml
docs/progress/CI_WORKFLOW_SETUP.md
```

## Files Modified

```text
README.md
docs/TEST.md
CODEX_MASTER.md
```

## Workflow Triggers

The workflow runs on:

```text
pull_request
push to main
workflow_dispatch
```

## Commands Run

The workflow executes:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment Strategy

CI uses safe placeholder environment variables:

```text
NODE_ENV=test
LOG_LEVEL=silent
SUPABASE_URL=https://example.supabase.co
SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key
LLM_PROVIDER=test
LLM_BASE_URL=https://example.com/v1
LLM_API_KEY=test-api-key
LLM_MODEL=test-model
```

These values satisfy environment validation while preventing CI from depending on real credentials or live services.

## Security Notes

- CI does not require real Supabase credentials.
- CI does not require real LLM or embedding provider keys.
- CI does not call live provider APIs.
- CI does not require ATS credentials.
- CI does not use Playwright browsers.
- CI does not require LaTeX installation.
- CI does not access live ATS websites.
- CI does not expose secrets.
- CI does not deploy or upload artifacts.

## Known Gaps

- CI does not run live Supabase integration tests.
- CI does not run live LLM, embedding, or generation provider tests.
- CI does not run browser automation tests.
- CI does not validate local LaTeX installation.
- CI does not enforce coverage thresholds.
- CI does not execute compiled CLI smoke tests.

## Future CI Improvements

Future improvements may include:

- Optional CLI smoke-test job after build.
- Optional coverage reporting after a coverage command is introduced.
- Optional manual live-integration workflow using GitHub environment protection.
- Optional artifact validation for rendered resume fixtures.
- Optional browser-fixture CI only after Playwright is explicitly introduced in an approved future phase.
