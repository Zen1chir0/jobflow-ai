# Required Services And Keys

## Overview

This document identifies the external services, APIs, credentials, local dependencies, developer accounts, and future optional tools required to operate JobFlow AI from Phase 1 through the currently planned architecture.

This is an environment-readiness document only. It does not authorize Phase 2 implementation.

## Required Services

### Supabase

Purpose:

- Primary PostgreSQL database.
- Job storage in Phase 1.
- Parsed job profiles in Phase 2.
- pgvector resume fragment retrieval in Phase 4.
- Generated document storage in Phase 5.
- Application lifecycle, observability, and analytics storage in later phases.

Required Phase:

- Phase 1 for live job persistence.
- Phase 2 and later for full platform operation.

Mandatory or Optional:

- Mandatory.

Required Account Type:

- Supabase account with one project.
- Free tier is acceptable for local MVP work until usage exceeds free-tier limits.

Required Keys / Credentials:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Setup Instructions:

1. Create or sign in to a Supabase account.
2. Create a new Supabase project for JobFlow AI.
3. Open the project dashboard.
4. Find the project API URL in the project's connection or API settings.
5. Find API keys in the Dashboard under `Settings > API Keys`.
6. Use the anon key for normal local application access where row-level security applies.
7. Keep the service role key only for secure backend/admin workflows.
8. Add local values to `.env`; keep `.env.example` as placeholders only.

Where To Find Values:

- `SUPABASE_URL`: Supabase project dashboard connection/API settings.
- `SUPABASE_ANON_KEY`: `Settings > API Keys`, legacy anon key or the current publishable key equivalent if the implementation is updated to use publishable keys.
- `SUPABASE_SERVICE_ROLE_KEY`: `Settings > API Keys`, legacy service role key or the current secret key equivalent if the implementation is updated to use secret keys.

Security Notes:

- Never commit `.env`.
- Never expose service role or secret keys in browser code, logs, screenshots, public repos, or CLI output.
- Supabase service role keys bypass row-level security and should be treated as high-risk secrets.
- Prefer separate secret keys for separate backend components when production workflows are introduced.
- Rotate any key that may have been exposed.

Reference:

- https://supabase.com/docs/guides/getting-started/api-keys

### Provider-Agnostic LLM Configuration

Purpose:

- Configure the active LLM provider without changing business logic.
- Support OpenAI-compatible providers through custom base URLs.
- Keep model selection, base URL, provider name, and API key outside source code.

Required Phase:

- Phase 5 for document generation.
- Phase 2 or Phase 4 only if embeddings are implemented through the same configurable provider layer.

Mandatory or Optional:

- Mandatory before any LLM-powered generation workflow becomes operational.

Required Account Type:

- Depends on selected provider.
- Examples include OpenAI platform account, ASI Cloud account, OpenRouter account, Anthropic Console account, or a future compatible provider account.

Required Keys / Credentials:

```text
LLM_PROVIDER
LLM_BASE_URL
LLM_API_KEY
LLM_MODEL
```

Example:

```text
LLM_PROVIDER=asi-cloud
LLM_BASE_URL=https://inference.asicloud.cudos.org/v1
LLM_API_KEY=xxxxxxxx
LLM_MODEL=openai/gpt-oss-120b
```

Setup Instructions:

1. Choose the provider for the current environment.
2. Create the required provider account.
3. Generate the provider API key.
4. Confirm whether the provider exposes an OpenAI-compatible API.
5. Set `LLM_PROVIDER` to a stable provider identifier such as `openai`, `asi-cloud`, `openrouter`, or `anthropic`.
6. Set `LLM_BASE_URL` to the provider's API base URL.
7. Set `LLM_API_KEY` to the provider API key.
8. Set `LLM_MODEL` to the exact model identifier required by the provider.
9. Store values in `.env`; keep `.env.example` as placeholders only.

Architecture Notes:

- Future code must use an `LLMProvider` interface.
- OpenAI-compatible providers should be implemented behind an `OpenAICompatibleProvider`.
- `DocumentGenerationService` must depend on the provider interface, not on OpenAI, ASI Cloud, OpenRouter, Anthropic, or any future vendor directly.
- Business logic must not hardcode provider endpoints or model names.

Security Notes:

- Never commit `LLM_API_KEY`.
- Never log full provider API keys.
- Rotate compromised provider credentials immediately.
- Treat third-party base URLs as configuration, not source constants.

### OpenAI

Purpose:

- Embeddings for parsed jobs and resume fragments.
- Resume JSON generation.
- Cover letter generation.
- Recruiter message generation.
- Screening answer drafting in later document-generation workflows.

Required Phase:

- Phase 2 if embeddings are implemented through OpenAI.
- Phase 4 for resume intelligence embeddings.
- Phase 5 for document generation.

Mandatory or Optional:

- Mandatory if OpenAI is the selected embedding or generation provider.
- Optional if another embedding or LLM provider is selected for a given workflow.

Required Account Type:

- OpenAI platform account.
- API access enabled.
- Billing configured before relying on non-trial production usage.

Required Keys / Credentials:

```text
LLM_PROVIDER=openai
LLM_BASE_URL=<OpenAI-compatible base URL>
LLM_API_KEY=<OpenAI API key>
LLM_MODEL=<selected OpenAI model>
```

Setup Instructions:

1. Create or sign in to an OpenAI platform account at `https://platform.openai.com`.
2. Create a project for JobFlow AI if project-level separation is desired.
3. Configure billing and usage limits.
4. Create an API key from the platform API keys area.
5. Store the key in `.env` as `LLM_API_KEY`.
6. Set `LLM_PROVIDER=openai`.
7. Set `LLM_MODEL` to the selected model.
8. Set `LLM_BASE_URL` from provider configuration when the future LLM provider layer is implemented.
9. Do not paste the key into source files, docs, issue trackers, screenshots, or chat logs.

Expected Model Usage:

- Embeddings: use a current OpenAI embedding model, with `text-embedding-3-small` as the expected cost-efficient default and `text-embedding-3-large` as a higher-quality option when justified.
- Generation: use a current GPT text generation model for resume JSON, cover letters, recruiter messages, and screening drafts.
- Structured outputs should be preferred for resume JSON and other schema-bound generation.

Billing Requirements:

- API usage is billed separately from consumer ChatGPT usage.
- Configure a payment method and usage budget before sustained generation or embedding workflows.
- Monitor token usage after Phase 4 and Phase 5 become operational.

Security Notes:

- Never commit `LLM_API_KEY`.
- Rotate the key immediately if exposed.
- Use project-scoped keys and restricted permissions where available.
- Store production keys in deployment-provider secret storage, not local files.

Reference:

- https://platform.openai.com
- https://platform.openai.com/docs/guides/embeddings
- https://platform.openai.com/docs/models
- https://platform.openai.com/docs/pricing

### Anthropic

Purpose:

- Alternative LLM provider.
- Resume generation fallback.
- Prompt comparison.
- Future reliability and output-quality evaluation against OpenAI generation.

Required Phase:

- Phase 5 if Anthropic is added as a generation provider or fallback.

Mandatory or Optional:

- Optional for MVP if OpenAI handles generation.
- Recommended for provider fallback and comparison workflows.

Required Account Type:

- Claude Console account.
- API access enabled.
- Billing configured before relying on production usage.

Required Keys / Credentials:

```text
LLM_PROVIDER=anthropic
LLM_BASE_URL=<Anthropic API base URL or adapter URL>
LLM_API_KEY=<Anthropic API key>
LLM_MODEL=<selected Anthropic model>
```

Setup Instructions:

1. Create or sign in to the Anthropic Console at `https://console.anthropic.com`.
2. Create a workspace or use an existing workspace for JobFlow AI.
3. Configure billing and usage controls.
4. Generate an API key from account or workspace settings.
5. Store the key in `.env` as `LLM_API_KEY`.
6. Keep provider selection configurable when Phase 5 is implemented.

Billing Requirements:

- Claude API access requires billing for sustained usage.
- Token costs vary by model family and may differ for prompt caching, batch use, or cloud-provider access.

Security Notes:

- Never commit `LLM_API_KEY`.
- Rotate immediately if exposed.
- Use separate keys per workspace or workflow where possible.
- Do not log prompts with secrets or private credentials.

Reference:

- https://console.anthropic.com
- https://docs.anthropic.com/en/api/getting-started
- https://docs.anthropic.com/en/docs/about-claude/pricing

### ASI Cloud

Purpose:

- OpenAI-compatible LLM provider option.
- Alternative generation backend for future document generation workflows.

Required Phase:

- Phase 5 if selected as the active LLM provider.

Mandatory or Optional:

- Optional.

Required Account Type:

- ASI Cloud account or access arrangement that provides API credentials.

Required Keys / Credentials:

```text
LLM_PROVIDER=asi-cloud
LLM_BASE_URL=https://inference.asicloud.cudos.org/v1
LLM_API_KEY=<ASI Cloud API key>
LLM_MODEL=openai/gpt-oss-120b
```

Setup Instructions:

1. Obtain ASI Cloud API access.
2. Generate or retrieve an API key.
3. Configure the OpenAI-compatible base URL.
4. Configure the exact model identifier.
5. Store all values in `.env`.

Security Notes:

- Never commit `LLM_API_KEY`.
- Do not hardcode the ASI Cloud base URL in business logic.
- Keep provider configuration in environment variables.

### GitHub

Purpose:

- Repository hosting.
- Project board.
- Phase tracking.
- Pull requests and code review.
- Issue tracking for risks and deferred work.

Required Phase:

- Phase 0 onward.

Mandatory or Optional:

- Mandatory for repository hosting and phase-report commit discipline.

Required Account Type:

- GitHub account.
- Repository owner or collaborator access.

Required Keys / Credentials:

- Git credentials for local commits.
- Optional GitHub CLI authentication token if using `gh`.
- Optional SSH key for repository access.

Setup Instructions:

1. Create or sign in to a GitHub account.
2. Create a repository for JobFlow AI.
3. Create a GitHub Project Board for phase tracking.
4. Add columns or statuses for planned, in progress, review, complete, and blocked.
5. Push local commits after each completed phase report.

Security Notes:

- Do not commit `.env`, service role keys, API keys, cookies, browser sessions, screenshots, PDFs, or generated artifacts.
- Enable branch protection later if collaboration expands.
- Use GitHub repository secrets for CI/CD credentials.

Reference:

- https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github

## Local Development Dependencies

### Node.js

Purpose:

- Runtime for the CLI and TypeScript tooling.

Required Phase:

- Phase 0 onward.

Mandatory or Optional:

- Mandatory.

Required Version:

```text
22.x
```

Setup Instructions:

1. Install Node.js 22.x from the official Node.js site or a trusted version manager.
2. Verify with `node --version`.
3. Keep the project on a consistent major version to avoid ESM and test-runner differences.

Reference:

- https://nodejs.org/en/download

### npm

Purpose:

- Package installation.
- Script execution.

Required Phase:

- Phase 0 onward.

Mandatory or Optional:

- Mandatory.

Required Version:

```text
Latest compatible version bundled with Node.js 22.x.
```

Setup Instructions:

1. Install Node.js 22.x.
2. Verify npm with `npm --version`.
3. Use `npm install` to restore dependencies from `package-lock.json`.

Security Notes:

- Do not commit `node_modules`.
- Review lockfile changes before commits.

### Git

Purpose:

- Version control.
- Phase report commit enforcement.

Required Phase:

- Phase 0 onward.

Mandatory or Optional:

- Mandatory.

Setup Instructions:

1. Install Git.
2. Configure `user.name` and `user.email`.
3. Verify with `git --version`.
4. Commit each completed phase and phase report before advancing.

Security Notes:

- Review `git status` before commits.
- Never commit secrets or generated private artifacts.

### VS Code

Purpose:

- Recommended editor for TypeScript, Markdown, tests, and repository review.

Required Phase:

- Phase 0 onward.

Mandatory or Optional:

- Optional but recommended.

Setup Instructions:

1. Install VS Code.
2. Install TypeScript, ESLint, and Git-related extensions if desired.
3. Use the integrated terminal for project commands.

### Codex

Purpose:

- Required implementation workflow for stage-gated development.
- Reads project constitution, follows phase gates, writes tests, runs checks, and generates phase reports.

Required Phase:

- Phase 0 onward.

Mandatory or Optional:

- Mandatory for the defined implementation workflow.

Setup Instructions:

1. Use Codex from the configured development environment.
2. Keep `CODEX_MASTER.md` as the highest authority.
3. Do not approve phase advancement until gates and reports are complete.

Security Notes:

- Do not paste live secrets into prompts.
- Keep secrets in `.env` and local secret stores only.

## Future Services

### Playwright

Purpose:

- ATS automation in Phase 7.
- Browser-driven form filling.
- Mock ATS testing.

Required Phase:

- Phase 7.

Mandatory or Optional:

- Optional until Phase 7.
- Mandatory once ATS automation begins.

Required Account Type:

- No external account required.

Required Keys / Credentials:

- None for Playwright itself.
- Local browser session files may exist later under `storage/playwright-state/`.

Setup Instructions:

1. Add Playwright dependency when Phase 7 begins.
2. Install browsers with the official Playwright install command.
3. Keep mock HTML fixtures for tests.
4. Do not rely on live job sites for automated tests.

Security Notes:

- Never commit `storage/playwright-state/`.
- Never commit cookies or authenticated browser sessions.
- Never automate final application submission.

### LaTeX

Purpose:

- Resume rendering in Phase 6.
- Compile generated `.tex` into `.pdf`.

Required Phase:

- Phase 6.

Mandatory or Optional:

- Optional until Phase 6.
- Mandatory once PDF rendering begins.

Required Account Type:

- No account required.

Required Keys / Credentials:

- None.

Supported Local Distributions:

- TeX Live.
- MiKTeX.

Setup Instructions:

1. Install TeX Live or MiKTeX.
2. Ensure `latexmk` is available if used as the primary compiler.
3. Ensure `pdflatex` is available as a fallback.
4. Verify compiler availability from the terminal.

Security Notes:

- Do not commit generated PDFs.
- Do not compile untrusted LaTeX input without sandboxing considerations.

### Supabase CLI

Purpose:

- Future database migration workflows.
- Local database testing.
- Schema management.

Required Phase:

- Future database migration and integration-test work.

Mandatory or Optional:

- Optional until migrations are introduced.
- Recommended before live Supabase integration tests.

Required Account Type:

- Supabase account for linked projects.

Required Keys / Credentials:

- Supabase access token for some CLI workflows.
- Project reference ID when linking local config to a hosted project.

Setup Instructions:

1. Install Supabase CLI when migrations are planned.
2. Link the local project to a Supabase project only after credentials are ready.
3. Store CLI credentials securely.

Security Notes:

- Do not commit local Supabase credential files.
- Do not expose service role keys in migration logs.

### Docker

Purpose:

- Future local infrastructure testing.
- Potential local Supabase stack.
- Consistent CI-like environments.

Required Phase:

- Future integration and infrastructure testing.

Mandatory or Optional:

- Optional for current MVP phases.
- Recommended once local database or service containers are introduced.

Required Account Type:

- Docker account is optional for local engine usage but may be needed for Docker Hub workflows.

Required Keys / Credentials:

- None for local-only workflows.
- Optional registry credentials for image publishing.

Setup Instructions:

1. Install Docker Desktop or Docker Engine.
2. Verify with `docker --version`.
3. Use only project-defined compose files when introduced.

Security Notes:

- Do not bake secrets into images.
- Use `.env` or secret stores for container runtime configuration.
- Do not publish images containing local credentials or generated artifacts.

## Estimated Monthly Costs

Supabase:

- Free tier may be enough for local MVP development.
- Paid plan may be needed later for higher database storage, bandwidth, backups, auth, or production uptime.

OpenAI:

- Usage-based API billing.
- Costs depend on embedding volume, prompt size, generated document count, selected models, and retries.
- Expected early cost driver: embeddings in Phase 2/4 and generated application documents in Phase 5.

OpenAI-Compatible Providers:

- Usage varies by provider.
- Costs depend on selected provider, base URL, model, request volume, and token usage.
- ASI Cloud, OpenRouter, and future providers should be evaluated before being set as the active production provider.

Anthropic:

- Usage-based API billing.
- Optional until configured as a fallback or comparison provider.
- Costs depend on selected Claude model, prompt size, outputs, caching, and batch usage.

GitHub:

- Free tier is likely enough for repository hosting and project board tracking.
- Paid tiers may be useful later for private collaboration controls, advanced security, or larger CI usage.

Local Tools:

- Node.js, npm, Git, VS Code, Playwright, TeX Live/MiKTeX, Supabase CLI, and Docker can be used without direct project-specific monthly charges.
- Some tools may consume disk space, CPU, memory, or require optional paid cloud/registry services.

## Security Rules

- Never commit secrets.
- Never commit `.env`.
- Use `.env` for local secrets.
- Use `.env.example` for placeholder variable names only.
- Never expose Supabase service role keys.
- Never expose LLM provider API keys.
- Never expose OpenAI API keys.
- Never expose Anthropic API keys.
- Never hardcode LLM provider endpoints.
- Use `LLM_BASE_URL` for provider endpoint configuration.
- Use `LLM_MODEL` for model selection.
- Never paste live credentials into prompts, issue trackers, screenshots, docs, or logs.
- Rotate compromised credentials immediately.
- Prefer project-scoped or workflow-scoped keys.
- Prefer secret storage in deployment platforms or CI systems for non-local environments.
- Redact keys in logs; if a key fingerprint is needed, store a hash or at most a very short non-sensitive prefix.
- Review `.gitignore` before adding generated artifacts or local state.

References:

- https://supabase.com/docs/guides/getting-started/api-keys
- https://platform.openai.com
- https://platform.openai.com/docs/guides/embeddings
- https://platform.openai.com/docs/models
- https://platform.openai.com/docs/pricing
- https://docs.anthropic.com/en/api/getting-started
- https://docs.anthropic.com/en/docs/about-claude/pricing

## Required User Actions

Before later phases become operational, prepare:

1. Supabase project.
2. Supabase database schema and migrations when introduced.
3. `SUPABASE_URL`.
4. `SUPABASE_ANON_KEY`.
5. `SUPABASE_SERVICE_ROLE_KEY` stored securely and never exposed.
6. OpenAI platform account.
7. OpenAI billing and usage budget.
8. Provider-agnostic LLM configuration if OpenAI is used: `LLM_PROVIDER`, `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`.
9. Anthropic Console account if fallback generation is desired.
10. Anthropic billing and usage budget if Anthropic is enabled.
11. Provider-agnostic LLM configuration if Anthropic is used: `LLM_PROVIDER`, `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`.
12. GitHub repository and project board.
13. Node.js 22.x.
14. npm.
15. Git.
16. VS Code or equivalent editor.
17. Codex workflow access.
18. Future Playwright setup before Phase 7.
19. Future LaTeX setup before Phase 6.
20. Future Supabase CLI and Docker setup when database migrations and local infrastructure testing begin.

## Phase 2 Eligibility Notes

This document does not make Phase 2 complete or started.

Phase 2 may begin only after explicit user approval and must remain limited to Job Parsing Service scope.

Recommended environment readiness before Phase 2:

- Supabase credentials are available locally if parsed job metadata will be persisted during Phase 2.
- Provider-agnostic LLM variables are available if Phase 2 embeddings will be implemented with an LLM or embedding provider.
- If embeddings are deferred inside Phase 2 planning, document the deferral explicitly before coding.
