# Environment Setup Guide

This guide explains how JobFlow AI treats environment files and credentials.

The default OSS review path does not require real credentials. Local deterministic validation should run with fake or mocked values.

## Environment File Principles

Rules:

- Never commit private environment files.
- Never commit provider keys.
- Never commit Supabase service role keys.
- Never print full environment objects.
- Never print authorization headers.
- Keep staging and production credentials separate.
- Prefer fake values for local deterministic tests.
- Prefer read-only credentials for production-adjacent verification.

## Current Repository Status

Current local inventory:

```text
.env exists locally
.env.example.local exists locally
.env.example is not present
```

Important:

```text
.env and .env.example.local must not be treated as public templates if they contain private values.
```

Before public submission, any file intended as a public template should contain fake placeholder values only.

## Recommended Public Template

For public OSS review, the repository should eventually provide a fake-value template such as:

```text
.env.example
```

Recommended placeholder values:

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

These are placeholders only. They should not point to real systems.

## Private Local Environment

Use:

```text
.env
```

for private local development values.

Rules:

- Keep `.env` untracked.
- Do not commit `.env`.
- Do not paste `.env` contents into issues, pull requests, logs, or reports.
- Do not use production credentials for local experiments.

## Private Staging Environment

Use:

```text
.env.staging.local
```

for staging-only integration validation.

Required staging marker:

```text
NODE_ENV=staging
```

Possible staging variables:

```text
SUPABASE_URL=<staging_supabase_url>
SUPABASE_ANON_KEY=<staging_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<staging_service_role_key_if_explicitly_approved>
STAGING_CONNECTION_STRING=<staging_postgres_connection_string>
LLM_PROVIDER=<mock_or_approved_staging_provider>
LLM_BASE_URL=<mock_or_approved_staging_base_url>
LLM_API_KEY=<mock_or_approved_staging_key>
LLM_MODEL=<mock_or_approved_staging_model>
```

Rules:

- Keep `.env.staging.local` untracked.
- Do not use production credentials.
- Do not print values.
- Use a separate staging Supabase project.
- Use disposable records for write validation.
- Clean up disposable records after validation.

## Production Environment

Production credentials must remain separate from local and staging credentials.

Production validation requires explicit approval and should prefer read-only metadata access.

Forbidden without explicit approval:

- Production database writes.
- Production migrations.
- Production RLS changes.
- Production provider calls.
- Production service role usage.

## Provider Configuration

Provider variables:

```text
LLM_PROVIDER
LLM_BASE_URL
LLM_API_KEY
LLM_MODEL
```

Rules:

- Mock providers are the default for automated tests.
- Live provider usage requires explicit approval.
- Provider keys must not be committed.
- Provider keys must not be printed.
- Production provider usage is not part of OSS readiness validation.

Known provider separation from prior validation:

```text
Staging provider: ASI Cloud GPT OSS 120B
Production provider: Pioneer AI GPT 5.5
```

Do not call the production provider during staging or OSS validation.

## Supabase Configuration

Supabase variables:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STAGING_CONNECTION_STRING
```

Rules:

- Service role keys are sensitive.
- Service role use requires explicit approval.
- Stage 1 local validation does not require live Supabase.
- Stage 2 staging validation requires staging-only resources.
- Stage 3 production readiness remains `NO-GO` until production RLS and production read-only schema verification are complete.

## CI Placeholder Values

CI should use fake placeholder values for deterministic tests.

CI must not require:

- Live Supabase.
- Live provider keys.
- Live ATS websites.
- Production resources.

## Secret Review Checklist

Before public submission, verify:

- `.env` is not tracked.
- `.env.local` is not tracked.
- `.env.staging.local` is not tracked.
- `.env.example.local` is not tracked if it contains real values.
- Public templates contain fake values only.
- No provider keys are committed.
- No service role keys are committed.
- No cookies are committed.
- No browser session files are committed.
- No screenshots containing personal data are committed.
- No private generated artifacts are committed.

## What Reviewers Need

For the default OSS review path, reviewers need:

```text
Node.js
npm
repository checkout
```

They do not need real credentials to run:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```
