# Phase 07B ATS Strategies

## Overview

Phase 7B implemented mock-driven Greenhouse, Lever, and conservative Generic ATS strategies for JobFlow AI.

The purpose of this phase was to validate strategy execution boundaries against local fixtures without introducing live ATS automation, real browser sessions, final submit behavior, Workday automation, lifecycle, observability, or analytics.

Phase 7B added a pure page-adapter boundary, strategy execution service, resume upload verification, safe screening-question handling, fixture-backed strategy tests, and documentation updates.

## Objectives

Original Phase 7B goals:

- Greenhouse strategy
- Lever strategy
- Conservative Generic strategy
- ATS page adapter interface
- ATS automation service
- Resume upload verifier
- Screening question handler
- Mock ATS fixtures
- Strategy tests
- Fixture-driven tests
- README and testing documentation updates
- Phase 7B report

## Implemented Components

Files created:

```text
src/services/ats/ats-page-adapter.interface.ts
src/services/ats/ats-interaction.types.ts
src/services/ats/ats-automation.service.ts
src/services/ats/resume-upload-verifier.ts
src/services/ats/screening-question-handler.ts
src/services/ats/strategies/strategy-field-utils.ts
src/services/ats/strategies/greenhouse.strategy.ts
src/services/ats/strategies/lever.strategy.ts
src/services/ats/strategies/generic.strategy.ts
tests/fixtures/ats/greenhouse/basic-application.html
tests/fixtures/ats/lever/basic-application.html
tests/fixtures/ats/generic/basic-application.html
tests/fixtures/ats/uploads/resume.pdf.placeholder
tests/unit/services/ats/support/fake-ats-page-adapter.ts
tests/unit/services/ats/support/ats-fixtures.ts
tests/unit/services/ats/ats-automation.service.test.ts
tests/unit/services/ats/resume-upload-verifier.test.ts
tests/unit/services/ats/screening-question-handler.test.ts
tests/unit/services/ats/strategies/greenhouse.strategy.test.ts
tests/unit/services/ats/strategies/lever.strategy.test.ts
tests/unit/services/ats/strategies/generic.strategy.test.ts
docs/progress/PHASE_07B_ATS_STRATEGIES.md
```

## Files Modified

Files modified:

```text
README.md
docs/TEST.md
src/domain/ats/ats.types.ts
src/domain/errors/application-error.ts
src/index.ts
src/services/ats/ats-strategy.interface.ts
src/use-cases/autofill-application.use-case.ts
tests/unit/use-cases/autofill-application.use-case.test.ts
```

## Architecture Decisions

Decision:
Introduce `ATSPageAdapter` instead of adding Playwright directly.

Reason:
Phase 7B must remain mock-first and fixture-driven. The adapter boundary keeps strategy business behavior testable without live sites, real browsers, credentials, or Playwright dependency.

Decision:
Route execution through `ATSAutomationService -> ATSStrategyRegistry -> ATSStrategy`.

Reason:
This preserves the approved architecture and prevents CLI or use-case code from becoming hidden ATS automation scripts.

Decision:
Keep Greenhouse, Lever, and Generic strategies fixture-backed only.

Reason:
Automated tests must not touch live ATS pages. Local fixtures validate field-selection behavior, resume upload verification, screening-question handling, and human approval boundaries deterministically.

Decision:
Make `GenericStrategy` conservative.

Reason:
Unknown ATS pages are risky. The generic strategy fills only obvious personal fields, skips ambiguous screening behavior, verifies resume upload, and always stops for manual review.

Decision:
Centralize resume upload verification and screening-question handling.

Reason:
Upload and screening behavior will be reused by future strategies. Shared helpers keep platform strategies focused and easier to test.

## Testing Summary

Tests added:

```text
tests/unit/services/ats/ats-automation.service.test.ts
tests/unit/services/ats/resume-upload-verifier.test.ts
tests/unit/services/ats/screening-question-handler.test.ts
tests/unit/services/ats/strategies/greenhouse.strategy.test.ts
tests/unit/services/ats/strategies/lever.strategy.test.ts
tests/unit/services/ats/strategies/generic.strategy.test.ts
```

Test coverage added for:

- ATS automation service strategy delegation
- Greenhouse fixture-driven field fill behavior
- Lever fixture-driven field fill behavior
- Conservative Generic fixture behavior
- Human approval stop status for every strategy
- Resume upload candidate resolution
- Resume upload visible filename verification
- Resume upload failure handling
- Safe screening-question answer matching
- Ambiguous or missing screening-question skip behavior
- Autofill use-case delegation to ATS automation service
- Fake ATS page adapter behavior for fixture tests

Test results:

```text
71 test files passed
115 tests passed
```

## Project Metrics

Files Created:
22

Files Modified:
8

Directories Created:
5

Test Files Added:
6

Tests Added:
8

Commands Verified:
5

Documentation Files Updated:
3

## Risks Identified

Risk 1

Description:

```text
Phase 7B strategies are validated against mock fixtures only, not live ATS sites.
```

Impact:

```text
Medium
```

Mitigation:

```text
Keep automated tests fixture-only and add any live validation only through explicitly approved manual workflows after safety boundaries mature.
```

---

Risk 2

Description:

```text
The ATSPageAdapter is intentionally pure and does not yet prove browser-adapter compatibility.
```

Impact:

```text
Medium
```

Mitigation:

```text
Introduce browser adapter tests in a future approved phase while preserving the same semantic locator and submit-guard contracts.
```

---

Risk 3

Description:

```text
GenericStrategy may skip legitimate fields when labels are not obvious.
```

Impact:

```text
Medium
```

Mitigation:

```text
Keep GenericStrategy conservative and expand fixture coverage only for deterministic, clearly labeled fields.
```

---

Risk 4

Description:

```text
Resume upload verification currently checks visible filename confirmation through the adapter boundary.
```

Impact:

```text
Medium
```

Mitigation:

```text
Future browser adapters must verify real upload completion signals in addition to filename visibility.
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

- No Workday implementation was added.
- No lifecycle service was added.
- No observability service was added.
- No analytics service was added.
- No Playwright dependency was added.
- No browser adapter was implemented.
- No live ATS website automation was implemented.
- No real credentials were used.
- No real browser sessions were created.
- No final submit behavior was implemented.
- No application submission was implemented.
- The `jobflow apply` CLI remains a safe scaffold and does not open a browser.

## Lessons Learned

- The adapter-first strategy keeps ATS behavior testable without pulling browser automation into services or CLI code.
- Local fixtures are enough to verify field selection, upload verification, screening-question handling, and human approval status.
- Centralized upload and screening helpers reduce duplication across platform strategies.
- Conservative Generic behavior is safer when ambiguity is represented as a skip rather than an inferred action.

## Next Phase Prerequisites

Before Phase 7C starts:

- User must explicitly approve Phase 7C progression.
- Phase 7B report must be committed to the repository.
- Phase 7C implementation must remain limited to Workday state machine scope.
- Phase 7C must use local mock Workday fixtures only for automated tests.
- Phase 7C must not implement lifecycle, observability service, analytics, final application submission, or live ATS automation without explicit approval.
