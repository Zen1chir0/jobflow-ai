# Phase 03 Match Scoring

## Overview

Phase 3 implemented the deterministic Match Scoring Service for JobFlow AI.

The purpose of this phase was to rank parsed jobs against the seeded user profile using transparent, testable scoring components and the required weighted final score formula.

## Objectives

Original Phase 3 goals:

- Skill match
- Experience/seniority match
- Industry match
- Location match
- Compensation match
- Final weighted score
- `job_match_scores` repository
- `jobflow score` command
- Tests
- Phase 3 report

## Implemented Components

Files created:

```text
src/domain/scoring/scoring.types.ts
src/domain/user-profile/user-profile.types.ts
src/services/scoring/score-utils.ts
src/services/scoring/skill-match.scorer.ts
src/services/scoring/experience-match.scorer.ts
src/services/scoring/industry-match.scorer.ts
src/services/scoring/location-match.scorer.ts
src/services/scoring/compensation-match.scorer.ts
src/services/scoring/match-scoring.service.ts
src/repositories/job-match-score.repository.ts
src/repositories/user-profile.repository.ts
src/use-cases/score-job.use-case.ts
src/cli/commands/score.command.ts
tests/unit/services/scoring/skill-match.scorer.test.ts
tests/unit/services/scoring/experience-match.scorer.test.ts
tests/unit/services/scoring/industry-match.scorer.test.ts
tests/unit/services/scoring/location-match.scorer.test.ts
tests/unit/services/scoring/compensation-match.scorer.test.ts
tests/unit/services/scoring/match-scoring.service.test.ts
tests/unit/use-cases/score-job.use-case.test.ts
tests/integration/repositories/job-match-score.repository.test.ts
tests/integration/repositories/user-profile.repository.test.ts
tests/integration/cli-score.test.ts
docs/progress/PHASE_03_MATCH_SCORING.md
```

## Files Modified

Files modified:

```text
README.md
docs/TEST.md
src/cli/index.ts
src/domain/errors/application-error.ts
src/index.ts
src/repositories/parsed-job-profile.repository.ts
tests/integration/repositories/parsed-job-profile.repository.test.ts
tests/unit/use-cases/parse-job.use-case.test.ts
```

## Architecture Decisions

Decision:
Implement scoring through `CLI -> Use Case -> Service -> Repository -> Supabase`.

Reason:
This preserves the core architecture rule and keeps score calculation out of CLI files.

Decision:
Split scoring into individual component scorers.

Reason:
Skill, seniority, industry, location, and compensation rules are deterministic systems that require focused edge case tests.

Decision:
Store individual scores and final score together.

Reason:
The database and CODEX master rules forbid storing only the final score, and future ranking/debugging depends on transparent breakdowns.

Decision:
Use a minimal user profile repository in Phase 3.

Reason:
Scoring requires verified skills, target industries, remote preferences, salary expectations, and baseline seniority from `user_profile`, while keeping Supabase syntax inside repositories.

Decision:
Keep repository tests mocked.

Reason:
Phase 3 validates repository mapping and boundaries without depending on live database state unless explicitly requested.

## Testing Summary

Tests added:

```text
tests/unit/services/scoring/skill-match.scorer.test.ts
tests/unit/services/scoring/experience-match.scorer.test.ts
tests/unit/services/scoring/industry-match.scorer.test.ts
tests/unit/services/scoring/location-match.scorer.test.ts
tests/unit/services/scoring/compensation-match.scorer.test.ts
tests/unit/services/scoring/match-scoring.service.test.ts
tests/unit/use-cases/score-job.use-case.test.ts
tests/integration/repositories/job-match-score.repository.test.ts
tests/integration/repositories/user-profile.repository.test.ts
tests/integration/cli-score.test.ts
```

Test coverage added for:

- Required skill intersection scoring
- Empty required skills behavior
- Experience/seniority lookup table
- Unknown seniority handling
- Direct industry matching
- Remote preference matching
- Compensation threshold scoring
- Currency mismatch handling
- Weighted final score formula
- Score use case orchestration
- Match score repository upsert and lookup mapping
- User profile repository lookup mapping
- Score CLI option parsing and output

Test results:

```text
30 test files passed
51 tests passed
```

## Project Metrics

Files Created:
24

Files Modified:
8

Directories Created:
4

Test Files Added:
10

Tests Added:
17

Commands Verified:
5

Documentation Files Updated:
3

## Risks Identified

Risk 1

Description:

```text
The initial compensation scoring rules are deterministic but may not capture every real-world salary disclosure pattern.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add salary-specific scoring fixtures as more real job records are tested, without introducing AI scoring.
```

---

Risk 2

Description:

```text
Unknown seniority, industry, location, or compensation currently scores conservatively.
```

Impact:

```text
Medium
```

Mitigation:

```text
Improve deterministic parsing coverage and add documented neutral-score rules only if product requirements require them.
```

---

Risk 3

Description:

```text
The score command currently supports one job at a time and does not yet implement MVP batch scoring with --all.
```

Impact:

```text
Medium
```

Mitigation:

```text
Add batch scoring in a scoped follow-up once repository selection rules for parsed and unscored jobs are defined.
```

## Commands Executed

```bash
npm run lint
npm run typecheck
npm test
npm run build
node dist\src\cli\index.js score --help
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
npm run lint                         PASSED
npm run typecheck                    PASSED
npm test                             PASSED
npm run build                        PASSED
node dist\src\cli\index.js score --help PASSED
```

## Known Limitations

- No resume intelligence was implemented.
- No AI generation was implemented.
- No live embedding calls were implemented.
- No document generation was implemented.
- No LaTeX rendering was implemented.
- No ATS automation was implemented.
- No lifecycle management was implemented.
- No observability service was implemented.
- No analytics service was implemented.
- No live Supabase integration test was run.
- No batch `score --all` command was implemented.

## Lessons Learned

- The weighted scoring formula is easiest to verify when each component scorer returns both a score and metadata.
- Keeping component metadata makes score debugging possible without leaking scoring logic into CLI output.
- Conservative missing-data handling keeps Phase 3 deterministic while leaving room for future parser improvements.
- Repository-level mocked tests are enough to protect Supabase table mappings while avoiding accidental live writes during automated gates.

## Next Phase Prerequisites

Before Phase 4 starts:

- User must explicitly approve Phase 4 progression.
- Phase 3 report must be committed to the repository.
- Phase 4 implementation must remain limited to Resume Intelligence Service scope.
- Phase 4 may add resume fragment repository, embedding generation, retrieval, and context builder.
- Phase 4 must not implement AI document generation, LaTeX rendering, ATS automation, lifecycle, observability service, or analytics.
