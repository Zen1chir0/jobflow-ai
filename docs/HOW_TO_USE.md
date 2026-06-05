# How To Use JobFlow AI

This guide explains JobFlow AI for recruiters, open source reviewers, hiring managers, students, and non-technical evaluators.

For installation details, see `docs/INSTALLATION.md`.

For environment and credential rules, see `docs/ENVIRONMENT_SETUP.md`.

For a compact technical map, see `docs/ARCHITECTURE_MAP.md`.

For the main project overview, see `README.md`.

## Overview

JobFlow AI is a CLI-first job application orchestration platform.

In plain language, it helps organize the job application process from finding a job opportunity through understanding it, scoring fit, preparing application materials, tracking progress, recording workflow history, and summarizing analytics.

It is designed around a careful safety boundary:

```text
No final ATS submission exists.
Human approval remains mandatory.
```

JobFlow AI can prepare and organize application work, but it does not autonomously submit job applications.

## Typical Workflow

A typical JobFlow AI workflow looks like this:

1. Add or discover a job opportunity.
2. Parse the job description into structured information.
3. Score how well the job matches a candidate profile.
4. Retrieve relevant resume fragments.
5. Generate structured application materials.
6. Render resume artifacts.
7. Prepare ATS application data.
8. Stop for human approval.
9. Track the application lifecycle.
10. Record logs, checkpoints, and analytics.

The important part is the stop point:

```text
JobFlow AI stops before final application submission.
```

## Example End-to-End Journey

Imagine a reviewer wants to understand how JobFlow AI supports an application workflow.

The journey would look like this:

1. A job posting is added to the system.
2. JobFlow AI extracts useful details such as role, company, requirements, location, compensation, and ATS type.
3. The project scores the role against a structured candidate profile.
4. Relevant resume fragments are selected so application materials can be tailored.
5. Structured documents such as resume JSON, cover letter content, recruiter messages, or screening responses can be generated.
6. Resume artifacts can be rendered through the local rendering boundary.
7. ATS preparation can identify form strategy and reliability checkpoints.
8. The workflow reaches the human approval boundary.
9. The candidate decides what to do next.
10. Lifecycle, observability, and analytics records help explain what happened.

This makes JobFlow AI useful as a job application orchestration system, not as an uncontrolled application bot.

## Human Approval Points

Human approval is required before any real application action.

The system's lifecycle includes:

```text
HUMAN_APPROVAL_REQUIRED
```

That state is intentional. It means the system can prepare a workflow, but a person must review the application before anything real happens.

JobFlow AI should never be described as a final-submit automation system.

## Safety Boundaries

JobFlow AI's safety boundaries are part of the product, not an afterthought.

The major safety rules are:

- No final ATS submission automation exists.
- Human approval remains mandatory.
- Automated tests do not use live ATS websites.
- ATS behavior is mock-first and fixture-driven by default.
- Provider usage is behind explicit integration boundaries.
- Real provider keys should not be needed for basic review.
- Secrets, cookies, session files, screenshots with personal data, and private generated artifacts must not be committed.
- Analytics is read-only.
- Production database writes are not part of validation.

These rules make the project safer to review as open source.

## Current Limitations

JobFlow AI is not Production SaaS today.

Current limitations include:

- No production deployment has been validated.
- No production RLS or access policy audit has been completed.
- No production read-only schema verification has been completed.
- No production release, rollback, incident response, or backup/restore runbooks are complete.
- No dashboard or frontend exists.
- No billing or multi-user SaaS operations exist.
- Live ATS automation is not production-ready.
- No final ATS submission automation exists.
- Execution ID propagation is not universal across all historical workflows.

These limitations do not prevent open source review. They explain what remains future production hardening.

## Validation Status

Current validation status:

```text
Stage 1 Validation: PASS
Stage 2 Validation: PASS
Stage 3 Production Readiness: NO-GO
```

Stage 1 means the local deterministic validation passed.

Stage 2 means controlled staging integration validation passed.

Stage 3 is a `NO-GO` for Production SaaS readiness.

That Stage 3 result is not a blocker for OSS readiness. It means the project is not yet approved as a fully production-operated SaaS.

Latest recorded automated validation:

```text
111 test files passed
180 tests passed
```

## Frequently Asked Questions

### Is JobFlow AI production SaaS?

No. JobFlow AI is currently positioned as an open-source engineering project and staging-validated advanced portfolio system, not Production SaaS.

### Does JobFlow AI submit job applications automatically?

No.

```text
No final ATS submission exists.
Human approval remains mandatory.
```

### Can a reviewer run it without private credentials?

Yes. The default local validation path uses fake or mocked values.

See `docs/INSTALLATION.md` for the local setup path.

### Does the project use AI?

Yes, but it is deterministic-first. AI/provider behavior is kept behind boundaries and is not used for safety-critical workflow decisions like lifecycle transitions, analytics, or final submission.

### Why is Stage 3 a NO-GO?

Stage 3 is about Production SaaS readiness. It found that production security and operations work remains, including production RLS/access policies, production schema verification, release runbooks, rollback procedures, and operational readiness.

That does not mean the repository is not useful or not ready for open source review.

### What should evaluators look at first?

Start with:

- `README.md`
- `docs/INSTALLATION.md`
- `docs/DEMO_WORKFLOW.md`
- `docs/ARCHITECTURE_MAP.md`
- `docs/progress/STAGE_01_LOCAL_DETERMINISTIC_VALIDATION.md`
- `docs/progress/STAGE_02_CONTROLLED_INTEGRATION_VALIDATION.md`
- `docs/progress/STAGE_03_PRODUCTION_READINESS_VALIDATION.md`
