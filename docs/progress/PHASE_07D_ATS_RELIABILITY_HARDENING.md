# Phase 07D ATS Reliability Hardening

## Overview

Phase 7D implemented ATS Reliability Hardening for JobFlow AI.

The purpose of this phase was to add ATS-scoped reliability boundaries for failure capture, screenshot path safety, session path safety, checkpoint storage boundaries, retry policy, upload hardening, and cross-strategy failure handling.

Phase 7D did not implement lifecycle service, observability service, analytics, live ATS automation, real browser sessions, real credentials, production Workday progression, final submit behavior, or application submission.

## Objectives

Original Phase 7D goals:

- Failure capture boundary
- Screenshot path builder
- Session storage path handling
- Checkpoint persistence or checkpoint repository boundary
- Retry/stability policy
- Upload verification hardening
- Cross-strategy failure tests
- Security review for screenshots/session files
- Documentation updates
- Phase 7D report

## Implemented Components

Files created:

```text
src/domain/ats/ats-reliability.types.ts
src/services/ats/reliability/ats-failure-capture.ts
src/services/ats/reliability/ats-reliability.service.ts
src/services/ats/reliability/ats-checkpoint-store.interface.ts
src/services/ats/reliability/in-memory-ats-checkpoint-store.ts
src/services/ats/reliability/retry-policy.ts
src/services/ats/reliability/screenshot-path-builder.ts
src/services/ats/reliability/session-storage-path-builder.ts
tests/unit/services/ats/reliability/ats-failure-capture.test.ts
tests/unit/services/ats/reliability/ats-reliability.service.test.ts
tests/unit/services/ats/reliability/in-memory-ats-checkpoint-store.test.ts
tests/unit/services/ats/reliability/retry-policy.test.ts
tests/unit/services/ats/reliability/screenshot-path-builder.test.ts
tests/unit/services/ats/reliability/security-artifacts.test.ts
tests/unit/services/ats/reliability/session-storage-path-builder.test.ts
docs/progress/PHASE_07D_ATS_RELIABILITY_HARDENING.md
```

## Files Modified

Files modified:

```text
README.md
docs/TEST.md
src/domain/errors/application-error.ts
src/index.ts
tests/unit/services/ats/resume-upload-verifier.test.ts
```

## Architecture Decisions

Decision:
Keep reliability records ATS-scoped.

Reason:
Phase 7D must not become lifecycle or observability. Failure records are structured reliability artifacts only and do not write to application events or execution logs.

Decision:
Build screenshot and session paths without creating artifacts.

Reason:
Phase 7D validates safe path contracts while avoiding real screenshots, real browser sessions, cookies, or Playwright behavior.

Decision:
Use an `ATSCheckpointStore` interface with an in-memory implementation.

Reason:
This establishes the checkpoint boundary without introducing Supabase persistence, lifecycle state, or observability repositories before their approved phases.

Decision:
Keep retry policy pure and submit-aware.

Reason:
Retry behavior should be deterministic and must never retry unsafe submit-adjacent actions.

Decision:
Harden upload verification through tests around existing validation.

Reason:
The current verifier already validates PDF paths, resolves a semantic file input, uploads through the adapter boundary, and requires visible filename confirmation. Phase 7D added explicit non-PDF and traversal tests.

## Testing Summary

Tests added:

```text
tests/unit/services/ats/reliability/ats-failure-capture.test.ts
tests/unit/services/ats/reliability/ats-reliability.service.test.ts
tests/unit/services/ats/reliability/in-memory-ats-checkpoint-store.test.ts
tests/unit/services/ats/reliability/retry-policy.test.ts
tests/unit/services/ats/reliability/screenshot-path-builder.test.ts
tests/unit/services/ats/reliability/security-artifacts.test.ts
tests/unit/services/ats/reliability/session-storage-path-builder.test.ts
```

Existing tests modified:

```text
tests/unit/services/ats/resume-upload-verifier.test.ts
```

Test coverage added for:

- Controlled ATS failure record creation
- Secret redaction in failure messages
- Screenshot path generation under `storage/screenshots/`
- Screenshot path traversal rejection
- Session storage path generation under `storage/playwright-state/`
- Session path traversal rejection
- In-memory ATS checkpoint storage and latest lookup
- Retryable failure retry decisions
- Max-attempt retry stop behavior
- Unsafe submit retry prevention
- ATS reliability service coordination
- Cross-strategy failure capture for Greenhouse, Lever, Generic, and Workday
- `.gitignore` protection for screenshots and session storage
- Non-PDF upload rejection
- Upload path traversal rejection

Test results:

```text
Focused ATS suite:
22 test files passed
39 tests passed

Full suite:
82 test files passed
137 tests passed
```

## Project Metrics

Files Created:
16

Files Modified:
5

Directories Created:
1

Test Files Added:
7

Tests Added:
14

Commands Verified:
5

Documentation Files Updated:
3

## Risks Identified

Risk 1

Description:

```text
Failure capture records are intentionally not persisted to Supabase in Phase 7D.
```

Impact:

```text
Medium
```

Mitigation:

```text
Introduce observability repositories only in Phase 9, using the reliability boundary as input.
```

---

Risk 2

Description:

```text
Screenshot and session builders validate paths but do not create real screenshots or browser sessions.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add browser-adapter fixture tests only after Playwright usage is explicitly approved.
```

---

Risk 3

Description:

```text
The retry policy is pure and does not yet coordinate real browser timing or DOM stability.
```

Impact:

```text
Medium
```

Mitigation:

```text
Wire retry policy into approved browser adapters later, keeping final-submit guardrails mandatory.
```

## Commands Executed

```bash
npm run typecheck
npm test -- tests/unit/services/ats
npm run lint
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
npm run typecheck                           PASSED
npm test -- tests/unit/services/ats         PASSED
npm run lint                                PASSED
npm test                                    PASSED
npm run build                               PASSED
node dist\src\cli\index.js apply --help     PASSED
```

## Known Limitations

- No lifecycle service was implemented.
- No observability service was implemented.
- No analytics service was implemented.
- No live ATS automation was implemented.
- No real credentials were used.
- No real browser sessions were created.
- No Playwright dependency was added.
- No screenshot files are captured.
- No session files are created.
- No checkpoint repository or Supabase persistence was added.
- No production Workday progression was implemented.
- No final submit behavior was implemented.
- No application submission was implemented.

## Lessons Learned

- Reliability boundaries are useful before browser automation because they make safety contracts explicit.
- Screenshot and session path builders should reject unsafe input before any real artifact creation exists.
- In-memory checkpoint storage is enough to test the boundary without leaking into lifecycle or observability.
- Retry policy must know about submit-adjacent risk so reliability does not become unsafe persistence.

## Next Phase Prerequisites

Before Phase 8 starts:

- User must explicitly approve Phase 8 progression.
- Phase 7D report must be committed to the repository.
- Phase 8 implementation must remain limited to lifecycle tracking.
- Phase 8 may add application state machine, transition validator, application repository, and application event repository.
- Phase 8 must not implement observability service, analytics service, final application submission, or live ATS automation without explicit approval.
