# Phase 04 Resume Intelligence

## Overview

Phase 4 implemented the Resume Intelligence Service for JobFlow AI.

The purpose of this phase was to store atomic resume fragments, create embeddings through a provider-agnostic boundary, retrieve relevant fragments through Supabase pgvector similarity search, and assemble prompt-ready context without generating application documents.

## Objectives

Original Phase 4 goals:

- Resume fragment domain types
- Resume fragment repository
- Resume fragment creation/storage workflow
- Embedding provider interface usage
- OpenAI-compatible embedding provider implementation
- Resume fragment retrieval using `match_resume_fragments`
- Similarity search integration
- Prompt context builder
- CLI command for managing/testing fragments
- Unit tests
- Repository tests
- Service/use-case tests
- CLI tests
- Phase 4 report

## Implemented Components

Files created:

```text
src/domain/resumes/resume-fragment.types.ts
src/integrations/embeddings/openai-compatible-embedding.provider.ts
src/repositories/resume-fragment.repository.ts
src/services/resume-intelligence/resume-fragmenter.ts
src/services/resume-intelligence/resume-retriever.ts
src/services/resume-intelligence/prompt-context-builder.ts
src/services/resume-intelligence/resume-intelligence.service.ts
src/use-cases/create-resume-fragment.use-case.ts
src/use-cases/retrieve-resume-context.use-case.ts
src/cli/commands/fragments.command.ts
tests/unit/integrations/openai-compatible-embedding-provider.test.ts
tests/unit/services/resume-intelligence/resume-fragmenter.test.ts
tests/unit/services/resume-intelligence/resume-retriever.test.ts
tests/unit/services/resume-intelligence/prompt-context-builder.test.ts
tests/unit/services/resume-intelligence/resume-intelligence.service.test.ts
tests/unit/use-cases/create-resume-fragment.use-case.test.ts
tests/unit/use-cases/retrieve-resume-context.use-case.test.ts
tests/integration/repositories/resume-fragment.repository.test.ts
tests/integration/cli-fragments.test.ts
docs/progress/PHASE_04_RESUME_INTELLIGENCE.md
```

## Files Modified

Files modified:

```text
CODEX_MASTER.md
README.md
docs/TEST.md
src/cli/index.ts
src/domain/errors/application-error.ts
src/index.ts
src/integrations/embeddings/embedding-provider.interface.ts
```

## Architecture Decisions

Decision:
Implement resume intelligence through `CLI -> Use Case -> Resume Intelligence Service -> Embedding Provider / Repository -> Supabase`.

Reason:
This preserves the architecture rule while allowing provider calls and Supabase access to stay behind explicit boundaries.

Decision:
Use `EmbeddingProvider` as the only service-facing embedding dependency.

Reason:
Business logic must not know whether the configured provider is OpenAI, ASI Cloud, OpenRouter, Anthropic, or a future provider.

Decision:
Implement `OpenAICompatibleEmbeddingProvider` with configurable base URL, API key, and model.

Reason:
OpenAI-compatible providers can expose `/embeddings` through custom base URLs, and no endpoint or model should be hardcoded.

Decision:
Keep prompt context building separate from document generation.

Reason:
Phase 4 may assemble relevant context, but resume JSON, cover letters, recruiter messages, and generated documents belong to Phase 5.

Decision:
Use mocked provider and mocked Supabase tests.

Reason:
Automated tests must not make live API calls or depend on live database state.

Decision:
Add a no-push rule to `CODEX_MASTER.md`.

Reason:
The user explicitly requires local commits only and will review and push changes manually.

## Testing Summary

Tests added:

```text
tests/unit/integrations/openai-compatible-embedding-provider.test.ts
tests/unit/services/resume-intelligence/resume-fragmenter.test.ts
tests/unit/services/resume-intelligence/resume-retriever.test.ts
tests/unit/services/resume-intelligence/prompt-context-builder.test.ts
tests/unit/services/resume-intelligence/resume-intelligence.service.test.ts
tests/unit/use-cases/create-resume-fragment.use-case.test.ts
tests/unit/use-cases/retrieve-resume-context.use-case.test.ts
tests/integration/repositories/resume-fragment.repository.test.ts
tests/integration/cli-fragments.test.ts
```

Test coverage added for:

- Atomic resume fragment normalization
- Fragment type and embedding dimension validation
- Existing parsed job embedding reuse
- Job text embedding fallback
- Default retrieval `topK` and threshold behavior
- Prompt context deduplication and ordering
- Resume intelligence service orchestration
- OpenAI-compatible provider configuration
- Resume fragment repository insert mapping
- `match_resume_fragments` RPC mapping
- Create fragment use case orchestration
- Retrieve context use case orchestration
- `fragments add` CLI parsing and output
- `fragments context` CLI parsing and output

Test results:

```text
39 test files passed
65 tests passed
```

## Project Metrics

Files Created:
19

Files Modified:
7

Directories Created:
3

Test Files Added:
9

Tests Added:
14

Commands Verified:
5

Documentation Files Updated:
4

## Risks Identified

Risk 1

Description:

```text
The currently configured ASI/OpenAI-compatible model may not support embeddings through the /embeddings endpoint.
```

Impact:

```text
Medium
```

Mitigation:

```text
The embedding provider is isolated behind an interface and all tests use fake providers. Configure an embedding-capable OpenAI-compatible model before live fragment creation.
```

---

Risk 2

Description:

```text
The database schema expects 1536-dimensional vectors, so provider embedding dimension mismatches will fail validation or storage.
```

Impact:

```text
Medium
```

Mitigation:

```text
Keep fragment validation explicit and align the configured embedding model with the pgvector schema before live use.
```

---

Risk 3

Description:

```text
Prompt context assembly is intentionally plain text and does not yet include Phase 5 generation-specific prompt schemas.
```

Impact:

```text
Low
```

Mitigation:

```text
Add document-generation prompt schemas in Phase 5 without changing the retrieval service boundary.
```

## Commands Executed

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js fragments --help
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
npm run lint                              PASSED
npm run typecheck                         PASSED
npm test                                  PASSED
npm run build                             PASSED
node dist\src\cli\index.js fragments --help PASSED
```

## Known Limitations

- No resume JSON generation was implemented.
- No cover letter generation was implemented.
- No recruiter message generation was implemented.
- No document generation workflow was implemented.
- No LaTeX rendering was implemented.
- No PDF generation was implemented.
- No ATS automation was implemented.
- No lifecycle service was implemented.
- No observability service was implemented.
- No analytics service was implemented.
- No live embedding/API calls were run in tests.
- Live fragment creation requires an embedding-capable configured provider and model.

## Lessons Learned

- Resume intelligence is cleaner when fragment storage, embedding generation, retrieval, and context assembly remain separate.
- The provider-agnostic embedding boundary makes ASI/OpenAI-compatible providers swappable without touching business logic.
- Prompt context can be tested deterministically without invoking document generation.
- RPC mapping tests protect the `match_resume_fragments` boundary without requiring live Supabase calls.

## Next Phase Prerequisites

Before Phase 5 starts:

- User must explicitly approve Phase 5 progression.
- Phase 4 report must be committed to the repository.
- Phase 5 implementation must remain limited to Document Generation Service scope.
- Phase 5 may use retrieved resume fragments as context.
- Phase 5 must not implement LaTeX rendering, PDF generation, ATS automation, lifecycle, observability service, or analytics.
