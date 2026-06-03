# Production Readiness Validation Plan

## Executive Summary

JobFlow AI has completed Phase 00 through Phase 10 and now needs a formal production readiness validation model before any real usage or production-candidate claim.

This plan defines a three-stage gated validation environment:

```text
Stage 1 - Local Deterministic Validation
Stage 2 - Staging Integration Validation
Stage 3 - Production Readiness Validation
```

The validation model proves the platform is safe, stable, traceable, and ready for controlled release evaluation without changing production behavior.

This document is planning only. It does not add CI changes, staging credentials, live tests, migrations, production code, or deployment behavior.

## Validation Philosophy

Validation must follow the same engineering discipline used throughout JobFlow AI:

- Deterministic validation before live validation.
- Mock-first testing before staging integration.
- Staging validation before production readiness.
- Read-only production checks by default.
- Explicit approval before any live provider usage.
- Explicit approval before any production database write.
- Explicit approval before any final ATS submission.
- No credentials, tokens, cookies, service role keys, provider keys, or session state in logs.
- One failed critical gate blocks progression to the next stage.

Passing Phase 10 does not mean the product is production-ready. Production readiness requires passing this validation model and documenting the results.

## Stage 1 - Local Deterministic Validation

Purpose:

```text
Validate all code, architecture, tests, security scans, CLI smoke tests, and mock-first behavior locally.
```

Allowed:

- Lint.
- Typecheck.
- Unit tests.
- Integration tests with mocked repositories and mocked providers.
- CLI smoke tests.
- Architecture boundary scans.
- Security scans.
- Artifact tracking checks.
- Local generated artifacts under ignored storage paths.

Forbidden:

- Live Supabase calls.
- Live provider calls.
- Live embedding calls.
- Live ATS sites.
- Real credentials.
- Real browser sessions.
- Final ATS submission.
- Production database writes.

Required local gates:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Required CLI smoke tests after build:

```bash
node dist\src\cli\index.js --help
node dist\src\cli\index.js discover --help
node dist\src\cli\index.js parse --help
node dist\src\cli\index.js score --help
node dist\src\cli\index.js fragments --help
node dist\src\cli\index.js generate --help
node dist\src\cli\index.js render --help
node dist\src\cli\index.js apply --help
node dist\src\cli\index.js lifecycle --help
node dist\src\cli\index.js observability --help
node dist\src\cli\index.js analytics --help
```

Required architecture scans:

```bash
rg "@supabase|createSupabaseClient|\.from\(|\.rpc\(" src
rg "process\.env|loadEnvFile|node:process" src
rg "console\.|from\(|rpc\(|fetch\(" src\cli src\services src\domain src\use-cases
rg "@supabase|node:process|loadEnv|OpenAI|fetch|fs|playwright|process\.env" src\domain src\services src\use-cases
```

Required security and artifact scans:

```bash
git ls-files .env storage screenshots dist
rg "SUPABASE_SERVICE_ROLE_KEY|LLM_API_KEY|sk-[A-Za-z0-9]|service_role|Bearer [A-Za-z0-9]" --glob "!dist/**" --glob "!node_modules/**"
```

Acceptance criteria:

- Lint passes.
- Typecheck passes.
- Full test suite passes.
- Build passes.
- CLI smoke tests pass.
- No forbidden Supabase access outside repositories.
- No business logic in CLI.
- No provider logic in domain.
- No direct environment access outside config.
- No secrets are printed or tracked.
- No generated artifacts are tracked.
- ATS tests remain mock-first and fixture-driven.
- No final submit behavior exists.

Stage 1 exit verdict:

```text
PASS
FAIL
BLOCKED
```

## Stage 2 - Staging Integration Validation

Purpose:

```text
Validate controlled integration behavior using staging-safe credentials and non-production resources.
```

Allowed:

- Staging Supabase validation.
- Read-only schema checks.
- Optional safe write tests using disposable staging records.
- Mock or fake provider tests.
- Controlled LLM smoke test only if explicitly approved.
- Rendering artifact validation using local ignored storage.
- Observability and lifecycle consistency checks.
- Analytics checks against staging-safe records.

Forbidden:

- Production database writes.
- Real ATS submissions.
- Real credentials in logs.
- Unapproved live provider usage.
- Live ATS website automation.
- Final ATS submission.
- Browser sessions using real job application accounts.

Required staging database checks:

- Verify `applications`.
- Verify `application_events`.
- Verify `execution_logs`.
- Verify `automation_checkpoints`.
- Verify `jobs`.
- Verify `parsed_job_profiles`.
- Verify `job_match_scores`.
- Verify `generated_documents`.
- Verify `generated_resumes`.
- Verify `application_summary_view`.
- Verify `application_state_counts_view`.
- Verify `platform_performance_view`.
- Verify lifecycle state constraint.
- Verify lifecycle timeline index.
- Verify trigger removal remains true for lifecycle duplicate-writer prevention.

Optional staging write checks:

- Must use disposable records.
- Must include a unique validation run id.
- Must clean up after execution.
- Must not use production data.
- Must not use user-owned live ATS data.
- Must require explicit user approval before running.

Provider validation:

- Mock provider tests remain the default.
- Controlled live provider smoke tests require explicit user approval.
- Live provider smoke tests must use safe prompts and non-sensitive fixture data.
- Live provider smoke tests must have a budget cap and log sanitization.
- Provider output must not be treated as production content.

Rendering validation:

- Use fixture `ResumeJson`.
- Generate artifacts under ignored local storage.
- Validate `resume.json`, `resume.tex`, `resume.pdf`, and `metadata.json`.
- Confirm generated artifacts are not tracked.
- Do not require production artifact storage.

Lifecycle and observability consistency checks:

- Confirm lifecycle transitions create application events.
- Confirm execution IDs remain traceable where present.
- Confirm failure and checkpoint records are sanitized.
- Confirm analytics can handle tracked and untracked records.

Acceptance criteria:

- Staging schema matches repository expectations.
- No lifecycle duplicate-writer risk is present.
- Optional disposable writes, if approved, complete and clean up safely.
- Observability records preserve execution traceability without secrets.
- Analytics summaries compute from staging-safe records.
- Rendering artifacts are valid and ignored.
- No live ATS submission occurs.

Stage 2 exit verdict:

```text
PASS
FAIL
BLOCKED
NOT RUN
```

## Stage 3 - Production Readiness Validation

Purpose:

```text
Validate JobFlow AI as a release candidate before real use.
```

Allowed:

- Full regression suite.
- CI green check.
- Read-only production schema verification.
- Lifecycle consistency validation.
- Observability traceability validation.
- Analytics correctness validation.
- Security audit.
- Manual acceptance checklist.
- Rollback plan review.
- Known limitations review.
- Go/no-go decision.

Forbidden by default:

- Production database writes.
- Final ATS submission.
- Live ATS automation against real applications.
- Unapproved live provider usage.
- Credential exposure.
- Unreviewed migrations.
- Deployment without rollback plan.

Production-readiness gates:

- Stage 1 has passed.
- Stage 2 has passed or documented as intentionally not run with user approval.
- CI is green.
- Production schema verification passes.
- Lifecycle state model and event model are aligned.
- Observability traceability works for current production-candidate scope.
- Analytics produces safe aggregate summaries only.
- Security audit finds no critical or high unresolved issues.
- Manual acceptance checklist is complete.
- Rollback plan is documented.
- Known limitations are documented.

Stage 3 exit verdict:

```text
GO
NO-GO
CONDITIONAL GO
BLOCKED
```

## Required Commands

Stage 1 commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js --help
node dist\src\cli\index.js discover --help
node dist\src\cli\index.js parse --help
node dist\src\cli\index.js score --help
node dist\src\cli\index.js fragments --help
node dist\src\cli\index.js generate --help
node dist\src\cli\index.js render --help
node dist\src\cli\index.js apply --help
node dist\src\cli\index.js lifecycle --help
node dist\src\cli\index.js observability --help
node dist\src\cli\index.js analytics --help
```

Stage 1 scan commands:

```bash
rg "@supabase|createSupabaseClient|\.from\(|\.rpc\(" src
rg "process\.env|loadEnvFile|node:process" src
rg "console\.|from\(|rpc\(|fetch\(" src\cli src\services src\domain src\use-cases
rg "@supabase|node:process|loadEnv|OpenAI|fetch|fs|playwright|process\.env" src\domain src\services src\use-cases
git ls-files .env storage screenshots dist
rg "SUPABASE_SERVICE_ROLE_KEY|LLM_API_KEY|sk-[A-Za-z0-9]|service_role|Bearer [A-Za-z0-9]" --glob "!dist/**" --glob "!node_modules/**"
```

Stage 2 commands:

```text
To be implemented only after approval.
```

Stage 3 commands:

```text
To be implemented only after approval.
```

## Required Environment Variables

Stage 1 placeholder environment:

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

Stage 2 staging environment:

```text
NODE_ENV=staging
LOG_LEVEL=silent
SUPABASE_URL=<staging_supabase_url>
SUPABASE_ANON_KEY=<staging_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<staging_service_role_key_if_explicitly_approved>
LLM_PROVIDER=<mock_or_approved_provider>
LLM_BASE_URL=<mock_or_approved_base_url>
LLM_API_KEY=<mock_or_approved_key>
LLM_MODEL=<mock_or_approved_model>
```

Stage 3 production-readiness environment:

```text
NODE_ENV=production
LOG_LEVEL=silent
SUPABASE_URL=<production_supabase_url>
SUPABASE_ANON_KEY=<production_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<production_service_role_key_only_if_explicitly_approved>
LLM_PROVIDER=<approved_provider_only_if_live_smoke_is_approved>
LLM_BASE_URL=<approved_base_url_only_if_live_smoke_is_approved>
LLM_API_KEY=<approved_key_only_if_live_smoke_is_approved>
LLM_MODEL=<approved_model_only_if_live_smoke_is_approved>
```

Production validation must prefer read-only credentials wherever possible.

## Security Rules

- Never commit `.env`.
- Never commit provider keys.
- Never commit Supabase service role keys.
- Never commit cookies.
- Never commit browser session files.
- Never commit generated PDFs or artifacts.
- Never print full environment objects.
- Never print authorization headers.
- Never print raw observability metadata if it may contain secrets.
- Never print raw checkpoint payloads.
- Never expose raw failure context without sanitization.
- Keep staging and production credentials separate.
- Rotate any credential that appears in logs.

Security gates:

- Secret scan passes.
- Artifact tracking scan passes.
- CLI output sanitization passes.
- Observability sanitization passes.
- Analytics output uses aggregate safe fields only.
- ATS submit guard remains enforced.

## Database Rules

Stage 1:

- No live database calls.
- Repository tests use mocked Supabase clients.

Stage 2:

- Use staging Supabase only.
- Prefer read-only schema checks.
- Optional writes require disposable records and explicit approval.
- Cleanup must be verified after optional staging writes.

Stage 3:

- Production checks are read-only by default.
- No production writes without explicit approval.
- No migrations during validation unless separately approved.
- Schema drift blocks production readiness.
- Lifecycle duplicate-writer risks block production readiness.
- RLS and permission drift blocks production readiness.

## Provider Rules

- Mock providers are the default.
- Live provider smoke tests require explicit approval.
- Live provider smoke tests must use non-sensitive fixture data.
- Live provider smoke tests must have budget and rate limits.
- Provider output must not be logged raw if it contains sensitive content.
- Provider failures must be captured through sanitized observability records.
- No provider call may bypass the provider boundary.

## ATS Safety Rules

- No final ATS submission.
- No final submit click.
- No live ATS site in automated validation.
- Local mock fixtures remain the automated test source.
- Human approval boundary remains mandatory.
- Real ATS validation, if ever approved, must stop at `HUMAN_APPROVAL_REQUIRED`.
- Session state and screenshots must remain local and ignored.
- Any real ATS validation must use a non-submission test scenario approved by the user.

## Manual Acceptance Checklist

Manual acceptance must confirm:

- README accurately describes current product status.
- `CODEX_MASTER.md` governance still matches implementation.
- `docs/TEST.md` matches the validation model.
- CI has a green result.
- Local deterministic validation has passed.
- Staging validation has passed or is explicitly deferred.
- Production schema verification has passed or is explicitly deferred.
- CLI help commands are available.
- Job discovery, parsing, scoring, generation, rendering, lifecycle, observability, and analytics commands are documented.
- ATS workflows still stop at human approval.
- No generated artifacts are tracked.
- No secrets are tracked.
- Known limitations are documented.
- Rollback plan is documented.

## Release Candidate Checklist

Release candidate approval requires:

- 100% critical checks pass.
- 100% high-priority checks pass.
- Full build passes.
- CI passes.
- No secret exposure.
- No architecture boundary violations.
- No Supabase access outside repositories.
- No business logic inside CLI.
- No provider boundary bypass.
- No ATS submit-guard violation.
- No lifecycle duplicate-writer risk.
- No analytics write behavior.
- No production database write without approval.
- Rollback plan exists.
- Known limitations are accepted by the user.

## Go / No-Go Criteria

GO:

- Stage 1 passes.
- Stage 2 passes or is explicitly deferred with documented rationale.
- Stage 3 passes.
- No critical or high unresolved risks remain.
- User approves release-candidate status.

CONDITIONAL GO:

- Only low or accepted medium risks remain.
- Limitations are documented.
- Rollback plan is ready.
- User explicitly accepts the constraints.

NO-GO:

- Any critical gate fails.
- Any high security risk remains unresolved.
- Any architecture boundary violation remains unresolved.
- Any production database mismatch remains unresolved.
- Any secret exposure is detected.
- Any final ATS submit behavior is detected.
- Rollback plan is missing.

BLOCKED:

- Required credentials, database access, CI result, or user approval is unavailable.

## Rollback Strategy

Rollback preparation must include:

- Identify the last known good commit.
- Confirm the local repository state is clean before release.
- Confirm no uncommitted generated artifacts exist.
- Confirm database migrations, if any, have a rollback path.
- Confirm staging records can be cleaned up.
- Confirm production validation uses read-only checks by default.
- Confirm provider credentials can be rotated if exposed.
- Confirm local storage artifacts can be removed safely.
- Confirm user can manually stop any approved live workflow before final submission.

Rollback actions:

- Revert to the last known good commit.
- Disable any newly approved live validation flow.
- Rotate exposed credentials if needed.
- Remove staging disposable records.
- Remove local generated artifacts.
- Re-run Stage 1 after rollback.

## Known Limitations

- This plan does not implement validation scripts.
- This plan does not create staging credentials.
- This plan does not add GitHub Actions changes.
- This plan does not run live tests.
- This plan does not validate production RLS policies directly.
- This plan does not validate deployment infrastructure.
- This plan does not create runbooks.
- This plan does not permit real ATS submission.
- This plan does not turn JobFlow AI into production SaaS.

## Implementation Plan

Recommended implementation sequence after approval:

1. Create Stage 1 local validation script or checklist runner.
2. Add deterministic architecture and security scan wrappers.
3. Add CLI smoke validation wrapper.
4. Add staging schema validation script with read-only mode.
5. Add optional staging disposable-record validation behind explicit approval flags.
6. Add provider smoke test harness with mock default and live opt-in.
7. Add release-candidate checklist document.
8. Add rollback checklist document.
9. Add CI enhancement proposal, but do not change CI until approved.
10. Run Stage 1 only after explicit approval.

Execution status:

```text
No validation stages were executed during this planning task.
Implementation requires explicit user approval.
```

Status:

```text
AWAITING USER APPROVAL
```
