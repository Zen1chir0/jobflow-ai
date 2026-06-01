# Functional Test Guide

This guide explains how to functionally test the currently implemented JobFlow AI features.

Implemented scope covered here:

- Phase 0: foundation, config loading, CLI health
- Phase 1: job discovery pipeline
- Phase 2: deterministic job parsing pipeline
- Phase 3: deterministic match scoring pipeline
- Phase 4: resume intelligence fragment and retrieval pipeline

Future phases are intentionally excluded.

## Prerequisites

Install dependencies:

```bash
npm install
```

Create a local `.env` file with real development credentials:

```text
NODE_ENV=development
LOG_LEVEL=info
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
LLM_PROVIDER=...
LLM_BASE_URL=...
LLM_API_KEY=...
LLM_MODEL=...
```

Security rule:

- Do not commit `.env`.
- Do not paste credentials into terminal screenshots, logs, docs, or issue trackers.
- `.env.example` must contain placeholders only.

## Baseline Verification

Run the full project gate:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected result:

```text
Lint: passed
Typecheck: passed
Tests: passed
Build: passed
```

## CLI Health Check

Run:

```bash
node dist\src\cli\index.js health
```

Expected result:

```text
JobFlow AI ready (development)
```

If this fails:

- Confirm `.env` exists.
- Confirm all required environment variables are present.
- Confirm URLs are valid.
- Confirm no secrets are printed in the error output.

## Phase 1 Functional Test: Manual Discovery

Manual discovery stores a discovered job through the repository layer.

Run:

```bash
node dist\src\cli\index.js discover --source manual --title "QA Automation Engineer" --company "Example Co" --url "https://example.com/jobs/qa-automation" --description "Responsibilities: Build automated tests. Requirements: TypeScript and Playwright." --location "Remote"
```

Expected result:

```text
Discovered 1 job(s), stored 1, duplicates 0
<job_id> Example Co - QA Automation Engineer
```

Validation in Supabase:

- Open the `jobs` table.
- Confirm a row exists with:
  - `title`: `QA Automation Engineer`
  - `company`: `Example Co`
  - `application_url`: `https://example.com/jobs/qa-automation`
  - `remote_type`: `remote`
  - `description_raw`: populated

Repeat the same command.

Expected result:

- The repository should upsert by `application_url`.
- The table should not create duplicate rows for the same URL.

## Phase 2 Functional Test: Parse One Job

Use a real `job_id` from the `jobs` table.

Run:

```bash
node dist\src\cli\index.js parse --job-id <job_id>
```

Expected result:

```text
Parsed 1 job(s)
<job_id> <seniority> <count> required skill(s)
```

Validation in Supabase:

- Open the `parsed_job_profiles` table.
- Confirm a row exists with:
  - `job_id`: the parsed job id
  - `responsibilities`: array
  - `required_skills`: array
  - `preferred_skills`: array
  - `seniority`: one of `intern`, `junior`, `mid`, `senior`, `lead`, `unknown`
  - `compensation`: JSON object
  - `raw_metadata.descriptionClean`: populated

Also confirm the related row in `jobs` has:

- `parsed_at`: populated
- `description_clean`: populated when clean text is available

## Phase 2 Functional Test: Parse All Unparsed Jobs

Run:

```bash
node dist\src\cli\index.js parse --all --limit 5
```

Expected result:

```text
Parsed <n> job(s)
```

Validation:

- Only jobs with `parsed_at` set to `null` should be selected.
- Parsed jobs should receive corresponding `parsed_job_profiles` rows.
- Parsed jobs should have `parsed_at` populated after parsing.

## Phase 3 Functional Test: Score One Parsed Job

Use a real `job_id` that exists in both:

- `jobs`
- `parsed_job_profiles`

Confirm the `user_profile` table has one seeded profile with:

- `verified_skills`
- `target_industries`
- `preferred_remote_types`
- `minimum_salary`
- `salary_currency`
- `baseline_seniority`

Run:

```bash
node dist\src\cli\index.js score --job-id <job_id>
```

Expected result:

```text
Scored job <job_id>: <final_score>
skill=<score> experience=<score> industry=<score> location=<score> compensation=<score>
```

Validation in Supabase:

- Open the `job_match_scores` table.
- Confirm a row exists with:
  - `job_id`: the scored job id
  - `skill_match`: numeric value from 0 to 100
  - `experience_match`: numeric value from 0 to 100
  - `industry_match`: numeric value from 0 to 100
  - `location_match`: numeric value from 0 to 100
  - `compensation_match`: numeric value from 0 to 100
  - `final_score`: weighted score from 0 to 100
  - `scoring_metadata`: JSON object with component metadata

Expected formula:

```text
final_score =
(skill_match * 0.40) +
(experience_match * 0.25) +
(industry_match * 0.10) +
(location_match * 0.10) +
(compensation_match * 0.15)
```

Repeat the same command.

Expected result:

- The repository should upsert by `job_id`.
- The table should not create duplicate score rows for the same job.

## Phase 4 Functional Test: Add One Resume Fragment

Important:

- This command may call the configured embedding provider.
- Do not run it unless your configured provider and model support embeddings.
- Automated tests use fake providers and do not make live API calls.

Run:

```bash
node dist\src\cli\index.js fragments add --type project --text "Built a Playwright automation framework for regression testing." --source-label "Example Project"
```

Expected result:

```text
Created fragment <fragment_id>
project <n> character(s)
```

Validation in Supabase:

- Open the `user_resume_fragments` table.
- Confirm a row exists with:
  - `fragment_text`: the atomic fragment text
  - `fragment_type`: `project`
  - `source_label`: `Example Project`
  - `embedding`: populated when the provider supports embeddings
  - `metadata`: JSON object

Security validation:

- No API key should appear in CLI output.
- No provider URL secret or token should appear in logs.

## Phase 4 Functional Test: Retrieve Resume Context

Use a real parsed `job_id` that has a parsed profile.

Run:

```bash
node dist\src\cli\index.js fragments context --job-id <job_id>
```

Expected result:

```text
Retrieved <n> fragment(s)
- [<fragment_type>] <fragment_text>
```

Validation:

- The command retrieves fragments through `match_resume_fragments`.
- The output contains fragment context only.
- The output does not generate resume JSON, cover letters, recruiter messages, PDFs, or application materials.

Optional retrieval tuning:

```bash
node dist\src\cli\index.js fragments context --job-id <job_id> --top-k 3 --threshold 0.8
```

## What Phase 4 Does Not Test

The current parser does not:

- call live LLM APIs
- generate resumes
- rank jobs
- generate resume JSON
- generate cover letters
- generate recruiter messages
- render PDFs
- automate ATS applications
- transition application lifecycle states
- produce analytics

Embeddings are represented only by an optional field and provider interface.

## Useful Test Commands

Run all automated tests:

```bash
npm test
```

Run only parser-related tests:

```bash
npm test -- tests/unit/services/parsing
```

Run CLI integration tests:

```bash
npm test -- tests/integration/cli-discover.test.ts tests/integration/cli-parse.test.ts
```

Build and inspect command help:

```bash
npm run build
node dist\src\cli\index.js discover --help
node dist\src\cli\index.js parse --help
node dist\src\cli\index.js score --help
node dist\src\cli\index.js fragments --help
```

## Troubleshooting

Missing environment variable:

- Add the missing variable to `.env`.
- Use `.env.example` as the placeholder reference.

Supabase insert or upsert error:

- Confirm the database schema has been applied.
- Confirm `jobs` and `parsed_job_profiles` exist.
- Confirm `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct.
- Do not print or expose keys while debugging.

Parse command reports job not found:

- Confirm the `job_id` exists in the `jobs` table.
- Confirm you are using the correct Supabase project.

Score command reports parsed job profile not found:

- Run `parse --job-id <job_id>` first.
- Confirm `parsed_job_profiles.job_id` matches the job id.

Score command reports user profile not found:

- Confirm the seed `user_profile` row exists.
- Confirm the table is in the same Supabase project configured by `.env`.

Fragments add command reports embedding provider failure:

- Confirm `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` are valid.
- Confirm the configured provider/model supports embeddings.
- If your current ASI/OpenAI-compatible model is chat-only, keep using automated tests and configure an embedding-capable model before live fragment creation.
- Do not paste API keys while debugging.

Fragments context command reports no matching resume fragments:

- Add at least one resume fragment first.
- Confirm the fragment has an embedding.
- Lower `--threshold` only for local testing if needed.

No required skills extracted:

- Confirm the job description contains known deterministic skill terms such as `TypeScript`, `Playwright`, `Supabase`, or `API Testing`.
- Add new skill vocabulary through tests before relying on it in future scoring.

Unexpected salary result:

- Confirm the salary text uses a supported deterministic format, such as `PHP 80000 - 120000` or `$80k - $120k`.
- Add new salary fixtures before expanding parser behavior.

## Completion Rule

Functional testing is successful when:

```text
npm run lint passes
npm run typecheck passes
npm test passes
npm run build passes
CLI health works
Manual discovery stores a job
Parse command creates a parsed job profile
Score command creates a job match score
Fragments command stores and retrieves resume intelligence context
No secrets are printed
No future-phase behavior is invoked
```
