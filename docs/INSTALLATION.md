# Installation Guide

This guide helps reviewers clone, install, validate, and inspect JobFlow AI locally without requiring private credentials or live services.

JobFlow AI is currently an open-source engineering project, not production SaaS. The default setup path is local, deterministic, and mock-first.

## Requirements

Required:

- Node.js 22 recommended.
- npm.
- Git.

Current package metadata allows Node.js 20 or newer:

```text
"engines": {
  "node": ">=20.0.0"
}
```

The project validation history and CI use Node.js 22, so Node.js 22 is the recommended reviewer environment.

Optional tools:

- Supabase CLI for staging database work.
- PostgreSQL tools such as `psql` and `pg_dump` for schema verification workflows.
- Docker Desktop for Supabase CLI database dump workflows that require local container images.
- LaTeX tooling such as `latexmk` for full local PDF compilation outside the mocked automated tests.

## Clone and Install

```bash
git clone <repo-url>
cd jobflow-ai
npm ci
```

If you are reviewing from an existing local checkout, run:

```bash
npm ci
```

## Local Validation

Run the same core gates used by the project validation reports:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected current test evidence:

```text
111 test files passed
180 tests passed
```

The automated test suite uses fake or mocked credentials. It does not require:

- Live Supabase credentials.
- Live provider keys.
- Live ATS websites.
- Production database access.
- Production provider access.

## CLI Smoke Check

After building, inspect the compiled CLI:

```bash
node dist/src/cli/index.js --help
```

Useful command help checks:

```bash
node dist/src/cli/index.js discover --help
node dist/src/cli/index.js parse --help
node dist/src/cli/index.js score --help
node dist/src/cli/index.js fragments --help
node dist/src/cli/index.js generate --help
node dist/src/cli/index.js render --help
node dist/src/cli/index.js apply --help
node dist/src/cli/index.js lifecycle --help
node dist/src/cli/index.js observability --help
node dist/src/cli/index.js analytics --help
```

## Local-Only Reviewer Path

For OSS review, the safest first pass is:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
node dist/src/cli/index.js --help
```

This path proves the deterministic local baseline without touching live systems.

## Optional Staging Path

Staging integration is not required for basic OSS review.

If staging validation is explicitly approved, use a private staging environment file and the controlled validation guidance in:

```text
docs/progress/STAGE_02_CONTROLLED_INTEGRATION_VALIDATION.md
docs/progress/STAGE_02_STAGING_SUPABASE_SETUP_GUIDE.md
```

Staging must remain separate from production.

Do not use production credentials for staging validation.

## What This Guide Does Not Cover

This guide does not cover:

- Production deployment.
- Production database writes.
- Production RLS changes.
- Live ATS submission.
- Final job application submission.
- Multi-user SaaS operations.
- Billing.
- Monitoring or alerting.

Those items remain future production hardening work.

## Troubleshooting

If `npm ci` fails:

- Confirm Node.js is installed.
- Confirm npm is available.
- Confirm you are in the repository root.

If `npm run typecheck` fails:

- Confirm dependencies were installed with `npm ci`.
- Check TypeScript errors before running build.

If `npm test` fails:

- Confirm no private environment file is overriding fake test configuration.
- Re-run the specific failing test with Vitest if needed.

If CLI commands fail before build:

- Run `npm run build` first.
- Use the compiled entrypoint:

```bash
node dist/src/cli/index.js --help
```

## Validation Status

Current staged validation evidence:

```text
Stage 1 Validation: PASS
Stage 2 Validation: PASS
Stage 3 Production Readiness: NO-GO
```

Stage 3 is a `NO-GO` for Production SaaS readiness. It is not a blocker for OSS readiness.
