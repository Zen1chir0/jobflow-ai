# Phase 05 Document Generation

## Overview

Phase 5 implemented the structured Document Generation Service for JobFlow AI.

The purpose of this phase was to transform job data, parsed job profiles, match scores, user profile data, and Phase 4 retrieved resume context into structured application artifacts.

Phase 5 ends at structured content generation and persistence. It does not render LaTeX, create PDFs, automate ATS workflows, manage lifecycle state, add observability services, or produce analytics.

## Objectives

Original Phase 5 goals:

- Document generation service
- Resume JSON schema
- Cover letter schema
- Recruiter message schema
- Screening response schema
- Prompt schema definitions
- Provider-agnostic generation boundary
- Generated document repository
- Generation use cases
- Generation CLI commands
- Tests
- Documentation
- Phase report

## Implemented Components

Files created:

```text
src/domain/documents/generated-document.types.ts
src/domain/documents/resume-json.types.ts
src/domain/documents/cover-letter.types.ts
src/domain/documents/recruiter-message.types.ts
src/domain/documents/screening-response.types.ts
src/integrations/generation/generation-provider.interface.ts
src/integrations/generation/openai-compatible-generation.provider.ts
src/repositories/generated-document.repository.ts
src/services/document-generation/document-generation.types.ts
src/services/document-generation/document-generation.service.ts
src/services/document-generation/hallucination-guard.ts
src/services/document-generation/output-normalizer.ts
src/services/document-generation/prompt-builders/prompt-builder-utils.ts
src/services/document-generation/prompt-builders/resume-json.prompt-builder.ts
src/services/document-generation/prompt-builders/cover-letter.prompt-builder.ts
src/services/document-generation/prompt-builders/recruiter-message.prompt-builder.ts
src/services/document-generation/prompt-builders/screening-response.prompt-builder.ts
src/services/document-generation/validators/common.ts
src/services/document-generation/validators/resume-json.validator.ts
src/services/document-generation/validators/cover-letter.validator.ts
src/services/document-generation/validators/recruiter-message.validator.ts
src/services/document-generation/validators/screening-response.validator.ts
src/use-cases/generate-document.use-case.ts
src/use-cases/generate-resume-json.use-case.ts
src/use-cases/generate-cover-letter.use-case.ts
src/use-cases/generate-recruiter-message.use-case.ts
src/use-cases/generate-screening-response.use-case.ts
src/cli/commands/generate.command.ts
tests/unit/integrations/openai-compatible-generation-provider.test.ts
tests/unit/services/document-generation/prompt-builders.test.ts
tests/unit/services/document-generation/validators.test.ts
tests/unit/services/document-generation/hallucination-guard.test.ts
tests/unit/services/document-generation/document-generation.service.test.ts
tests/unit/services/document-generation/support/document-generation.fixtures.ts
tests/unit/use-cases/generate-document.use-case.test.ts
tests/integration/repositories/generated-document.repository.test.ts
tests/integration/cli-generate.test.ts
docs/progress/PHASE_05_DOCUMENT_GENERATION.md
```

## Files Modified

Files modified:

```text
README.md
docs/TEST.md
src/cli/index.ts
src/domain/errors/application-error.ts
src/index.ts
```

## Architecture Decisions

Decision:
Implement generation through `CLI -> Use Case -> Service -> Repository -> Supabase / Integration`.

Reason:
This preserves the core architecture rule and keeps CLI files limited to argument parsing, invoking use cases, and displaying results.

Decision:
Use `GenerationProvider` as the business-facing provider boundary.

Reason:
Business logic must not know whether the configured provider is OpenAI, ASI Cloud, OpenRouter, Anthropic, or a future provider.

Decision:
Use the OpenAI-compatible chat completions contract behind configuration.

Reason:
The project already supports OpenAI-compatible providers through `LLM_PROVIDER`, `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`, and the provider remains swappable behind the interface.

Decision:
Require generated artifacts to pass schema validation and hallucination checks before persistence.

Reason:
Phase 5 requires structured outputs and forbids invented companies, dates, projects, certifications, technologies, responsibilities, achievements, or metrics.

Decision:
Consume Phase 4 prompt context instead of reading resume fragments directly in generators.

Reason:
Document generation must not bypass resume intelligence retrieval. The use case retrieves context through `ResumeIntelligenceService`, then passes the context into generation.

## Testing Summary

Tests added:

```text
tests/unit/integrations/openai-compatible-generation-provider.test.ts
tests/unit/services/document-generation/prompt-builders.test.ts
tests/unit/services/document-generation/validators.test.ts
tests/unit/services/document-generation/hallucination-guard.test.ts
tests/unit/services/document-generation/document-generation.service.test.ts
tests/unit/use-cases/generate-document.use-case.test.ts
tests/integration/repositories/generated-document.repository.test.ts
tests/integration/cli-generate.test.ts
```

Test coverage added for:

- OpenAI-compatible generation provider configuration
- Prompt builders for all Phase 5 artifacts
- Schema validation for generated artifacts
- Hallucination prevention for unsupported claims
- Output normalization for provider JSON objects
- Document generation service orchestration
- Generated document repository insert mapping
- Generate document use case orchestration
- `generate resume` CLI parsing and output
- `generate cover-letter` CLI parsing and output
- `generate recruiter-message` CLI parsing and output
- `generate screening-response` CLI parsing and output

Test results:

```text
47 test files passed
77 tests passed
```

## Project Metrics

Files Created:
37

Files Modified:
5

Directories Created:
8

Test Files Added:
8

Tests Added:
12

Commands Verified:
5

Documentation Files Updated:
3

## Risks Identified

Risk 1

Description:

```text
The hallucination guard is deterministic and conservative, but real provider output can express grounded claims in varied phrasing.
```

Impact:

```text
Medium
```

Mitigation:

```text
Expand evidence-backed fixtures as real generated outputs are reviewed, while keeping unsupported claims blocked before persistence.
```

---

Risk 2

Description:

```text
Live generation depends on the configured OpenAI-compatible provider supporting chat completions and structured JSON output.
```

Impact:

```text
Medium
```

Mitigation:

```text
Keep provider calls behind GenerationProvider and validate provider behavior manually before relying on live generation workflows.
```

---

Risk 3

Description:

```text
Generated prompts are stored for traceability and may include job details and retrieved resume context.
```

Impact:

```text
Medium
```

Mitigation:

```text
Never include credentials in prompts, keep .env ignored, and review prompt storage policy before adding broader observability or sharing features.
```

## Commands Executed

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js generate --help
```

## Completion Gate Evidence

Lint:
PASSED

Typecheck:
PASSED

Tests:
PASSED

Build:
PASSED

CLI Smoke Test:
PASSED

Completion gate command results:

```text
npm run lint                             PASSED
npm run typecheck                        PASSED
npm test                                 PASSED
npm run build                            PASSED
node dist\src\cli\index.js generate --help PASSED
```

## Known Limitations

- No LaTeX rendering was implemented.
- No PDF generation was implemented.
- No resume template rendering was implemented.
- No ATS automation was implemented.
- No Playwright workflow was implemented.
- No lifecycle service was implemented.
- No observability service was implemented.
- No analytics service was implemented.
- No application submission was implemented.
- No live provider call was run during automated tests.
- No live Supabase write was run during automated tests.
- The hallucination guard is intentionally conservative and may reject provider output that needs clearer evidence references.

## Lessons Learned

- Structured generation is safest when schema validation, evidence references, and persistence are separated.
- Prompt builders should include explicit omission rules, but prompt instructions are not enough; post-generation validation is still required.
- Phase 4 prompt context is a clean boundary for grounding generation without exposing raw fragment repository access to generators.
- Mock provider tests protect the architecture while keeping automated gates deterministic and secret-safe.

## Next Phase Prerequisites

Before Phase 6 starts:

- User must explicitly approve Phase 6 progression.
- Phase 5 report must be committed to the repository.
- Phase 6 implementation must remain limited to Resume Rendering scope.
- Phase 6 may add LaTeX template rendering and PDF artifact creation.
- Phase 6 must not implement ATS automation, lifecycle, observability service, analytics, or automatic application submission.

## Final Status

Next Phase Eligibility:

```text
ELIGIBLE FOR PHASE 6
```

Status:

```text
AWAITING USER APPROVAL
```

