# Phase 07 Risk and Architecture Assessment

## Executive Summary

Final verdict:

```text
Proceed with Split Phase 7A-7D
```

Phase 7 is the highest-risk phase so far because it introduces browser automation against external, variable, session-sensitive systems. The documentation is clear that ATS automation must use Strategy Pattern, semantic locator resolution, session persistence, file upload verification, checkpointing, failure handling, screenshots, and a hard human approval boundary.

Implementing all of Phase 7 as one unit would create unnecessary risk. The safest strategy is to split Phase 7 into smaller stage-gated subphases:

```text
Phase 7A - ATS Foundation
Phase 7B - Greenhouse / Lever / Generic
Phase 7C - Workday State Machine
Phase 7D - Reliability Hardening
```

This split preserves the existing engineering discipline and allows the project to validate detection, strategy boundaries, semantic locators, and mock ATS fixtures before touching complex Workday flows.

## Phase 7 Complexity Assessment

ATS Detection:

```text
Medium complexity
```

Detection is deterministic and should remain URL/DOM based. Greenhouse, Lever, and Workday have known URL signatures, while Generic is a fallback. Risk comes from false positives and redirects.

ATS Strategy Registry:

```text
Medium complexity
```

The registry is architecturally straightforward, but must avoid becoming a universal ATS script. It should resolve one strategy and delegate all platform behavior.

Semantic Locator Layer:

```text
High complexity
```

Locator resolution must prioritize ARIA, labels, placeholders, associated text, data attributes, and only then CSS fallback. This layer is central to reliability and should be built before platform strategies depend on it.

Greenhouse Strategy:

```text
Medium complexity
```

Greenhouse is usually flat and predictable. It is a good first concrete strategy after the foundation.

Lever Strategy:

```text
Medium complexity
```

Lever is also relatively linear, but may include apply buttons, optional questions, and file upload variations.

Generic Strategy:

```text
Medium to High complexity
```

Generic must be conservative. The risk is over-automation on unknown pages. It should fill obvious fields only, upload visible resume inputs only, and always stop for review.

Workday State Machine:

```text
Very High complexity
```

Workday has dynamic rendering, multi-step navigation, login/session requirements, modal behavior, network-heavy transitions, and state-dependent screens. Treating Workday as a flat form would violate CODEX_MASTER.md and ATS_STRATEGIES.md.

Session Persistence:

```text
High complexity
```

Storage state is necessary for login-heavy ATS workflows, but cookies/session files are sensitive and must never be committed.

File Upload Handling:

```text
High complexity
```

Uploads must verify file existence, `.pdf` extension, input resolution, upload completion, and visible filename confirmation.

Checkpoint Recovery:

```text
High complexity
```

Checkpointing is mandatory in ATS_STRATEGIES.md, but full checkpoint persistence overlaps with observability and later lifecycle concerns. Phase 7 should define the boundary carefully.

Failure Handling:

```text
High complexity
```

Failures must be controlled, contextual, and recoverable. Silent Playwright failures are explicitly forbidden.

Screenshots:

```text
Medium to High complexity
```

Screenshots are required on failure, but they create sensitive local artifacts. They must stay under ignored storage and avoid accidental commits.

Reliability Hardening:

```text
Very High complexity
```

Real ATS pages are brittle. Reliability requires locator fallback discipline, mock pages, upload verification, session handling, checkpointing, and strict stop-before-submit behavior.

## Engineering Risk Assessment

Risk 1

Description:

```text
Phase 7 can accidentally become one large Playwright automation script.
```

Impact:

```text
High
```

Mitigation:

```text
Split Phase 7 and enforce ATSStrategy, ATSStrategyRegistry, SemanticLocatorService, and use-case boundaries before adding concrete strategies.
```

Risk 2

Description:

```text
Automation could accidentally click final submit controls.
```

Impact:

```text
High
```

Mitigation:

```text
Add explicit submit-button guard tests and require all strategies to end at HUMAN_APPROVAL_REQUIRED.
```

Risk 3

Description:

```text
Workday complexity could destabilize the entire phase.
```

Impact:

```text
High
```

Mitigation:

```text
Defer Workday to Phase 7C after foundation and simpler strategies pass their gates.
```

Risk 4

Description:

```text
Session state, screenshots, and uploaded files may contain sensitive data.
```

Impact:

```text
High
```

Mitigation:

```text
Keep artifacts under ignored storage paths, never log secrets, and add artifact path/security tests.
```

## Architecture Risk Assessment

Architecture risk:

```text
High if implemented as one phase, manageable if split.
```

Required architecture:

```text
CLI
Use Case
ATSAutomationService
ATSStrategyRegistry
ATSStrategy
Semantic Locator / Session / File Upload / Checkpoint helpers
Repository / Integration
```

Boundary risks:

- CLI could grow Playwright logic.
- Strategies could bypass semantic locators.
- Generic strategy could become too aggressive.
- Workday could bypass state-machine navigation.
- Failure logging/checkpointing could leak into ad hoc files instead of controlled service/repository boundaries.
- Screenshots and session files could be mishandled as ordinary artifacts.

Recommended boundaries:

- `src/cli/commands/apply.command.ts` only parses arguments, invokes use case, and displays controlled status.
- `AutofillApplicationUseCase` loads job, selected resume, and application data.
- `ATSAutomationService` coordinates strategy selection and execution.
- `ATSStrategyRegistry` resolves one strategy.
- Strategy classes contain platform-specific workflow only.
- `SemanticLocatorService` owns field resolution priority.
- File upload helper owns validation and upload verification.
- Session helper owns local storage state paths.
- Checkpoint/failure interfaces should be introduced as boundaries even if full observability persistence waits for later phases.

## Testing Risk Assessment

Testing risk:

```text
Very High without local mock ATS fixtures
```

Automated tests must not depend on live job sites.

Required testing approach:

- Unit test ATS detection rules.
- Unit test strategy registry resolution.
- Unit test semantic locator fallback ordering.
- Unit test final-submit guard behavior.
- Unit test upload path validation.
- Unit test Workday state transitions before browser flow tests.
- Integration test strategies against local static HTML fixtures.
- Use Playwright only against mock pages in automated tests.
- Do not require real credentials or real ATS sessions.

Testing complexity by target:

- Detection: low to medium.
- Registry: low.
- Semantic locator: high.
- Greenhouse/Lever/Generic mock pages: medium.
- Workday state machine: very high.
- Failure screenshots/checkpoints: high.

## Recommended Phase Structure

Recommended split:

```text
Phase 7A - ATS Foundation
Phase 7B - Greenhouse / Lever / Generic
Phase 7C - Workday State Machine
Phase 7D - Reliability Hardening
```

Rationale:

Phase 7A establishes safe architecture and boundaries.

Phase 7B validates practical autofill on simpler ATS flows.

Phase 7C isolates Workday complexity behind a state machine.

Phase 7D hardens screenshots, checkpoint recovery, failure handling, and reliability after basic flows exist.

This split does not change the product roadmap. It decomposes Phase 7 into safer internal gates.

## Recommended Milestones

Phase 7A - ATS Foundation:

- `ATSStrategy` interface
- ATS type detection utilities
- `ATSStrategyRegistry`
- `SemanticLocatorService`
- Applicant/profile input types
- Resume PDF path validation helper
- Submit guard utility
- Mock ATS HTML fixture structure
- `jobflow apply --help` CLI scaffold
- No live ATS automation

Phase 7B - Greenhouse / Lever / Generic:

- Greenhouse strategy against mock fixture
- Lever strategy against mock fixture
- Conservative Generic strategy against mock fixture
- Personal info autofill
- Resume upload verification
- Screening answer fill only when safely resolvable
- Human approval stop state
- No Workday implementation

Phase 7C - Workday State Machine:

- Workday state enum
- Workday transition validator
- Workday page-state detector
- Workday scaffold strategy
- Mock Workday multi-step fixture
- Login-required/session-required handling
- Checkpoint boundary for each state
- No aggressive production Workday claims

Phase 7D - Reliability Hardening:

- Failure capture boundary
- Screenshot path builder
- Checkpoint persistence or checkpoint repository boundary
- Session storage path handling
- Retry/stability policy
- Upload verification hardening
- Cross-strategy failure tests
- Security review for screenshots and session files

## Recommended Completion Gates

Phase 7A completion gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js apply --help
```

Additional evidence:

- Detection tests pass.
- Registry tests pass.
- Semantic locator ordering tests pass.
- Submit guard tests pass.
- No strategy clicks final submit.

Phase 7B completion gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Additional evidence:

- Greenhouse mock fixture passes.
- Lever mock fixture passes.
- Generic mock fixture passes.
- Upload verification tests pass.
- Human approval boundary tests pass.

Phase 7C completion gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Additional evidence:

- Workday state transition tests pass.
- Workday mock multi-step fixture passes.
- Checkpoint boundary tests pass.
- Login/session-required handling tests pass.

Phase 7D completion gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Additional evidence:

- Screenshot path/security tests pass.
- Failure handling tests pass.
- Session persistence path tests pass.
- Recovery/checkpoint tests pass.
- Security scan confirms no storage artifacts are tracked.

## Recommended Testing Strategy

Testing strategy:

```text
Mock-first, fixture-driven, no live ATS sites in automated tests.
```

Unit tests:

- ATS detection
- Strategy registry
- Semantic locator priority
- Field mapping resolution
- Submit guard
- File upload validation
- Workday state transitions
- Checkpoint payload construction
- Screenshot path generation

Integration tests:

- Greenhouse mock HTML page
- Lever mock HTML page
- Generic mock HTML page
- Workday mock multi-step flow
- Resume upload fixture
- Human approval stop behavior

E2E-style local tests:

- Use local static fixtures only.
- Do not use live job sites.
- Do not require real credentials.
- Do not persist real browser sessions in tracked paths.

Security tests:

- Verify `storage/playwright-state/` is ignored.
- Verify `storage/screenshots/` is ignored.
- Verify no screenshots or session files are tracked.
- Verify CLI output does not expose cookies, paths containing secrets, or credentials.

## Phase 7 Readiness Verdict

Final verdict:

```text
Proceed with Split Phase 7A-7D
```

Reason:

The project is ready to plan ATS automation, but not as one monolithic implementation phase. The safe path is to build the ATS foundation first, validate simpler strategies against mock pages, isolate Workday behind its own state-machine phase, and then harden failure handling, screenshots, sessions, and checkpoints.

Phase 7 should not begin implementation until the user explicitly approves Phase 7A planning or implementation.

Status:

```text
AWAITING USER APPROVAL
```

