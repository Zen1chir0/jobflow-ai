# Contributing to JobFlow AI

Thank you for taking an interest in JobFlow AI. This project is designed as a serious CLI-first engineering platform, so contributions should preserve its architecture discipline, safety boundaries, and test-first posture.

## Project Philosophy

JobFlow AI is deterministic-first and AI-assisted second.

Contributions should favor clear domain logic, explicit state transitions, repository boundaries, mock-first validation, and readable documentation. AI/provider behavior should stay behind integration boundaries and should not become a hidden dependency for deterministic workflows.

The project development rhythm is:

```text
Plan
Approve
Implement
Test
Audit
Document
Validate
```

## Architecture Principles

Follow the primary dependency flow:

```text
CLI
Use Cases
Services
Repositories
Supabase / Integrations
```

Architecture rules:

- CLI commands parse arguments, call use cases, and render safe output.
- Use cases coordinate workflows.
- Services own business logic.
- Repositories own Supabase query syntax and persistence mapping.
- Domain code should remain pure and free of provider, Supabase, filesystem, and environment access.
- Provider implementations must stay behind provider boundaries.
- Analytics must remain read-only unless a future approved phase changes that.
- Lifecycle, observability, and analytics should remain separate subsystems.

Architecture boundary violations are prohibited.

## Development Workflow

Recommended local workflow:

1. Read the relevant docs before changing behavior.
2. Keep the change scoped to one subsystem when possible.
3. Update or add focused tests.
4. Update documentation when behavior or commands change.
5. Run the required commands.
6. Open a pull request with the test evidence.

Do not start live provider, live Supabase, live ATS, deployment, or production workflows unless explicitly approved for that validation scope.

## Required Commands

Run these before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

For CLI-facing changes, also check the relevant compiled command help after build:

```bash
node dist/src/cli/index.js --help
```

## Testing Expectations

Tests should be deterministic and mock-first.

Expected testing behavior:

- Unit tests for pure domain logic, state machines, validators, calculators, and parsers.
- Integration tests with mocked Supabase clients unless a staging validation task is explicitly approved.
- Provider tests with fake or mock providers by default.
- ATS tests with fixtures and mock browser/session behavior by default.
- Regression coverage for CLI output changes.

Automated tests must not require live provider keys, live Supabase credentials, live ATS websites, real browser sessions, or production resources.

## Documentation Expectations

Update documentation when a contribution changes:

- CLI commands or examples.
- Database schema assumptions.
- Architecture boundaries.
- Test expectations.
- Lifecycle states or transitions.
- Observability or analytics behavior.
- Security or ATS safety rules.

Relevant documentation files include:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/TEST.md`
- `docs/progress/`

## Security Rules

Never commit credentials or secret-bearing files.

Prohibited:

- Credential commits.
- Environment secret exposure.
- Full environment dumps in logs.
- Provider key exposure.
- Supabase service role key exposure.
- Cookies or browser session state.
- Private generated artifacts.
- Screenshots containing personal data.

Reports may mention variable names, but must not include credential values.

## ATS Safety Rules

JobFlow AI does not provide final ATS submission automation.

Human approval remains mandatory.

Prohibited:

- Live ATS submission.
- Final submit clicks.
- Automated real job applications.
- Tests that submit real application data.
- Changes that bypass the human approval boundary.

ATS work should remain mock-first and fixture-driven unless a separately approved validation task says otherwise.

## Pull Request Guidelines

Pull requests should include:

- What changed.
- Why it changed.
- Which subsystem is affected.
- Commands run.
- Test results.
- Documentation updates.
- Security or ATS safety impact.
- Any known limitations.

Keep unrelated refactors out of feature or fix pull requests.

## Code Review Expectations

Reviews should prioritize:

- Architecture boundary preservation.
- Deterministic behavior.
- Test coverage.
- Security posture.
- ATS safety boundary preservation.
- Documentation accuracy.
- Avoiding production-readiness overclaims.

A pull request should not be approved if it introduces credential exposure, live ATS submission behavior, environment secret leakage, or architecture boundary violations.
