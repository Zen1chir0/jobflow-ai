# Roadmap

This roadmap is written for open-source reviewers and contributors.

It separates completed engineering phases, current OSS submission work, future production hardening, and explicitly deferred product expansion.

## Current Classification

OSS-facing classification:

```text
Open Source Submission Readiness in progress
```

Production classification:

```text
Staging-validated Advanced Portfolio System
```

JobFlow AI is not production SaaS yet.

## Completed Engineering Phases

Completed:

```text
Phase 00 - Foundation
Phase 01 - Discovery
Phase 02 - Parsing
Phase 03 - Match Scoring
Phase 04 - Resume Intelligence
Phase 05 - Document Generation
Phase 06 - Resume Rendering
Phase 07A - ATS Foundation
Phase 07B - ATS Strategies
Phase 07C - Workday State Machine
Phase 07D - ATS Reliability
Phase 08 - Lifecycle
Phase 09 - Observability
Phase 10 - Analytics
```

Validation evidence:

```text
Stage 1 Validation: PASS
Stage 2 Validation: PASS
Stage 3 Production Readiness: NO-GO
```

Stage 3 is a `NO-GO` for Production SaaS readiness. It is not a blocker for OSS readiness.

## Current OSS Readiness Work

Priority 1 - Complete:

- MIT license.
- Contribution guide.
- Security policy.
- README rewrite.

Priority 2 - Complete:

- Installation guide.
- Environment setup guide.
- Architecture map.

Priority 3 - Complete:

- Demo workflow.
- Safe example data.
- Roadmap cleanup.

Priority 4 - Complete:

- Issue templates.
- Pull request template.
- OpenAI OSS narrative integration.

## Near-Term OSS Polish

Next OSS tasks after Priority 4:

- Add a fake-value `.env.example` before public submission.
- Run final OSS readiness review.
- Verify latest GitHub Actions status after user push.

## Future Production Hardening

Future production hardening should address:

- Production RLS and access policy audit.
- Production read-only schema verification.
- Remote CI evidence for target release commit.
- Release runbook.
- Rollback runbook.
- Incident response checklist.
- Backup and restore validation.
- Production credential and service-role usage policy.
- Provider usage and budget policy.
- Execution ID propagation follow-up.

Production hardening should remain approval-gated and separate from OSS polish.

## Deferred Product Expansion

Deferred until explicitly approved:

- Phase 11.
- Dashboard UI.
- External monitoring and alerting.
- Multi-user SaaS tenancy.
- Billing.
- Production deployment.
- Live ATS final submission.
- Autonomous job application submission.

## Safety Commitments

Project safety commitments:

- No final ATS submission automation exists.
- Human approval remains mandatory.
- Mock-first ATS validation remains the default.
- Analytics remains read-only.
- Provider calls stay behind integration boundaries.
- Secrets must not be committed.
- Production writes require explicit approval.

## What Contributors Should Prioritize

Good next contributions:

- Documentation clarity.
- Test coverage.
- Architecture boundary preservation.
- Safer local examples.
- CLI usability improvements.
- Deterministic service improvements.
- Observability trace consistency.

Contributions should not prioritize:

- Live ATS submission.
- Production deployment.
- Billing.
- Multi-user SaaS operations.
- Secret-bearing examples.
- Provider calls in automated tests.

## Recheck Criteria

Before marking OSS submission readiness complete:

- README is evaluator-ready.
- License exists.
- Contribution guide exists.
- Security policy exists.
- Installation guide exists.
- Environment setup guide exists.
- Architecture map exists.
- Demo workflow exists.
- Safe examples exist.
- Roadmap is current.
- Issue and PR templates exist.
- No credentials or private artifacts are tracked.
- Validation gates pass.

Required gates:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
