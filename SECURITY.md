# Security Policy

## Supported Scope

This policy covers the JobFlow AI repository, including the CLI, services, repositories, provider boundaries, ATS safety boundaries, lifecycle tracking, observability, analytics, documentation, and local/staging validation workflows.

JobFlow AI is not currently production SaaS. Production security hardening, production RLS verification, production deployment, and production incident operations remain future work.

## Security Reporting

If you find a security issue, report it privately to the repository maintainer.

Do not open a public issue if the report includes:

- Credentials.
- Provider keys.
- Supabase keys.
- Cookies.
- Browser session data.
- Private user data.
- Personal screenshots.
- Exploit details that could enable misuse.

## Secret Handling Rules

Never commit:

- `.env`
- `.env.local`
- `.env.staging.local`
- provider keys
- service role keys
- cookies
- session files
- private artifacts
- screenshots containing personal data

Do not print full environment objects, authorization headers, raw checkpoint payloads, or raw observability metadata that may contain secrets.

## Provider Key Rules

Provider keys must remain private and untracked.

Rules:

- Mock providers are the default for automated tests.
- Live provider usage requires explicit approval.
- Provider keys must not be printed.
- Raw provider responses must not be logged if they may contain sensitive data.
- Production provider calls must not be used during staging validation.
- Provider usage should have clear budget and scope limits.

## Supabase Credential Rules

Supabase credentials must remain private and untracked.

Rules:

- Service role keys must not be committed.
- Service role keys must not be printed.
- Staging credentials must stay separate from production credentials.
- Production validation should prefer read-only metadata access.
- Production writes require explicit approval.
- RLS and access policies must be verified before production-candidate release.

## Artifact Handling Rules

Generated artifacts should remain local and ignored unless explicitly approved for safe public examples.

Do not commit:

- Private generated resumes.
- Private generated documents.
- Local storage artifacts.
- Browser session state.
- Screenshots containing personal data.
- Schema dumps containing sensitive data.
- Any file containing real credentials or private application data.

## ATS Safety Rules

JobFlow AI does not provide final ATS submission automation.

Human approval remains mandatory.

Security-sensitive ATS rules:

- Do not add final submit behavior.
- Do not automate real job submissions.
- Do not run live ATS tests without explicit approval.
- Do not commit cookies or session files.
- Do not commit screenshots that expose personal data.
- Mock-first ATS tests are the default.

## Responsible Disclosure

Please include enough information for maintainers to understand and reproduce the issue without exposing secrets.

Recommended report contents:

- Affected file or subsystem.
- Security impact.
- Reproduction steps using safe test data.
- Whether live services were involved.
- Sanitized logs if available.
- Suggested remediation if known.

Maintainers should avoid publishing details until the issue is understood and any required mitigation is complete.

## Out of Scope

The following are currently out of scope for this repository's security support:

- Production SaaS operations.
- Multi-user tenancy.
- Billing systems.
- Hosted deployment security.
- External monitoring and alerting.
- Production incident response operations.
- Final ATS submission automation.
- Live ATS website behavior outside explicitly approved validation tasks.
