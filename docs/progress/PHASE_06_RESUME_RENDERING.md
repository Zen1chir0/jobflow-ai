# Phase 06 Resume Rendering

## Overview

Phase 6 implemented the Resume Rendering Service for JobFlow AI.

The purpose of this phase was to transform validated Phase 5 `ResumeJson` into deterministic local resume artifacts:

```text
resume.json
resume.tex
resume.pdf
metadata.json
```

Phase 6 is rendering-only. It does not generate resume content, create cover letters, automate ATS workflows, manage lifecycle state, add observability services, produce analytics, or submit applications.

## Objectives

Original Phase 6 goals:

- Rendered resume domain types
- Generated resume repository
- Resume rendering service
- LaTeX template renderer
- LaTeX escaping
- Template selection
- Artifact path builder
- Artifact storage
- PDF compiler interface
- `LatexmkPdfCompiler`
- `RenderResumeUseCase`
- `jobflow render` CLI command
- Renderer fixture tests
- PDF compiler mock tests
- Phase 6 report

## Implemented Components

Files created:

```text
src/domain/resumes/rendered-resume.types.ts
src/domain/resumes/resume-template.types.ts
src/repositories/generated-resume.repository.ts
src/services/resume-rendering/resume-rendering.service.ts
src/services/resume-rendering/latex-template-renderer.ts
src/services/resume-rendering/latex-escape.ts
src/services/resume-rendering/template-selector.ts
src/services/resume-rendering/artifact-path-builder.ts
src/services/resume-rendering/artifact-storage.ts
src/integrations/pdf/pdf-compiler.interface.ts
src/integrations/pdf/latexmk-pdf-compiler.ts
src/use-cases/render-resume.use-case.ts
src/cli/commands/render.command.ts
src/templates/latex/ats.tex
tests/unit/services/resume-rendering/latex-escape.test.ts
tests/unit/services/resume-rendering/template-selector.test.ts
tests/unit/services/resume-rendering/latex-template-renderer.test.ts
tests/unit/services/resume-rendering/artifact-path-builder.test.ts
tests/unit/services/resume-rendering/artifact-storage.test.ts
tests/unit/services/resume-rendering/resume-rendering.service.test.ts
tests/unit/integrations/latexmk-pdf-compiler.test.ts
tests/unit/use-cases/render-resume.use-case.test.ts
tests/integration/repositories/generated-resume.repository.test.ts
tests/integration/cli-render.test.ts
docs/progress/PHASE_06_RESUME_RENDERING.md
```

## Files Modified

Files modified:

```text
README.md
docs/TEST.md
src/cli/index.ts
src/domain/errors/application-error.ts
src/index.ts
src/repositories/generated-document.repository.ts
tests/integration/repositories/generated-document.repository.test.ts
tests/unit/use-cases/generate-document.use-case.test.ts
```

Note:

The Phase 5 ResumeJson readiness audit changes were also preserved and committed before Phase 6 completion:

```text
docs/progress/PHASE_05_RESUME_JSON_READINESS_AUDIT.md
src/services/document-generation/prompt-builders/resume-json.prompt-builder.ts
src/services/document-generation/validators/resume-json.validator.ts
tests/unit/services/document-generation/resume-json-readiness.test.ts
```

## Architecture Decisions

Decision:
Implement rendering through `CLI -> Use Case -> Service -> Repository -> Supabase / Integration`.

Reason:
This preserves the core architecture rule and keeps CLI files limited to argument parsing, invoking use cases, and displaying results.

Decision:
Use stored `ResumeJson` as the resume body contract and `UserProfile` only for header fields.

Reason:
The Phase 5 readiness audit confirmed `ResumeJson` is renderer-ready for body content, while contact fields are intentionally sourced from `UserProfile` instead of silently extending the schema.

Decision:
Centralize LaTeX escaping.

Reason:
Escaping must be deterministic and consistently handle `&`, `%`, `$`, `#`, `_`, `{`, `}`, `~`, `^`, and `\` so generated content cannot break LaTeX rendering.

Decision:
Keep PDF compilation behind `PdfCompiler`.

Reason:
Business logic must not know whether `latexmk`, `pdflatex`, or a future compiler is used. Tests can mock the compiler and avoid requiring local LaTeX installation.

Decision:
Store artifacts under ignored local storage.

Reason:
Generated resume files are local artifacts and must not be committed. `.gitignore` already protects `storage/resumes/`, `storage/latex/`, `storage/pdf/`, and `*.pdf`.

## Testing Summary

Tests added:

```text
tests/unit/services/resume-rendering/latex-escape.test.ts
tests/unit/services/resume-rendering/template-selector.test.ts
tests/unit/services/resume-rendering/latex-template-renderer.test.ts
tests/unit/services/resume-rendering/artifact-path-builder.test.ts
tests/unit/services/resume-rendering/artifact-storage.test.ts
tests/unit/services/resume-rendering/resume-rendering.service.test.ts
tests/unit/integrations/latexmk-pdf-compiler.test.ts
tests/unit/use-cases/render-resume.use-case.test.ts
tests/integration/repositories/generated-resume.repository.test.ts
tests/integration/cli-render.test.ts
```

Test coverage added for:

- Minimal ResumeJson rendering
- Complete ResumeJson rendering
- Dense ResumeJson rendering
- Long skills list rendering
- Long experience list rendering
- Multi-paragraph summary rendering
- Empty education rendering
- Empty certifications rendering
- LaTeX escaping
- Template selection
- Artifact path generation
- Artifact storage
- PDF compiler wrapper behavior
- Generated resume repository mapping
- Render resume use case orchestration
- `jobflow render` CLI behavior

Test results:

```text
58 test files passed
94 tests passed
```

## Project Metrics

Files Created:
25

Files Modified:
8

Directories Created:
6

Test Files Added:
10

Tests Added:
11

Commands Verified:
5

Documentation Files Updated:
3

## Risks Identified

Risk 1

Description:

```text
Live PDF compilation requires latexmk to be installed locally.
```

Impact:

```text
Medium
```

Mitigation:

```text
Keep PDF compilation behind PdfCompiler and mock compiler execution in automated tests. Document live LaTeX installation requirements before manual rendering workflows.
```

---

Risk 2

Description:

```text
The initial ATS template is intentionally simple and may need typography refinements after real resume review.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add rendering fixtures and template snapshots as real generated resumes are reviewed, while preserving the ResumeJson contract.
```

---

Risk 3

Description:

```text
Dense resumes can still exceed one page depending on content volume.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add pagination and compact template variants in future rendering refinements without changing document generation logic.
```

## Commands Executed

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js render --help
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
npm run lint                           PASSED
npm run typecheck                      PASSED
npm test                               PASSED
npm run build                          PASSED
node dist\src\cli\index.js render --help PASSED
```

## Rendering Readiness Review

Question:

```text
Can a validated ResumeJson now be deterministically rendered into a professional ATS-friendly PDF without requiring additional schema changes?
```

Answer:

```text
Yes.
```

Evidence:

- `ResumeJson` remains the body input contract.
- `UserProfile` is used only for allowed header/contact fields.
- The renderer performs no generation, rewriting, summarization, or hallucination.
- LaTeX escaping is centralized and tested.
- Minimal, complete, dense, long-list, and empty-section rendering cases are tested.
- PDF compilation is behind a mockable `PdfCompiler`.
- Rendered output is persisted through `generated_resumes`.

No additional ResumeJson schema change is required for Phase 6.

## Known Limitations

- Automated tests mock PDF compilation and do not require a live LaTeX installation.
- Live rendering requires `latexmk` to be installed and available on the local PATH.
- Only the `ats` template is implemented in Phase 6.
- No ATS automation was implemented.
- No Playwright workflow was implemented.
- No lifecycle service was implemented.
- No observability service was implemented.
- No analytics service was implemented.
- No application submission was implemented.
- No content generation was implemented.

## Lessons Learned

- Rendering is cleanest when `ResumeJson` owns body content and `UserProfile` owns contact/header data.
- A mockable compiler boundary keeps tests deterministic even when local LaTeX availability varies.
- Centralized escaping is mandatory before any template work; otherwise special characters can break rendering unpredictably.
- Keeping rendered artifacts in ignored storage prevents accidental repository pollution.

## Next Phase Prerequisites

Before Phase 7 starts:

- User must explicitly approve Phase 7 progression.
- Phase 6 report must be committed to the repository.
- Phase 7 implementation must remain limited to ATS Automation scope.
- Phase 7 may add ATS strategy interfaces, strategy registry, and mock ATS tests.
- Phase 7 must not implement lifecycle, observability service, analytics, or automatic application submission.

