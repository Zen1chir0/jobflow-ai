# Phase 08 Database Audit

## Executive Summary

Audit status:

```text
PARTIALLY VERIFIED
```

The Phase 8 lifecycle implementation was reviewed against the available hosted Supabase metadata, `docs/DATABASE.md`, `docs/ARCHITECTURE.md`, `docs/progress/PHASE_08_LIFECYCLE.md`, and `CODEX_MASTER.md`.

The hosted Supabase REST OpenAPI metadata confirms that the `applications` and `application_events` tables are exposed and that their column shapes align with the Phase 8 repository implementation.

The exact required SQL audits for triggers, indexes, and CHECK constraints could not be executed from the current workspace because:

```text
psql is not installed locally
no direct PostgreSQL connection string is present in .env
information_schema and pg_catalog metadata are not exposed through Supabase REST
no read-only SQL metadata RPC exists in the hosted project
```

No database writes were performed.

No migrations were created.

No production code was modified.

No secrets were printed.

Primary concern:

```text
The existence and behavior of trigger_audit_application_state could not be independently verified. If the trigger still inserts lifecycle events while Phase 8 also creates events explicitly through ApplicationEventRepository, live lifecycle transitions can produce duplicate transition events.
```

Phase 9 readiness verdict:

```text
CONDITIONALLY READY FOR PHASE 9 PLANNING
```

Phase 9 planning may proceed after user approval, but live lifecycle write usage should wait until the trigger, constraint, and index audit is completed through Supabase SQL editor, direct read-only PostgreSQL access, or a dedicated read-only metadata RPC.

## Database State

Hosted metadata source used:

```text
Supabase PostgREST OpenAPI metadata
```

Read-only metadata result:

```text
applications table: exposed
application_events table: exposed
```

`applications` required columns from hosted metadata:

```text
id
job_id
current_state
```

`applications` exposed columns from hosted metadata:

```text
id
job_id
current_state
selected_resume_id
application_url
ats_type
notes
last_execution_id
created_at
updated_at
```

`application_events` required columns from hosted metadata:

```text
id
application_id
to_state
```

`application_events` exposed columns from hosted metadata:

```text
id
application_id
from_state
to_state
event_type
execution_id
metadata
created_at
```

Exposed RPC paths from hosted metadata:

```text
/rpc/match_resume_fragments
```

No lifecycle-specific read-only metadata RPC was available.

## Trigger Audit

Required SQL:

```sql
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN (
    'applications',
    'application_events'
);
```

Execution result:

```text
NOT EXECUTED FROM CURRENT WORKSPACE
```

Reason:

```text
Direct SQL metadata access is not available from the current local environment.
```

REST metadata check:

```text
information_schema.columns via Supabase REST returned 404 and is not exposed.
```

Question 1:

```text
Does trigger_audit_application_state still exist?
```

Answer:

```text
Not independently verifiable from the current workspace.
```

Question 2:

```text
Can the trigger create duplicate lifecycle events?
```

Answer:

```text
Yes, if trigger_audit_application_state still inserts application_events rows on applications.current_state updates while Phase 8 also creates transition events explicitly through ApplicationEventRepository.
```

Recommended trigger strategy:

```text
Use exactly one lifecycle event writer.
```

Preferred alignment with Phase 8 implementation:

```text
LifecycleService updates the application snapshot through ApplicationRepository and creates lifecycle events explicitly through ApplicationEventRepository.
```

If that strategy remains approved, the database trigger should be removed, disabled, or changed so it does not duplicate explicit lifecycle events.

## Schema Audit

Required applications SQL:

```sql
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;
```

Required application events SQL:

```sql
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'application_events'
ORDER BY ordinal_position;
```

Execution result:

```text
NOT EXECUTED FROM CURRENT WORKSPACE
```

Hosted OpenAPI metadata alignment:

```text
PASSED FOR COLUMN SHAPE
```

Question 3:

```text
Do applications and application_events match the current lifecycle implementation?
```

Answer:

```text
Yes for the exposed column shape used by Phase 8 repositories.
```

Notes:

- `applications.current_state` exists.
- `applications.job_id` exists.
- `applications.selected_resume_id` exists.
- `applications.application_url` exists.
- `applications.ats_type` exists.
- `applications.notes` exists.
- `applications.last_execution_id` exists.
- `application_events.application_id` exists.
- `application_events.from_state` exists.
- `application_events.to_state` exists.
- `application_events.event_type` exists.
- `application_events.execution_id` exists.
- `application_events.metadata` exists.
- `application_events.created_at` exists.

Question 4:

```text
Do the tables match docs/DATABASE.md?
```

Answer:

```text
Partially.
```

The table column model broadly matches `docs/DATABASE.md`, but the documented lifecycle state model and trigger strategy are stale relative to the approved Phase 8 implementation.

## Constraint Audit

Required SQL:

```sql
SELECT
  conname,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'applications'
  AND pg_get_constraintdef(c.oid) ILIKE '%current_state%';
```

Execution result:

```text
NOT EXECUTED FROM CURRENT WORKSPACE
```

User-provided database alignment status before Phase 8 implementation:

```text
applications_current_state_check matches the approved lifecycle model exactly.
```

Approved lifecycle model:

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

Question 6:

```text
Is there schema drift?
```

Answer:

```text
No column-shape drift was found from hosted OpenAPI metadata. Constraint and trigger drift could not be independently ruled out from the current workspace.
```

Question 9:

```text
Is a migration required?
```

Answer:

```text
Possibly.
```

A migration is required only if the SQL audit confirms one of the following:

- `applications_current_state_check` does not match the approved Phase 8 lifecycle state model.
- `trigger_audit_application_state` still creates duplicate lifecycle events.
- required timeline indexes are missing.

## Index Audit

Required SQL:

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN (
    'applications',
    'application_events'
);
```

Execution result:

```text
NOT EXECUTED FROM CURRENT WORKSPACE
```

Indexes documented in `docs/DATABASE.md`:

```text
idx_applications_job_id
idx_applications_current_state
idx_application_events_application_id
idx_application_events_created_at
```

Question 5:

```text
Are lifecycle timeline queries properly indexed?
```

Answer:

```text
Not independently verifiable from the current workspace.
```

Timeline query pattern used by Phase 8:

```text
application_events filtered by application_id and ordered by created_at
```

Recommended index to verify or add:

```sql
CREATE INDEX IF NOT EXISTS idx_application_events_application_id_created_at
ON application_events(application_id, created_at ASC);
```

No index changes were applied during this audit.

## Lifecycle Alignment Review

Question 1:

```text
Does trigger_audit_application_state still exist?
```

Answer:

```text
Unknown. Direct trigger metadata was not accessible from the current workspace.
```

Question 2:

```text
Can the trigger create duplicate lifecycle events?
```

Answer:

```text
Yes, if it still inserts application_events rows during applications.current_state updates.
```

Question 3:

```text
Do applications and application_events match the current lifecycle implementation?
```

Answer:

```text
Yes for exposed columns and repository mapping requirements.
```

Question 4:

```text
Do the tables match docs/DATABASE.md?
```

Answer:

```text
Partially. Column concepts match, but lifecycle state and trigger documentation are stale.
```

Question 5:

```text
Are lifecycle timeline queries properly indexed?
```

Answer:

```text
Unknown from hosted SQL metadata. A composite application_id plus created_at index should be verified.
```

Question 6:

```text
Is there schema drift?
```

Answer:

```text
No verified column drift. Trigger, constraint, and index drift remain unverified.
```

Question 7:

```text
Is there documentation drift?
```

Answer:

```text
Yes.
```

Question 8:

```text
Is lifecycle production-safe from a schema perspective?
```

Answer:

```text
Not yet proven.
```

The table shape is aligned, but production safety requires confirming that the trigger will not duplicate events and that timeline queries are properly indexed.

Question 9:

```text
Is a migration required?
```

Answer:

```text
Possibly, depending on direct SQL audit results.
```

Question 10:

```text
Is any cleanup required before Phase 9?
```

Answer:

```text
Yes. Documentation cleanup is required. Database cleanup may be required if the trigger or index audit confirms drift.
```

## Documentation Alignment Review

Documentation drift status:

```text
CONFIRMED
```

`docs/DATABASE.md` still documents older lifecycle states:

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

These conflict with the approved Phase 8 lifecycle model:

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

`docs/DATABASE.md` also documents `trigger_audit_application_state`, while Phase 8 implementation creates lifecycle events explicitly through `ApplicationEventRepository`.

Documentation update required:

- Update `docs/DATABASE.md` lifecycle state CHECK example.
- Update `docs/DATABASE.md` trigger strategy.
- Update lifecycle index recommendations.
- Review legacy state references in architecture and PRD documents.

## Risk Assessment

Risk 1

Classification:

```text
High
```

Finding:

```text
trigger_audit_application_state existence could not be independently verified.
```

Impact:

```text
The project cannot prove whether lifecycle events have a single source of truth in live database writes.
```

Recommendation:

```text
Run the trigger audit SQL in Supabase SQL editor or provide direct read-only PostgreSQL metadata access before live lifecycle usage.
```

---

Risk 2

Classification:

```text
High
```

Finding:

```text
If trigger_audit_application_state still inserts events, Phase 8 explicit event creation can duplicate lifecycle events.
```

Impact:

```text
Application timelines may show duplicate transitions, and future observability or analytics phases may calculate incorrect histories.
```

Recommendation:

```text
Choose one event writer. Prefer explicit LifecycleService event creation and remove, disable, or adjust the database trigger to avoid duplicate inserts.
```

---

Risk 3

Classification:

```text
Medium
```

Finding:

```text
The current_state CHECK constraint could not be independently verified during this audit.
```

Impact:

```text
If the hosted constraint differs from the TypeScript state model, live writes may fail or invalid states may be accepted.
```

Recommendation:

```text
Run the constraint audit SQL before production lifecycle writes. User-provided verification says the constraint is aligned, but this audit could not independently reproduce it.
```

---

Risk 4

Classification:

```text
Medium
```

Finding:

```text
Timeline index coverage could not be independently verified.
```

Impact:

```text
Timeline reconstruction may degrade as application_events grows.
```

Recommendation:

```text
Verify or add a composite index on application_events(application_id, created_at).
```

---

Risk 5

Classification:

```text
Medium
```

Finding:

```text
docs/DATABASE.md contains stale lifecycle states and trigger guidance.
```

Impact:

```text
Future migrations, audits, or onboarding may use outdated lifecycle assumptions.
```

Recommendation:

```text
Run a documentation-maintenance pass after this audit to align database documentation with Phase 8.
```

---

Risk 6

Classification:

```text
Informational
```

Finding:

```text
Hosted OpenAPI metadata confirms the lifecycle table column shape expected by Phase 8 repositories.
```

Impact:

```text
The implemented repository mappings are aligned with exposed hosted table metadata.
```

Recommendation:

```text
Keep repository tests mocked for CI and add explicitly approved live read-only schema checks only when database audit access is available.
```

## Recommendations

Recommended before live lifecycle usage:

1. Run the required trigger audit SQL in Supabase SQL editor.
2. Run the required applications and application_events schema audit SQL.
3. Run the required lifecycle constraint audit SQL.
4. Run the required index audit SQL.
5. Confirm whether `trigger_audit_application_state` exists.
6. If the trigger exists and inserts lifecycle events, remove, disable, or adjust it to prevent duplicate events.
7. Verify or add a composite timeline index on `application_events(application_id, created_at)`.
8. Update `docs/DATABASE.md` with the approved Phase 8 lifecycle model.
9. Update legacy lifecycle state references in architecture and PRD documentation.
10. Re-run this audit after SQL metadata access is available.

Recommended before Phase 9 implementation:

```text
Resolve the lifecycle event writer strategy so observability does not build on ambiguous or duplicated lifecycle histories.
```

## Phase 9 Readiness Verdict

Verdict:

```text
CONDITIONALLY READY FOR PHASE 9 PLANNING
```

Rationale:

- Phase 8 implementation passed its tests and completion gates.
- Hosted metadata confirms the lifecycle table column shape aligns with Phase 8 repositories.
- No production code, migrations, or writes were performed during this audit.
- Direct SQL verification of triggers, constraints, and indexes remains incomplete.
- Duplicate lifecycle event risk remains unresolved until trigger behavior is confirmed.
- Documentation drift is confirmed and should be corrected before long-term handoff or production lifecycle use.

Phase 9 planning may proceed after user approval.

Phase 9 implementation should not rely on production lifecycle event data until the trigger and index audit is completed.

Status:

```text
AWAITING USER APPROVAL
```
