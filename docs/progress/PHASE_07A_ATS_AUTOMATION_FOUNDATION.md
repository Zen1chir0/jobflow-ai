# Phase 07A ATS Automation Foundation

## Overview

Phase 7A implemented the ATS Automation Foundation for JobFlow AI.

The purpose of this phase was to establish deterministic, testable ATS automation boundaries before any browser-driven strategy work begins.

Phase 7A added ATS domain types, detection utilities, a strategy interface, a strategy registry, semantic locator foundations, submit safety guards, resume PDF path validation, an apply use-case scaffold, an apply CLI scaffold, mock fixture documentation, and tests.

No live ATS automation, Playwright dependency, real job-site automation, final submit behavior, Greenhouse/Lever/Generic execution strategy, Workday state machine, lifecycle service, observability service, or analytics service was implemented.

## Objectives

Original Phase 7A goals:

- Add pure ATS domain types
- Add ATS detector
- Add ATS strategy interface
- Add ATS strategy registry
- Add semantic locator foundation
- Add submit guard
- Add resume PDF path validator
- Add `AutofillApplicationUseCase` scaffold
- Add `jobflow apply --help` scaffold
- Add fixture directory documentation only
- Add unit and integration tests
- Update README and `docs/TEST.md`
- Generate Phase 7A report

## Implemented Components

Files created:

```text
src/domain/ats/ats.types.ts
src/services/ats/ats-strategy.interface.ts
src/services/ats/ats-type-detector.ts
src/services/ats/ats-strategy-registry.ts
src/services/ats/semantic-locator.service.ts
src/services/ats/submit-guard.ts
src/services/ats/resume-pdf-path.validator.ts
src/use-cases/autofill-application.use-case.ts
src/cli/commands/apply.command.ts
tests/unit/services/ats/ats-type-detector.test.ts
tests/unit/services/ats/ats-strategy-registry.test.ts
tests/unit/services/ats/semantic-locator.service.test.ts
tests/unit/services/ats/submit-guard.test.ts
tests/unit/services/ats/resume-pdf-path.validator.test.ts
tests/unit/use-cases/autofill-application.use-case.test.ts
tests/integration/cli-apply.test.ts
tests/fixtures/ats/README.md
docs/progress/PHASE_07A_ATS_AUTOMATION_FOUNDATION.md
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
Keep Phase 7A free of Playwright dependencies.

Reason:
The approved phase scope is foundation-only. The semantic locator and strategy layers are represented as pure, mockable TypeScript interfaces/utilities so later browser adapters can be introduced without changing business logic.

Decision:
Implement ATS detection as deterministic URL/content signature matching.

Reason:
ATS detection is explicitly listed as deterministic work in `CODEX_MASTER.md`; it should not depend on AI or live site calls.

Decision:
Make `SubmitGuard` a centralized safety utility.

Reason:
The human approval boundary is non-negotiable. Final submit labels must be blocked consistently before any platform strategy exists.

Decision:
Keep the `apply` command as a scaffold.

Reason:
Phase 7A may expose `jobflow apply --help`, but it must not perform live ATS automation, browser execution, strategy execution, or final submission.

Decision:
Use mock fixture documentation only.

Reason:
Local ATS fixture structure belongs in Phase 7A, but concrete Greenhouse, Lever, Generic, and Workday fixtures become useful when their approved strategy phases begin.

## Testing Summary

Tests added:

```text
tests/unit/services/ats/ats-type-detector.test.ts
tests/unit/services/ats/ats-strategy-registry.test.ts
tests/unit/services/ats/semantic-locator.service.test.ts
tests/unit/services/ats/submit-guard.test.ts
tests/unit/services/ats/resume-pdf-path.validator.test.ts
tests/unit/use-cases/autofill-application.use-case.test.ts
tests/integration/cli-apply.test.ts
```

Test coverage added for:

- Greenhouse, Lever, Workday, and Generic ATS detection
- Strategy registry first-match resolution
- Generic strategy fallback behavior
- Semantic locator accessibility-first priority
- Semantic locator failure handling
- Final submit label blocking
- Safe non-submit foundation action handling
- Resume PDF path validation
- Directory traversal rejection
- Apply use-case scaffold orchestration
- Apply CLI option parsing and output

Test results:

```text
65 test files passed
107 tests passed
```

## Project Metrics

Files Created:
18

Files Modified:
5

Directories Created:
4

Test Files Added:
7

Tests Added:
13

Commands Verified:
5

Documentation Files Updated:
3

## Risks Identified

Risk 1

Description:

```text
The semantic locator foundation is intentionally adapter-free in Phase 7A, so later Playwright integration must preserve the same priority order.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add adapter-level tests in Phase 7B before concrete strategies depend on browser locators.
```

---

Risk 2

Description:

```text
The apply command currently returns a foundation plan only and does not load jobs, generated resumes, or application records.
```

Impact:

```text
Medium
```

Mitigation:

```text
Introduce repository-backed loading only when the approved strategy phase requires it, while preserving CLI -> Use Case -> Service boundaries.
```

---

Risk 3

Description:

```text
SubmitGuard currently blocks known final-submit labels, but future ATS pages may use platform-specific submit wording.
```

Impact:

```text
High
```

Mitigation:

```text
Expand submit-guard fixtures in Phase 7B and Phase 7C using local ATS mock pages before any browser strategy can run.
```

## Commands Executed

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js apply --help
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
npm run lint                                PASSED
npm run typecheck                           PASSED
npm test                                    PASSED
npm run build                               PASSED
node dist\src\cli\index.js apply --help     PASSED
```

## Known Limitations

- No Playwright dependency was added.
- No browser is opened by `jobflow apply`.
- No live ATS site is accessed.
- No Greenhouse execution strategy was implemented.
- No Lever execution strategy was implemented.
- No Generic execution strategy was implemented.
- No Workday state machine was implemented.
- No resume upload execution was implemented.
- No final submit behavior was implemented.
- No lifecycle service was implemented.
- No observability service was implemented.
- No analytics service was implemented.

## Lessons Learned

- The ATS foundation is safest when locator behavior is represented as a pure adapter boundary before introducing Playwright.
- Commander maps `--resume-pdf` to `resumePdf`, so CLI tests should protect option-to-use-case request mapping.
- Keeping the apply use case deterministic in Phase 7A prevents browser behavior from leaking into the scaffold.
- A centralized submit guard creates a clear safety checkpoint before concrete platform strategies exist.

## Next Phase Prerequisites

Before Phase 7B starts:

- User must explicitly approve Phase 7B progression.
- Phase 7A report must be committed to the repository.
- Phase 7B implementation must remain limited to Greenhouse, Lever, and conservative Generic strategies.
- Phase 7B must use local mock ATS fixtures only for automated tests.
- Phase 7B must not implement Workday, lifecycle, observability service, analytics, or final application submission.
