# Phase 08 Lifecycle

## Overview

Phase 8 implemented the Application Lifecycle Service for JobFlow AI.

The purpose of this phase was to introduce strict application state management, event-sourced lifecycle history, timeline reconstruction, lifecycle repositories, lifecycle use cases, and a lifecycle CLI command group.

Phase 8 starts after the ATS human approval boundary. It does not perform ATS automation, open browsers, manage browser sessions, store screenshots, create observability logs, calculate analytics, or submit applications.

## Objectives

Original Phase 8 goals:

- Application domain types
- Application state machine
- State transition validator
- Application repository
- Application event repository
- Lifecycle service
- Create application use case
- Transition application state use case
- Get application timeline use case
- Lifecycle CLI command group
- Repository tests
- Use-case tests
- Lifecycle service tests
- CLI tests
- Phase 8 report

## Implemented Components

Files created:

```text
src/domain/applications/application.types.ts
src/domain/applications/application-state-machine.ts
src/repositories/application.repository.ts
src/repositories/application-event.repository.ts
src/services/lifecycle/lifecycle.service.ts
src/services/lifecycle/state-transition.validator.ts
src/use-cases/create-application.use-case.ts
src/use-cases/transition-application-state.use-case.ts
src/use-cases/get-application-timeline.use-case.ts
src/cli/commands/lifecycle.command.ts
tests/unit/domain/applications/application-state-machine.test.ts
tests/unit/services/lifecycle/state-transition.validator.test.ts
tests/unit/services/lifecycle/lifecycle.service.test.ts
tests/unit/use-cases/create-application.use-case.test.ts
tests/unit/use-cases/transition-application-state.use-case.test.ts
tests/unit/use-cases/get-application-timeline.use-case.test.ts
tests/integration/repositories/application.repository.test.ts
tests/integration/repositories/application-event.repository.test.ts
tests/integration/cli-lifecycle.test.ts
docs/progress/PHASE_08_LIFECYCLE.md
```

## Files Modified

Files modified:

```text
README.md
docs/TEST.md
src/cli/index.ts
src/domain/errors/application-error.ts
src/index.ts
```

## Architecture Decisions

Decision:
Use the approved Phase 8 lifecycle state names exactly.

Reason:
The database constraint has been aligned to the approved lifecycle model, so no legacy aliases or compatibility mapping layer are needed.

Decision:
Keep lifecycle state validation in a pure domain state machine.

Reason:
State validation is deterministic and must be directly testable without Supabase, CLI parsing, ATS automation, providers, or filesystem access.

Decision:
Create lifecycle events explicitly through `ApplicationEventRepository`.

Reason:
Application events are the source of truth. Explicit repository calls make event creation visible in service tests and preserve the architecture rule that Supabase access remains in repositories.

Decision:
Keep lifecycle separate from ATS reliability and observability.

Reason:
Phase 7D owns ATS-scoped failures, screenshots, sessions, checkpoints, and retry policy. Phase 8 owns application state and timeline only. Observability remains Phase 9.

Decision:
Expose lifecycle through a command group.

Reason:
`jobflow lifecycle create`, `jobflow lifecycle transition`, and `jobflow lifecycle timeline` cover the expected Phase 8 workflows while keeping CLI responsibilities limited to parsing, invocation, and display.

## Testing Summary

Tests added:

```text
tests/unit/domain/applications/application-state-machine.test.ts
tests/unit/services/lifecycle/state-transition.validator.test.ts
tests/unit/services/lifecycle/lifecycle.service.test.ts
tests/unit/use-cases/create-application.use-case.test.ts
tests/unit/use-cases/transition-application-state.use-case.test.ts
tests/unit/use-cases/get-application-timeline.use-case.test.ts
tests/integration/repositories/application.repository.test.ts
tests/integration/repositories/application-event.repository.test.ts
tests/integration/cli-lifecycle.test.ts
```

Test coverage added for:

- Approved lifecycle state path
- Invalid transition rejection
- Manual override reason enforcement
- Application creation
- Initial event creation
- State transition event creation
- Snapshot state update orchestration
- Timeline reconstruction
- Timeline ordering
- Application repository mapping
- Application event repository mapping
- Use-case orchestration
- Lifecycle CLI parsing and output

Test results:

```text
91 test files passed
154 tests passed
```

Phase 8 focused test result:

```text
9 test files passed
17 tests passed
```

## Project Metrics

Files Created:
22

Files Modified:
5

Directories Created:
4

Test Files Added:
9

Tests Added:
17

Commands Verified:
6

Documentation Files Updated:
3

## Risks Identified

Risk 1

Description:

```text
The database design document still describes the older lifecycle CHECK constraint and older state names, even though the hosted database has been aligned to the approved Phase 8 state model.
```

Impact:

```text
Medium
```

Mitigation:

```text
Run a documentation-maintenance pass to update docs/DATABASE.md and legacy examples in architecture/PRD documentation after Phase 8 review.
```

---

Risk 2

Description:

```text
Phase 8 creates lifecycle events explicitly through ApplicationEventRepository. If the hosted database audit trigger still inserts transition events automatically, live transitions could create duplicate transition events.
```

Impact:

```text
High
```

Mitigation:

```text
Before live lifecycle usage, verify whether trigger_audit_application_state is disabled, removed, or adjusted to avoid duplicate events when explicit service-created events are used.
```

---

Risk 3

Description:

```text
Application snapshot updates and event inserts are separate repository calls in the current TypeScript layer.
```

Impact:

```text
Medium
```

Mitigation:

```text
Introduce a transactional repository/RPC boundary in a future database hardening pass if live lifecycle writes require strict atomicity beyond mocked repository validation.
```

## Commands Executed

```bash
npm test -- tests/unit/domain/applications tests/unit/services/lifecycle tests/unit/use-cases/create-application.use-case.test.ts tests/unit/use-cases/transition-application-state.use-case.test.ts tests/unit/use-cases/get-application-timeline.use-case.test.ts tests/integration/repositories/application.repository.test.ts tests/integration/repositories/application-event.repository.test.ts tests/integration/cli-lifecycle.test.ts
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js lifecycle --help
```

## Completion Gate Evidence

Lint:
PASSED

Typecheck:
PASSED

Tests:
PASSED

Build:
PASSED

CLI Smoke Test:
PASSED

Completion gate command results:

```text
npm run lint                                      PASSED
npm run typecheck                                 PASSED
npm test                                          PASSED
npm run build                                     PASSED
node dist\src\cli\index.js lifecycle --help       PASSED
```

## Known Limitations

- No observability service was implemented.
- No analytics service was implemented.
- No ATS automation changes were implemented.
- No Playwright dependency or browser workflow was added.
- No live database writes were run in automated tests.
- No transactional lifecycle RPC was introduced.
- No database migration files were created in the repository.
- `docs/DATABASE.md` still shows older lifecycle state examples and should be updated after review.

## Lessons Learned

- The lifecycle domain becomes much clearer when the database state constraint and TypeScript state union use the exact same names.
- Event sourcing is easiest to test when state reconstruction is represented as pure domain behavior.
- Manual overrides need to be explicit because they bypass deterministic transition rules.
- Phase 8 should not share checkpoint responsibilities with ATS reliability; application events and ATS checkpoints are related but distinct histories.
- Existing database triggers must be accounted for when adding explicit event repositories.

## Next Phase Prerequisites

Before Phase 9 starts:

- User must explicitly approve Phase 9 progression.
- Phase 8 report must be committed to the repository.
- Phase 9 implementation must remain limited to Observability Service scope.
- Phase 9 may add execution log repositories, failure logs, screenshot log references, checkpoint log references, and execution ID propagation tests.
- Phase 9 must not implement analytics dashboards, reporting aggregation, final application submission, or live ATS automation.
