# Demo Workflow

This demo is designed for open-source reviewers.

It is local-first, deterministic-first, and safe by default. It does not require live Supabase credentials, live provider keys, live ATS websites, production resources, or final job application submission.

## Demo Goals

The demo should help a reviewer understand:

- What JobFlow AI does.
- How the CLI is structured.
- How the architecture is validated.
- How the system uses safe examples.
- Where the human approval boundary lives.
- Why Stage 3 Production Readiness is `NO-GO` without blocking OSS readiness.

## Safety Rules

This demo must not:

- Use production credentials.
- Use production database access.
- Call production providers.
- Visit live ATS sites.
- Submit job applications.
- Commit generated private artifacts.
- Print secrets.

Human approval remains mandatory before any real application action.

No final ATS submission automation exists.

## Demo Path A - No-Service Local Validation

Use this path for a first public review.

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
node dist/src/cli/index.js --help
```

Expected validation evidence:

```text
111 test files passed
180 tests passed
```

This proves the deterministic local baseline without touching live systems.

## Demo Path B - CLI Help Walkthrough

After build, inspect the available workflows:

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

What this shows:

- Discovery is a separate workflow.
- Parsing and scoring are deterministic stages.
- Resume intelligence and generation are distinct.
- Rendering is separated from generation.
- ATS preparation is isolated behind `apply`.
- Lifecycle, observability, and analytics are separate subsystems.

## Demo Path C - Narrative Workflow With Examples

Use the safe examples in:

```text
docs/examples/
```

Suggested narrative:

1. Start with `sample-job.md`.
2. Treat `sample-user-profile.json` as the fake applicant profile.
3. Use `sample-resume-fragments.json` as fake resume intelligence input.
4. Inspect `sample-generated-document.json` as structured generation output.
5. Follow `sample-lifecycle-timeline.json` to see lifecycle progression.
6. Inspect `sample-observability-log.json` to understand execution trace records.
7. Inspect `sample-analytics-summary.json` to understand read-only analytics output.

The example workflow is intentionally illustrative. It is not a production seed script and does not require live services.

## Safe Workflow Story

The intended safe workflow is:

```text
Discover job
Parse job
Score match
Retrieve resume fragments
Generate structured documents
Render resume artifacts
Prepare ATS application
Stop at HUMAN_APPROVAL_REQUIRED
Record lifecycle and observability
Compute read-only analytics
```

The workflow stops before final ATS submission.

## Human Approval Boundary

The lifecycle state:

```text
HUMAN_APPROVAL_REQUIRED
```

is the boundary where automated preparation stops and the user must review.

Rules:

- The system may prepare application data.
- The system may render local artifacts.
- The system may track lifecycle state.
- The system may compute analytics.
- The system must not perform final application submission.

## Analytics Summary Explanation

The analytics example demonstrates:

- Funnel counts.
- Lifecycle distribution.
- Execution health.
- ATS reliability summary.
- Pipeline summary.

Analytics is read-only. It consumes repository data and views; it does not create application workflow records.

## Optional Staging Demo

Stage 2 controlled integration validation already passed, but staging is optional for OSS review.

Only use staging if explicitly approved.

Staging rules:

- Use a staging Supabase project only.
- Use staging-safe credentials only.
- Use disposable records only.
- Clean up disposable records.
- Do not call production providers.
- Do not access live ATS sites.

See:

```text
docs/progress/STAGE_02_CONTROLLED_INTEGRATION_VALIDATION.md
```

## Validation Status To Mention

Current validation status:

```text
Stage 1 Validation: PASS
Stage 2 Validation: PASS
Stage 3 Production Readiness: NO-GO
```

Interpretation:

- Stage 1 proves local deterministic validation.
- Stage 2 proves controlled staging integration validation.
- Stage 3 is `NO-GO` for Production SaaS readiness.
- Stage 3 is not a blocker for OSS readiness.

## Demo Limitations

This demo does not prove:

- Production deployment.
- Production RLS policy readiness.
- Production read-only schema verification.
- Live ATS reliability.
- Production provider quality.
- Multi-user SaaS operations.
- Billing.
- Monitoring or alerting.

Those are future production hardening concerns.
