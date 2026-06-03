# Stage 02 Staging Supabase Setup Guide

## Recommended Approach

Recommended approach:

```text
Option A - Export/copy schema from the existing hosted Supabase project using Supabase CLI or pg_dump style workflow.
```

Use a schema-only export from the existing hosted project and restore it into a separate staging Supabase project.

Do not use production data for Stage 2.

Do not reuse production credentials for Stage 2.

Do not run this from Codex unless the user explicitly approves the connection and provides staging-safe credentials.

## Why Schema Dump Is Preferred

Schema dump is preferred because it reduces drift between:

- hosted tables
- views
- indexes
- constraints
- extensions
- RLS configuration
- trigger state
- repository expectations
- `docs/DATABASE.md`

Manual SQL generated from documentation is useful as a fallback, but it can miss hosted changes that are not fully represented in docs.

Primary reason:

```text
The hosted database is the source of truth for Stage 2.
```

Stage 2 should validate JobFlow AI against a staging copy of the actual schema, not a best-effort reconstruction.

## Required Tools

Required:

- Supabase CLI.
- PostgreSQL client tools.
- `psql`.
- Access to source project database connection string.
- Access to staging project database connection string.

Optional:

- `pg_dump`.
- `pg_restore`.
- Supabase SQL editor for verification queries.
- A local password manager for safe credential handling.

Tool checks:

```bash
supabase --version
psql --version
pg_dump --version
pg_restore --version
```

## Required Credentials

Required source credential:

```text
SOURCE_CONNECTION_STRING
```

Required staging credential:

```text
STAGING_CONNECTION_STRING
```

Required staging environment variables:

```text
NODE_ENV=staging
LOG_LEVEL=silent
SUPABASE_URL=<staging_supabase_url>
SUPABASE_ANON_KEY=<staging_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<staging_service_role_key_if_explicitly_approved>
LLM_PROVIDER=test
LLM_BASE_URL=https://example.com/v1
LLM_API_KEY=test-api-key
LLM_MODEL=test-model
```

Credential rules:

- Never paste credentials into committed files.
- Never print credentials in logs.
- Never commit `.env.staging.local`.
- Never reuse production credentials for Stage 2.
- Prefer staging read-only or least-privilege credentials for verification.
- Use staging service role credentials only for explicitly approved disposable write tests.

## Step-by-Step Export From Existing Project

Step 1 - Create a local scratch directory outside tracked source paths:

```bash
mkdir stage2-schema-export
cd stage2-schema-export
```

Step 2 - Export schema only from the source hosted project:

```bash
supabase db dump --db-url "<SOURCE_CONNECTION_STRING>" -f schema.sql
```

If supported by the installed CLI version, prefer an explicit schema-only flag:

```bash
supabase db dump --db-url "<SOURCE_CONNECTION_STRING>" --schema-only -f schema.sql
```

Alternative using `pg_dump`:

```bash
pg_dump --schema-only --no-owner --no-privileges --dbname "<SOURCE_CONNECTION_STRING>" --file schema.sql
```

Step 3 - Inspect the dump before restore:

```bash
psql --single-transaction --variable ON_ERROR_STOP=1 --file schema.sql --dbname "<STAGING_CONNECTION_STRING>" --set dry_run=on
```

If dry-run behavior is unavailable, inspect manually:

```bash
rg "COPY |INSERT INTO|SUPABASE_SERVICE_ROLE_KEY|LLM_API_KEY|Bearer |sk-" schema.sql
```

Expected:

```text
No data inserts.
No secrets.
No provider keys.
No service role keys.
No bearer tokens.
```

Step 4 - Keep the dump local and temporary.

Do not commit `schema.sql`.

Recommended cleanup after restore:

```bash
del schema.sql
```

PowerShell alternative:

```powershell
Remove-Item -LiteralPath .\schema.sql
```

## Step-by-Step Restore Into Staging Project

Step 1 - Create a separate Supabase staging project.

Required:

```text
The staging project must be separate from production.
```

Step 2 - Confirm the staging connection string points to the staging project.

Do not print the connection string.

Step 3 - Restore schema into staging:

```bash
psql --single-transaction --variable ON_ERROR_STOP=1 --file schema.sql --dbname "<STAGING_CONNECTION_STRING>"
```

Step 4 - Verify restore result with read-only SQL checks.

Step 5 - Create `.env.staging.local` with staging-safe values only.

Step 6 - Run Stage 2 read-only validation before any disposable write tests.

## Alternative Full Backup Workflow

If a full custom-format backup is required for extensions, ownership, or Supabase-specific objects, use:

```bash
pg_dump --format=custom --schema-only --no-owner --no-privileges --dbname "<SOURCE_CONNECTION_STRING>" --file schema.dump
```

Restore into staging:

```bash
pg_restore --single-transaction --exit-on-error --no-owner --no-privileges --dbname "<STAGING_CONNECTION_STRING>" schema.dump
```

Safety rule:

```text
Use schema-only backup unless the user explicitly approves another mode.
```

Never create a data backup for Stage 2 unless the user explicitly approves and confirms it contains no real user data.

## Post-Restore Verification Queries

Run these queries against the staging project.

### Tables

```sql
SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Required tables:

```text
applications
application_events
execution_logs
automation_checkpoints
jobs
parsed_job_profiles
job_match_scores
generated_documents
generated_resumes
user_profile
user_resume_fragments
```

### Views

```sql
SELECT
  table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
```

Required views:

```text
application_summary_view
application_state_counts_view
platform_performance_view
```

### Columns

```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'applications',
    'application_events',
    'execution_logs',
    'automation_checkpoints',
    'jobs',
    'parsed_job_profiles',
    'job_match_scores',
    'generated_documents',
    'generated_resumes'
  )
ORDER BY table_name, ordinal_position;
```

### Indexes

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Required lifecycle timeline index:

```text
application_events(application_id, created_at)
```

### Constraints

```sql
SELECT
  t.relname AS table_name,
  c.conname,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
ORDER BY t.relname, c.conname;
```

Required lifecycle state constraint values:

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

### Triggers

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

Expected lifecycle trigger state:

```text
trigger_audit_application_state must not exist.
```

Reason:

```text
Phase 8 creates lifecycle events explicitly through ApplicationEventRepository. A database trigger that also writes lifecycle events can create duplicate timeline entries.
```

### Extensions

```sql
SELECT
  extname,
  extversion
FROM pg_extension
ORDER BY extname;
```

Expected extensions should include all extensions required by the hosted schema, including vector support if resume fragment similarity search depends on pgvector.

### RLS Status

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Policy check:

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Stage 2 expectation:

```text
RLS behavior must be understood before any disposable write tests are approved.
```

## Environment File Setup

Create:

```text
.env.staging.local
```

Required contents:

```text
NODE_ENV=staging
LOG_LEVEL=silent
SUPABASE_URL=<staging_supabase_url>
SUPABASE_ANON_KEY=<staging_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<staging_service_role_key_if_approved>
LLM_PROVIDER=test
LLM_BASE_URL=https://example.com/v1
LLM_API_KEY=test-api-key
LLM_MODEL=test-model
```

Rules:

- `.env.staging.local` must be ignored by Git.
- Do not put production credentials in `.env.staging.local`.
- Use fake provider values unless live provider smoke tests are explicitly approved.
- Use `NODE_ENV=staging`.
- Use `LOG_LEVEL=silent` during validation unless debugging is explicitly approved.

Suggested ignore rule:

```text
.env*.local
```

Verify not tracked:

```bash
git ls-files .env.staging.local
```

Expected:

```text
No output.
```

## Rollback / Cleanup

Rollback rules:

- Delete temporary schema dumps after restore.
- Drop and recreate staging project if restore drift is severe.
- Remove disposable validation records after any approved write tests.
- Rotate any credential that was accidentally printed.
- Do not reuse staging data as production data.

Cleanup commands:

```powershell
Remove-Item -LiteralPath .\schema.sql
Remove-Item -LiteralPath .\schema.dump
```

If the staging project must be reset, prefer Supabase project reset tools or recreate the staging project from scratch.

## Fallback Manual SQL Strategy

Fallback approach:

```text
Option B - Generate manual SQL from docs/DATABASE.md.
```

Use only if schema dump is unavailable.

Manual SQL should be generated from:

```text
docs/DATABASE.md
docs/ARCHITECTURE.md
docs/progress/PHASE_08_DATABASE_AUDIT.md
docs/progress/PHASE_09_OBSERVABILITY.md
docs/progress/PHASE_10_ANALYTICS.md
```

Manual SQL must define:

- Extensions.
- Tables.
- Views.
- Indexes.
- Constraints.
- RLS state.
- Policies if required.
- RPC functions such as `match_resume_fragments`.

Manual SQL risk:

```text
Higher drift risk than schema dump.
```

Manual SQL acceptance criteria:

- All repository integration tests map to expected columns.
- Required views are present.
- Lifecycle state constraint matches approved model.
- `trigger_audit_application_state` is absent.
- Timeline index exists.
- Analytics views are present.
- RLS behavior is documented.

## Risks

Risk 1

Severity:

```text
High
```

Finding:

```text
Using manual SQL can recreate an outdated schema.
```

Impact:

```text
Stage 2 may validate against a schema that does not match the hosted project.
```

Recommendation:

```text
Prefer schema-only dump from the hosted source project.
```

---

Risk 2

Severity:

```text
High
```

Finding:

```text
A dump may accidentally include data if schema-only mode is not used.
```

Impact:

```text
Real user data could be copied into staging or committed accidentally.
```

Recommendation:

```text
Use schema-only dump. Inspect dump for COPY and INSERT statements before restore.
```

---

Risk 3

Severity:

```text
High
```

Finding:

```text
Production credentials could be reused for Stage 2.
```

Impact:

```text
Validation could touch production systems.
```

Recommendation:

```text
Use a separate staging Supabase project and `.env.staging.local`.
```

---

Risk 4

Severity:

```text
Medium
```

Finding:

```text
Supabase CLI dump behavior may differ by version.
```

Impact:

```text
The command may require flags or alternatives not shown here.
```

Recommendation:

```text
Check `supabase db dump --help` before export and fall back to `pg_dump --schema-only` if needed.
```

---

Risk 5

Severity:

```text
Medium
```

Finding:

```text
RLS policies may not restore exactly depending on roles and ownership.
```

Impact:

```text
Stage 2 access behavior may differ from source.
```

Recommendation:

```text
Run RLS and policy verification queries after restore.
```

## Status

Guide status:

```text
AWAITING USER ACTION
```

No Supabase connection was made.

No migrations were run.

No credentials were printed.

No production code was modified.

No Stage 2 execution was resumed.
