# Production Hardening Blocker Resolution Plan

## Executive Summary

Stage 03 Production Readiness Validation returned:

```text
NO-GO
```

This result is accepted.

JobFlow AI is currently classified as:

```text
Staging-validated Advanced Portfolio System
```

Target classification after this hardening plan:

```text
Production Candidate
```

This document defines a focused blocker-resolution plan only. It does not implement fixes, modify production code, run production queries, create migrations, change RLS policies, deploy, push to GitHub, or begin Phase 11.

The blocker set is concentrated around production proof, access policy verification, operational procedure maturity, credential governance, provider governance, and full execution trace coverage.

## Current Stage 3 Verdict

Stage 3 verdict:

```text
NO-GO
```

Release candidate status:

```text
NOT APPROVED
```

Primary reasons:

- Production RLS and access policies are not verified.
- Production read-only schema verification has not been completed.
- Remote GitHub Actions CI status was not verified.
- Release runbook is missing.
- Rollback runbook is missing.
- Incident response checklist is missing.
- Backup and restore validation is missing.
- Production credential and service-role usage rules are missing.
- Production provider approval and budget rules are missing.
- Execution ID propagation is not universal.

Stage 1 status:

```text
PASS
```

Stage 2 status:

```text
PASS
```

Stage 3 recheck requirement:

```text
Re-run Stage 3 only after the high-severity blockers are resolved or explicitly reclassified by user approval.
```

## Blocker Inventory

| Blocker | Stage 3 Severity | Category | Resolution Type |
| --- | --- | --- | --- |
| Production RLS/access policies not verified | High | Security / Database | Audit, policy design, verification |
| Production read-only schema verification not completed | High | Database | Read-only metadata verification |
| Remote GitHub Actions CI status not verified | Medium | Release | Remote CI evidence |
| Release runbook missing | High | Operations | Documentation and acceptance checklist |
| Rollback runbook missing | High | Operations | Documentation and controlled rehearsal |
| Incident response checklist missing | High | Operations / Security | Documentation and severity workflow |
| Backup/restore validation missing | High | Operations / Database | Backup audit and restore drill plan |
| Production credential/service-role usage rules missing | High | Security | Policy and environment governance |
| Production provider approval and budget rules missing | Medium | Provider / Cost / Safety | Policy and approval gates |
| Execution ID propagation not universal | Medium | Observability | Code follow-up after approval |

## Priority Classification

Priority 0 - Keep Current Safety Boundaries:

- No production writes.
- No migrations.
- No RLS changes.
- No deployment.
- No provider calls.
- No ATS submission.
- No GitHub push.

Priority 1 - Production Security and Database Proof:

1. Production RLS/access policy verification.
2. Production read-only schema verification.
3. Credential and service-role usage policy.

Priority 2 - Release Operations:

4. Remote CI verification.
5. Release runbook.
6. Rollback runbook.
7. Incident response checklist.
8. Backup and restore validation.

Priority 3 - Controlled Live Usage Governance:

9. Provider approval and budget policy.

Priority 4 - Trace Completeness Follow-Up:

10. Execution ID propagation across earlier workflows.

## Production RLS and Access Policy Plan

Goal:

```text
Prove that production database access boundaries are safe for the intended release scope.
```

Required planning decisions:

- Define whether JobFlow AI remains single-user CLI-only for production-candidate status.
- Define whether public API access should exist at all.
- Define whether `anon` and `authenticated` roles should have read or write access.
- Define whether event tables are service-only.
- Define whether generated document and resume content requires private access by default.

Objects to audit:

- `jobs`
- `parsed_job_profiles`
- `job_match_scores`
- `generated_documents`
- `generated_resumes`
- `applications`
- `application_events`
- `execution_logs`
- `automation_checkpoints`
- `user_profile`
- `user_resume_fragments`
- `ats_field_mappings`
- analytics views
- `match_resume_fragments`

Read-only verification requirements:

- RLS enabled or intentionally disabled with approved rationale.
- Policy definitions documented.
- Grants documented.
- Role access documented for `anon`, `authenticated`, `service_role`, and owner roles.
- Event tables protected from client-side writes.
- Observability tables protected from public reads.
- Resume/profile tables protected from public reads.

Proposed validation output:

```text
docs/progress/PRODUCTION_RLS_AND_ACCESS_POLICY_AUDIT.md
```

Exit criteria:

- No unknown RLS status remains.
- No public access exists unless explicitly justified.
- No service-role dependency exists in ordinary user-facing CLI flows unless explicitly approved.
- Any required RLS changes are documented separately and await approval before migration.

## Production Read-Only Schema Verification Plan

Goal:

```text
Verify production schema alignment without modifying production resources.
```

Allowed:

- Production read-only metadata queries.
- Table/view/column inventory.
- Constraint, index, trigger, function, extension, grant, RLS, and policy inspection.

Forbidden:

- Production writes.
- Production migrations.
- Disposable records.
- Schema changes.
- Trigger changes.
- RLS changes.

Required checks:

- Required tables exist.
- Required views exist.
- Required columns exist.
- Required constraints match staging.
- Required indexes exist.
- `trigger_audit_application_state` is absent.
- Approved lifecycle states are enforced.
- No forbidden lifecycle states exist in production database definitions.
- `platform_performance_view` uses `INTERVIEWING`, `OFFER`, and `HIRED`.
- `match_resume_fragments` exists.
- Extensions are available.
- Grants and RLS posture are documented.

Proposed validation output:

```text
docs/progress/PRODUCTION_READ_ONLY_SCHEMA_VERIFICATION.md
```

Exit criteria:

- Production schema matches the Stage 2 verified staging schema or every difference is documented and approved.
- No lifecycle drift exists.
- No duplicate lifecycle writer exists.
- No analytics source drift exists.

## Remote CI Verification Plan

Goal:

```text
Confirm that GitHub Actions CI is green remotely, not only mirrored locally.
```

Required evidence:

- Latest relevant GitHub Actions workflow run.
- Branch or commit SHA.
- Workflow name.
- Run timestamp.
- Result status.
- Confirmation that the workflow ran:
  - `npm ci`
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`

Acceptable verification methods:

- GitHub web UI screenshot or copied run summary.
- `gh run list` if GitHub CLI is installed and authenticated.
- GitHub Actions URL with run status.

Proposed validation output:

```text
docs/progress/REMOTE_CI_VERIFICATION.md
```

Exit criteria:

- Latest target commit has a green CI result.
- Any failed run is explained and superseded by a later passing run.

## Release Runbook Plan

Goal:

```text
Define a repeatable release-candidate procedure.
```

Required runbook sections:

- Release purpose.
- Release owner.
- Target commit.
- Branch status.
- Required approvals.
- Pre-release checks.
- Stage 1 evidence.
- Stage 2 evidence.
- Stage 3 evidence.
- CI evidence.
- Database verification evidence.
- Security verification evidence.
- Provider policy confirmation.
- ATS safety confirmation.
- Known limitations.
- Go/no-go signoff.

Proposed document:

```text
docs/progress/PRODUCTION_RELEASE_RUNBOOK.md
```

Exit criteria:

- A release can be reviewed using the runbook without relying on chat history.
- Every required release gate maps to an evidence artifact.
- No release step requires printing secrets.

## Rollback Runbook Plan

Goal:

```text
Define how to recover from a failed release-candidate validation or controlled production use.
```

Required runbook sections:

- Last known good commit.
- Local workspace cleanup.
- Artifact cleanup.
- Staging cleanup.
- Production no-write confirmation.
- Migration rollback rules if migrations are later approved.
- Credential rotation triggers.
- Provider disablement steps.
- Manual stop conditions.
- Post-rollback validation commands.
- Re-run Stage 1 requirement.

Proposed document:

```text
docs/progress/PRODUCTION_ROLLBACK_RUNBOOK.md
```

Exit criteria:

- Rollback process is documented.
- Rollback process is rehearsed in a non-production scenario.
- Rollback can be executed without guessing.

## Incident Response Plan

Goal:

```text
Define what to do when a production-candidate validation or controlled use fails.
```

Required incident categories:

- Credential exposure.
- Production database drift.
- Unexpected production write.
- Provider overuse or cost spike.
- ATS safety boundary violation.
- Artifact exposure.
- Observability secret exposure.
- Analytics raw metadata exposure.
- Failed release validation.
- Failed rollback.

Required checklist fields:

- Incident id.
- Severity.
- Detection source.
- Immediate containment action.
- Owner.
- Timeline.
- Affected systems.
- Credential rotation requirement.
- User notification requirement if applicable.
- Recovery action.
- Follow-up validation.

Proposed document:

```text
docs/progress/PRODUCTION_INCIDENT_RESPONSE_CHECKLIST.md
```

Exit criteria:

- Incident classes are documented.
- Critical containment steps are defined.
- Credential rotation triggers are explicit.

## Backup and Restore Validation Plan

Goal:

```text
Prove that data can be recovered or intentionally restored for the intended production-candidate scope.
```

Required checks:

- Supabase backup availability.
- Backup frequency.
- Backup retention.
- Point-in-time recovery availability if applicable.
- Manual schema dump option.
- Manual data dump option if approved.
- Restore target environment.
- Restore verification queries.
- Recovery time expectation.
- Recovery point expectation.

Validation approach:

1. Document production backup configuration.
2. Perform restore rehearsal in staging or a disposable restore project only.
3. Verify restored schema and selected non-sensitive records.
4. Document limitations.

Forbidden until separately approved:

- Restoring into production.
- Dumping sensitive production data into committed files.
- Committing backup artifacts.

Proposed document:

```text
docs/progress/BACKUP_AND_RESTORE_VALIDATION.md
```

Exit criteria:

- Backup source is known.
- Restore target is safe.
- Restore rehearsal passes or documented limitations are accepted.

## Credential and Service Role Policy Plan

Goal:

```text
Prevent credential misuse and avoid unnecessary service-role access.
```

Required policy decisions:

- Which env files are allowed locally.
- Which env files are allowed for staging.
- Which env files are allowed for production readiness.
- Whether production validation can use read-only credentials.
- When service-role credentials may be used.
- Who approves service-role usage.
- How credentials are rotated.
- How leaked credentials are handled.
- What may be logged.
- What must never be logged.

Required rules:

- `.env` remains untracked.
- `.env.staging.local` remains untracked.
- Production credentials remain separate from staging credentials.
- Service-role usage requires explicit approval.
- Production readiness should prefer read-only metadata access.
- No credential values are printed in reports.
- No full environment dumps are allowed.

Proposed document:

```text
docs/progress/PRODUCTION_CREDENTIAL_AND_SERVICE_ROLE_POLICY.md
```

Exit criteria:

- Credential classes are defined.
- Service-role usage is approval-gated.
- Rotation triggers are documented.
- Reports can mention variable names but not values.

## Provider Usage and Budget Policy Plan

Goal:

```text
Control live provider usage, cost, and safety before production-candidate workflows.
```

Known provider separation:

```text
Staging provider: ASI Cloud GPT OSS 120B
Production provider: Pioneer AI GPT 5.5
```

Required policy decisions:

- When staging provider smoke tests are allowed.
- When production provider smoke tests are allowed.
- Maximum prompt count.
- Maximum token or cost budget.
- Allowed fixture data.
- Forbidden sensitive data.
- Logging rules.
- Failure handling.
- Budget exceedance response.
- Provider disablement procedure.

Required rules:

- Mock providers remain default.
- Live provider use requires explicit approval.
- Production provider must not be called during staging validation.
- Provider keys must never be printed.
- Raw provider responses must not be logged if they may contain sensitive data.

Proposed document:

```text
docs/progress/PROVIDER_USAGE_AND_BUDGET_POLICY.md
```

Exit criteria:

- Provider use is approval-gated.
- Budget caps are documented.
- Safe fixture data is defined.
- Production provider use has a no-surprises policy.

## Execution ID Propagation Follow-Up Plan

Goal:

```text
Move execution ID propagation from partial to universal across current CLI workflows.
```

Current status:

```text
Execution ID continuity passed for Stage 2 observability records, but earlier workflows do not universally propagate execution IDs.
```

Required follow-up scope after approval:

- Inventory all CLI command entry points.
- Identify workflows without execution ID creation.
- Identify service/use-case chains without execution ID propagation.
- Define execution ID creation at use-case entry where missing.
- Ensure lifecycle events, execution logs, checkpoints, and analytics-compatible records share the same execution ID when part of one chain.
- Add tests for each updated command/use-case chain.

Candidate workflows to audit:

- Discovery.
- Parsing.
- Scoring.
- Fragment creation/retrieval.
- Document generation.
- Resume rendering.
- ATS apply flow.
- Lifecycle commands.
- Observability commands.
- Analytics commands where trace context is applicable.

Required test expectation:

```text
OBS-TRACE-FOLLOWUP
```

Expected result:

```text
A single execution chain creates or receives one execution_id and propagates it through all relevant records.
```

Proposed implementation phase:

```text
Production hardening follow-up, not Phase 11.
```

Exit criteria:

- No current CLI workflow silently omits execution ID where traceability is applicable.
- Analytics still supports historical untracked records.
- Existing Stage 1, Stage 2, and Stage 3 gates pass after implementation.

## Implementation Sequence

Recommended execution order:

1. Create credential and service-role policy.
2. Create provider usage and budget policy.
3. Perform production read-only schema verification.
4. Perform production RLS and access policy audit.
5. Create release runbook.
6. Create rollback runbook.
7. Create incident response checklist.
8. Create backup and restore validation plan and run staging restore rehearsal if approved.
9. Verify remote GitHub Actions CI status.
10. Implement execution ID propagation follow-up after separate approval.
11. Re-run Stage 1.
12. Re-run Stage 2 only if production hardening changes affect staging validation assumptions.
13. Re-run Stage 3.

Why this order:

```text
Credential and provider policies reduce risk before any production-adjacent verification. Database and RLS verification then address the highest release blockers. Operational runbooks convert validation evidence into repeatable procedures. Execution ID propagation follows after policy and verification work because it may require production code changes.
```

## Validation Gates

Gate 1 - Policy Readiness:

- Credential policy approved.
- Provider policy approved.
- No secrets printed.
- No production queries run.

Gate 2 - Production Read-Only Database Verification:

- Production connection is explicitly approved.
- Connection is read-only where possible.
- Schema verification passes.
- No production writes occur.

Gate 3 - Production RLS and Access Verification:

- RLS status documented.
- Policies documented.
- Grants documented.
- Any required changes are separated into a future approval step.

Gate 4 - Operational Runbook Readiness:

- Release runbook exists.
- Rollback runbook exists.
- Incident response checklist exists.
- Backup/restore validation plan exists.

Gate 5 - CI Evidence:

- Remote GitHub Actions run is green.
- Target commit is documented.

Gate 6 - Traceability Follow-Up:

- Execution ID propagation changes are implemented only after approval.
- Tests added.
- Regression passes.

Gate 7 - Stage 3 Recheck:

- Stage 1 remains PASS.
- Stage 2 remains PASS or is explicitly re-run if required.
- Stage 3 high-severity blockers are resolved.

## Go / No-Go Recheck Criteria

Stage 3 may move from `NO-GO` to `GO` only if:

- Production schema verification passes.
- Production RLS/access policy audit passes.
- Remote CI is confirmed green.
- Release runbook exists.
- Rollback runbook exists and has been rehearsed or explicitly accepted.
- Incident response checklist exists.
- Backup/restore validation is completed or explicitly accepted with limitations.
- Credential and service-role policy is approved.
- Provider usage and budget policy is approved.
- Execution ID propagation follow-up is complete or accepted as a documented medium-risk limitation.
- No critical or high unresolved risks remain.

Stage 3 may move to `CONDITIONAL GO` only if:

- No critical or high unresolved risks remain.
- Any remaining medium risks are explicitly accepted.
- Known limitations are documented.
- Rollback path is documented.

Stage 3 remains `NO-GO` if:

- Production RLS remains unknown.
- Production schema remains unverified.
- Remote CI remains unverified.
- Rollback plan remains missing.
- Any high security risk remains unresolved.

## Risks

Risk 1

Description:

```text
Production read-only verification may reveal schema or RLS drift from staging.
```

Impact:

```text
High
```

Mitigation:

```text
Treat drift as a separate remediation decision. Do not apply migrations automatically.
```

---

Risk 2

Description:

```text
Service-role credentials may be overused during validation.
```

Impact:

```text
High
```

Mitigation:

```text
Prefer read-only metadata access and require explicit approval for service-role usage.
```

---

Risk 3

Description:

```text
Provider smoke tests may create cost or expose sensitive prompt data if not controlled.
```

Impact:

```text
Medium
```

Mitigation:

```text
Keep mock providers as default and require budget caps, fixture data, and explicit approval for live provider calls.
```

---

Risk 4

Description:

```text
Execution ID propagation changes may touch multiple workflows and create regression risk.
```

Impact:

```text
Medium
```

Mitigation:

```text
Implement after approval with focused tests per workflow and re-run all validation gates.
```

---

Risk 5

Description:

```text
Runbooks may become paperwork unless tied to executable validation evidence.
```

Impact:

```text
Medium
```

Mitigation:

```text
Each runbook must include evidence links, commands, acceptance criteria, and a signoff checklist.
```

## Recommended Next Actions

Immediate next action:

```text
Approve the creation of the production hardening policy and runbook documents.
```

Recommended next planning/implementation bundle:

1. `PRODUCTION_CREDENTIAL_AND_SERVICE_ROLE_POLICY.md`
2. `PROVIDER_USAGE_AND_BUDGET_POLICY.md`
3. `PRODUCTION_RELEASE_RUNBOOK.md`
4. `PRODUCTION_ROLLBACK_RUNBOOK.md`
5. `PRODUCTION_INCIDENT_RESPONSE_CHECKLIST.md`
6. `PRODUCTION_READ_ONLY_SCHEMA_VERIFICATION.md`
7. `PRODUCTION_RLS_AND_ACCESS_POLICY_AUDIT.md`
8. `BACKUP_AND_RESTORE_VALIDATION.md`
9. `REMOTE_CI_VERIFICATION.md`

Recommended after policy/runbook approval:

```text
Run production read-only verification only after explicit user approval and with production-safe credentials.
```

Recommended after production verification:

```text
Plan execution ID propagation as a focused hardening implementation task, not as Phase 11.
```

Status:

```text
AWAITING USER APPROVAL
```
