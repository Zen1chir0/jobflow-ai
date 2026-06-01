# Phase 07 Split Documentation Update

## Overview

This documentation update formalizes the approved Phase 7 risk assessment verdict:

```text
Proceed with Split Phase 7A-7D
```

Phase 7 is now governed as four stage-gated ATS automation subphases:

```text
Phase 7A - ATS Automation Foundation
Phase 7B - Greenhouse / Lever / Generic Strategies
Phase 7C - Workday State Machine
Phase 7D - ATS Reliability Hardening
```

No ATS automation code, Playwright dependency, production behavior, or runtime source logic was added.

## Documentation Updated

Files modified:

```text
CODEX_MASTER.md
docs/ARCHITECTURE.md
docs/ATS_STRATEGIES.md
docs/TEST.md
docs/PROJECTS_REQUIREMENTS_DOCUMENT.md
docs/REQUIRED_SERVICES_AND_KEYS.md
docs/progress/PHASE_06_RESUME_RENDERING.md
docs/progress/PHASE_00_TO_06_REGRESSION_AUDIT.md
docs/progress/PROJECT_HEALTH_AUDIT_PHASE_00_TO_04.md
README.md
```

File created:

```text
docs/progress/PHASE_07_SPLIT_DOCUMENTATION_UPDATE.md
```

## Governance Changes

`CODEX_MASTER.md` now treats Phase 7 as four explicit subphases with separate boundaries and completion gates.

Updated phase report naming convention:

```text
PHASE_07A_ATS_AUTOMATION_FOUNDATION.md
PHASE_07B_ATS_STRATEGIES.md
PHASE_07C_WORKDAY_STATE_MACHINE.md
PHASE_07D_ATS_RELIABILITY_HARDENING.md
```

The documentation now explicitly forbids treating Phase 7 as one monolithic automation implementation.

## Architecture Changes

`docs/ARCHITECTURE.md` now documents the approved Phase 7A-7D split and the required ATS automation flow:

```text
CLI
Use Case
ATSAutomationService
ATSStrategyRegistry
Resolved ATSStrategy
Semantic Locator / Session / File Upload / Checkpoint helpers
Human Approval Required
```

The development order now places ATS work after resume rendering as:

```text
Phase 7A - ATS automation foundation
Phase 7B - Greenhouse / Lever / Generic strategies
Phase 7C - Workday state machine
Phase 7D - ATS reliability hardening
```

## ATS Strategy Documentation Changes

`docs/ATS_STRATEGIES.md` now defines:

- Phase 7A responsibilities, boundaries, and gates.
- Phase 7B responsibilities, boundaries, and gates.
- Phase 7C responsibilities, boundaries, and gates.
- Phase 7D responsibilities, boundaries, and gates.
- Mock-first, fixture-driven ATS testing expectations.
- Explicit no-live-site and no-final-submit testing rules.

## Testing Strategy Changes

`docs/TEST.md` now includes planned future testing expectations for Phase 7A-7D.

The documented ATS testing strategy requires:

- Local mock ATS fixtures only.
- No live ATS sites in automated tests.
- No real ATS credentials or browser sessions.
- Submit guard tests.
- Strategy registry tests.
- Semantic locator priority tests.
- Workday state transition tests.
- Screenshot/session artifact security checks.

Current implemented-phase test commands remain unchanged.

## Roadmap Changes

`docs/PROJECTS_REQUIREMENTS_DOCUMENT.md` and `README.md` now describe ATS automation as a staged roadmap:

```text
Phase 7A - ATS Automation Foundation
Phase 7B - Greenhouse / Lever / Generic Strategies
Phase 7C - Workday State Machine
Phase 7D - ATS Reliability Hardening
Phase 8  - Lifecycle
Phase 9  - Observability
Phase 10 - Analytics
```

## Completion Gates Documented

Phase 7A gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js apply --help
```

Phase 7B gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Phase 7C gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Phase 7D gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Each subphase also has additional evidence requirements documented in `CODEX_MASTER.md`, `docs/ATS_STRATEGIES.md`, and `docs/TEST.md`.

## Commands Executed

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Verification Results

Lint:

```text
PASSED
```

Typecheck:

```text
PASSED
```

Tests:

```text
58 test files passed
94 tests passed
```

Build:

```text
PASSED
```

## Boundaries Preserved

This task did not:

- implement ATS automation
- add Playwright dependencies
- add browser automation code
- modify production source behavior
- add lifecycle service behavior
- add observability service behavior
- add analytics service behavior
- push to GitHub

## Known Gaps

- Phase 7A planning has not started.
- `jobflow apply` does not exist yet.
- No ATS mock fixture files exist yet.
- No Playwright dependency has been added.
- No live ATS automation exists.

## Status

```text
DOCUMENTATION UPDATE COMPLETE
AWAITING USER APPROVAL
```
