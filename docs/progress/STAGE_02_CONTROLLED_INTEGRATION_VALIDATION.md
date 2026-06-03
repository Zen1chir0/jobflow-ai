# Stage 02 Controlled Integration Validation

## Executive Summary

Stage 2 validation status:

```text
PASS
```

Stage 2 Controlled Integration Validation was retried after:

- Stage 1 passed.
- The Lifecycle Alignment Audit passed.
- A dedicated staging Supabase project was prepared.
- `schema.sql` was restored to staging.
- `STAGING_CONNECTION_STRING` became available in a staging-marked environment file.

The validation used staging-safe configuration from:

```text
.env.example.local
```

The staging environment marker was confirmed:

```text
NODE_ENV=staging
```

Live staging verification passed for:

- required tables
- required views
- required column shape
- required indexes
- lifecycle state constraint
- trigger absence
- view state alignment
- function presence
- extension presence
- RLS status documentation
- legacy lifecycle state absence

Disposable staging validation passed for:

- database connectivity
- lifecycle records
- lifecycle events
- observability records
- execution ID continuity
- analytics views
- generated document records
- generated resume records
- cleanup

No production validation was performed.

No production provider calls were made.

No live ATS sites were contacted.

No final ATS submission was performed.

No GitHub push was run.

Final Stage 2 verdict:

```text
PASS
```

## Environment Verification

Environment verification result:

```text
PASSED
```

Environment file used:

```text
.env.example.local
```

Verified:

- `NODE_ENV=staging`.
- `STAGING_CONNECTION_STRING` exists.
- `STAGING_CONNECTION_STRING` uses Supabase Session Pooler.
- Required Supabase application variable names are present.
- Required provider variable names are present.
- `.env` was not used.
- Credential values were not printed.
- Provider keys were not printed.
- Supabase URL value was not printed.

Required application variables present:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STAGING_CONNECTION_STRING
LLM_PROVIDER
LLM_BASE_URL
LLM_API_KEY
LLM_MODEL
```

Tracking safety:

```text
.env.example.local is not tracked by Git.
```

Recommendation:

```text
Rename or copy this file to .env.staging.local for clearer long-term environment hygiene.
```

## Live Staging Verification Results

Live staging verification result:

```text
PASSED
```

REST reachability:

```text
PASSED
```

PostgreSQL metadata verification:

```text
PASSED
```

Required tables:

```text
applications                 PASSED
application_events           PASSED
execution_logs               PASSED
automation_checkpoints       PASSED
jobs                         PASSED
parsed_job_profiles          PASSED
job_match_scores             PASSED
generated_documents          PASSED
generated_resumes            PASSED
user_profile                 PASSED
user_resume_fragments        PASSED
```

Required views:

```text
application_summary_view         PASSED
application_state_counts_view    PASSED
platform_performance_view        PASSED
```

Required columns:

```text
applications                     PASSED
application_events               PASSED
execution_logs                   PASSED
automation_checkpoints           PASSED
jobs                             PASSED
parsed_job_profiles              PASSED
job_match_scores                 PASSED
generated_documents              PASSED
generated_resumes                PASSED
application_summary_view         PASSED
application_state_counts_view    PASSED
platform_performance_view        PASSED
```

Lifecycle state constraint:

```text
PASSED
```

Verified constraint:

```text
applications_current_state_check
```

Constraint contains:

```text
DISCOVERED
PARSED
SCORED
GENERATED
RENDERED
READY_FOR_APPLICATION
HUMAN_APPROVAL_REQUIRED
APPLIED
INTERVIEWING
OFFER
REJECTED
WITHDRAWN
HIRED
```

Trigger verification:

```text
PASSED
```

Result:

```text
No application lifecycle trigger was found.
trigger_audit_application_state is absent.
```

Index verification:

```text
PASSED
```

Required index present:

```text
idx_application_events_application_id_created_at
```

Additional verified indexes include:

```text
idx_application_events_application_id
idx_application_events_created_at
idx_applications_current_state
idx_applications_job_id
idx_execution_logs_execution_id
idx_execution_logs_created_at
idx_execution_logs_service
idx_execution_logs_status
```

View SQL verification:

```text
PASSED
```

`platform_performance_view` uses:

```text
INTERVIEWING
OFFER
HIRED
```

and does not use the legacy `INTERVIEW` token.

Function verification:

```text
PASSED
```

Required function present:

```text
match_resume_fragments
```

Extension verification:

```text
PASSED
```

Verified extensions:

```text
pg_stat_statements
pgcrypto
uuid-ossp
vector
```

Legacy lifecycle state search:

```text
PASSED
```

No live staging database object definitions referenced:

```text
ANALYZED
READY_TO_APPLY
AUTOFILL_STARTED
AUTOFILL_COMPLETED
SUBMITTED
ASSESSMENT
INTERVIEW
GHOSTED
```

RLS status:

```text
DOCUMENTED
```

RLS is disabled for the Stage 2 staging tables inspected.

This is acceptable for isolated Stage 2 validation, but it is not a production security posture.

## Database Validation Results

Database validation result:

```text
PASSED
```

Validated:

- REST connectivity.
- PostgreSQL metadata connectivity.
- Table access.
- View access.
- Column access.
- Foreign key-backed disposable records.
- Lifecycle event records.
- Observability records.
- Analytics source views.
- Cleanup behavior.

Disposable database run:

```text
PASSED
```

Disposable records created:

- 1 job.
- 1 parsed job profile.
- 1 job match score.
- 1 generated document.
- 1 generated resume.
- 1 application.
- 11 lifecycle events.
- 2 execution logs.
- 1 automation checkpoint.

All disposable records were cleaned up.

## Lifecycle Validation Results

Lifecycle validation result:

```text
PASSED
```

Validated with disposable staging records:

- Application creation.
- Application state update.
- Lifecycle event creation.
- Timeline event ordering data.
- Approved lifecycle path through `HIRED`.

Lifecycle final state:

```text
HIRED
```

Lifecycle events created:

```text
11
```

Lifecycle path validated:

```text
DISCOVERED
PARSED
SCORED
GENERATED
RENDERED
READY_FOR_APPLICATION
HUMAN_APPROVAL_REQUIRED
APPLIED
INTERVIEWING
OFFER
HIRED
```

## Observability Validation Results

Observability validation result:

```text
PASSED
```

Validated with disposable staging records:

- Execution log persistence.
- Failure record persistence.
- Checkpoint persistence.
- Sanitized failure fields.
- Execution ID continuity.

Execution logs created:

```text
2
```

Checkpoints created:

```text
1
```

OBS-TRACE-001 result:

```text
PASSED
```

Execution ID continuity:

```text
Execution Log:    PASSED
Failure Record:   PASSED
Checkpoint Record:PASSED
```

## Analytics Validation Results

Analytics validation result:

```text
PASSED
```

Validated with controlled disposable records:

- `application_summary_view`.
- `application_state_counts_view`.
- `platform_performance_view`.

Observed during disposable run:

```text
application_summary_view rows:      1
application_state_counts_view rows: 1
platform_performance_view rows:     1
```

This confirms that analytics source views can read staged lifecycle and pipeline records.

## Rendering Validation Results

Rendering validation result:

```text
PASSED
```

Validated:

- `generated_documents` accepts structured `resume_json` records.
- `generated_resumes` accepts rendered resume artifact metadata.
- Artifact path columns accept expected local storage paths.
- No local generated artifacts were created during this Stage 2 retry.
- No artifact files were committed.

Artifact tracking check:

```text
PASSED
```

Tracked sensitive/artifact files:

```text
None
```

## Provider Validation Results

Provider validation result:

```text
PASSED WITHOUT LIVE CALL
```

Provider configuration:

```text
Staging provider configured: yes
Staging model configured: yes
Production provider called: no
Live provider call made: no
```

Staging provider rule:

```text
ASI Cloud GPT OSS 120B is reserved for staging provider smoke only if explicitly required.
```

Production provider rule:

```text
Pioneer AI GPT 5.5 was not called.
```

No provider keys were printed.

No raw provider responses were logged.

## Security Validation Results

Security validation result:

```text
PASSED WITH STAGING RLS NOTE
```

Verified:

- `.env` was not used.
- `NODE_ENV=staging` was confirmed.
- Credential values were not printed.
- Supabase URL value was not printed.
- Provider keys were not printed.
- No production provider calls were made.
- No live ATS sites were contacted.
- No final ATS submission was performed.
- No GitHub push was run.
- No tracked `.env`, storage, screenshots, dist, `schema.sql`, or schema export artifacts were found.

RLS status:

```text
Disabled on inspected staging tables.
```

Interpretation:

```text
Acceptable for isolated Stage 2 staging validation only. Not acceptable as a production security posture.
```

## Cleanup Results

Cleanup result:

```text
PASSED
```

Cleanup summary:

```text
deleted execution logs:       2
deleted jobs:                 1
remaining jobs:               0
remaining applications:       0
remaining execution logs:     0
remaining checkpoints:        0
```

Cascade cleanup verified:

- Application cleanup via job delete.
- Lifecycle event cleanup via application cascade.
- Checkpoint cleanup via application cascade.
- Generated document/resume cleanup via job cascade.
- Parsed profile cleanup via job cascade.
- Match score cleanup via job cascade.

Execution logs were explicitly deleted before job cleanup because their foreign keys use `ON DELETE SET NULL`.

## Findings

Finding 1

Severity:

```text
Informational
```

Finding:

```text
RLS is disabled on inspected staging tables.
```

Impact:

```text
This is acceptable for isolated Stage 2 validation, but it must not be treated as production-ready security.
```

Root Cause:

```text
The restored staging schema is schema-validation oriented and does not define production RLS policies.
```

Recommended Fix:

```text
Keep Stage 2 isolated. Require a dedicated production RLS/security validation before production readiness.
```

---

Finding 2

Severity:

```text
Informational
```

Finding:

```text
.env.example.local currently contains staging-safe credentials and is untracked.
```

Impact:

```text
No repository exposure was found, but the filename reads like a template rather than a private staging environment file.
```

Root Cause:

```text
The staging credentials were placed in the available local staging template file.
```

Recommended Fix:

```text
Move or copy staging credentials into .env.staging.local for clarity and keep it untracked.
```

---

Finding 3

Severity:

```text
Informational
```

Finding:

```text
The first disposable validation SQL attempts failed due to validation-script issues before the successful deterministic run.
```

Impact:

```text
No product or database schema issue was found. Failed attempts did not commit useful disposable data and the final deterministic run cleaned up successfully.
```

Root Cause:

```text
The first SQL used ambiguous aliases and then psql variable syntax inside PL/pgSQL.
```

Recommended Fix:

```text
Use the final sequential PL/pgSQL validation pattern for future Stage 2 disposable checks.
```

## Risk Assessment

Critical risks:

```text
None
```

High risks:

```text
None
```

Medium risks:

```text
None
```

Low risks:

```text
None
```

Informational findings:

```text
3
```

Residual risk:

```text
Stage 2 validates controlled staging integration only. It does not prove production RLS, production credentials, production provider behavior, live ATS behavior, or Stage 3 release-candidate readiness.
```

## Stage 2 Verdict

Final Stage 2 verdict:

```text
PASS
```

Rationale:

- Environment was staging-marked.
- Live staging metadata verification passed.
- Required staging tables and views exist.
- Required column shapes are accessible.
- Required lifecycle constraint is aligned.
- Required lifecycle trigger is absent.
- Required timeline index exists.
- Required analytics views are accessible and aligned.
- No forbidden lifecycle states were found in live database definitions.
- Disposable lifecycle validation passed.
- Disposable observability validation passed.
- Execution ID continuity passed.
- Analytics source validation passed.
- Rendering metadata validation passed.
- Cleanup validation passed.
- No production systems were used.

## Stage 3 Eligibility

Stage 3 eligibility:

```text
ELIGIBLE FOR STAGE 3 PLANNING OR APPROVAL
```

Stage 3 has not started.

## Recommendations

Recommended next actions:

1. Review and approve this Stage 2 validation report.
2. Move staging credentials from `.env.example.local` to `.env.staging.local` for clearer hygiene.
3. Keep `.env.staging.local` untracked.
4. Do not begin Stage 3 until explicitly approved.
5. Treat RLS-disabled staging as validation-only, not production-ready.
6. For Stage 3, require production read-only verification, CI green check, security review, rollback plan, and go/no-go approval.

Status:

```text
AWAITING USER APPROVAL
```
