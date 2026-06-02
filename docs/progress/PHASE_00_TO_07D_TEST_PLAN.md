# Phase 00 to Phase 07D Test Matrix

## Executive Summary

This document is the formal release-readiness and regression-testing standard for JobFlow AI through Phase 07D.

It upgrades the earlier coverage inventory into an engineering-grade validation matrix. The matrix defines what is being tested, why it matters, what proves it passed, how critical failure is, and which completed phase each test protects.

Covered phases:

```text
Phase 00 - Foundation
Phase 01 - Job Discovery
Phase 02 - Job Parsing
Phase 03 - Match Scoring
Phase 04 - Resume Intelligence
Phase 05 - Document Generation
Phase 06 - Resume Rendering
Phase 07A - ATS Automation Foundation
Phase 07B - ATS Strategies
Phase 07C - Workday State Machine
Phase 07D - ATS Reliability Hardening
```

This is documentation work only. No tests were executed while creating this matrix.

## Risk Classification

Critical:

```text
Failure can cause unsafe application behavior, unintended submission, security exposure, corrupted resumes, broken scoring, invalid generated content, or major architecture boundary violations.
```

High:

```text
Failure breaks a core workflow or persistence path but does not directly create unsafe submission or secret exposure.
```

Medium:

```text
Failure degrades feature quality, edge-case behavior, diagnostics, or user confidence without breaking the primary workflow.
```

Low:

```text
Failure is cosmetic or convenience-related and does not affect correctness, safety, security, or core workflows.
```

## Release Readiness Gates

Phase ready:

```text
100% Critical tests pass
100% High tests pass
95% Medium tests pass
No security failures
No architecture boundary violations
No submit-guard violations
No live external service dependency in automated tests
No unapproved generated artifacts tracked by Git
```

Release ready:

```text
All Critical tests pass
All High tests pass
Full build passes
CI passes
No secret exposure
No Supabase access outside repositories
No provider SDK or network behavior outside integration boundaries
No final submit behavior
No live ATS automation in automated tests
No ResumeJson schema regression
No LaTeX escaping regression
```

Release blockers:

- Any failed Critical test.
- Any failed High test that affects the release path.
- Any security failure.
- Any architecture boundary violation.
- Any final-submit or human-approval boundary violation.
- Any live LLM, embedding, Supabase write, or live ATS call in automated tests without explicit approval.

## Test Matrix Summary

```text
Total Planned Tests: 126
Critical Tests: 49
High Tests: 58
Medium Tests: 19
Low Tests: 0
```

## Foundation Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| FND-001 | Required environment variables are validated safely | 00 | Foundation | Critical | Critical | Config tests available | Missing required env values | Unit test `env.ts` validation | Safe validation error without secret output | App can run with invalid config or expose unsafe errors | Automated |
| FND-002 | Environment values load only through config layer | 00 | Foundation | Critical | Critical | Source audit available | `process.env` search outside config | Architecture scan | No direct env reads outside `src/config/env.ts` | Secret handling becomes fragmented | Automated scan |
| FND-003 | Invalid environment values are rejected | 00 | Foundation | High | High | Config test fixtures available | Invalid URLs, log levels, providers | Unit test | Invalid config rejected deterministically | Runtime failures from invalid setup | Automated |
| FND-004 | ApplicationError preserves stable codes | 00 | Foundation | Medium | Medium | Error tests available | Known error codes | Unit test | Stable code/message/cause behavior | Error handling becomes unreliable | Automated |
| FND-005 | Logger emits structured safe entries | 00 | Foundation | High | High | Logger tests available | Structured log payload | Unit test | Logs contain expected metadata only | Operational logs become hard to inspect | Automated |
| FND-006 | Silent logging suppresses output in tests | 00 | Foundation | Medium | Medium | Logger tests available | `LOG_LEVEL=silent` | Unit test | No console output emitted | Test output may leak or become noisy | Automated |
| FND-007 | Supabase client shell uses config values only | 00 | Foundation | Critical | Critical | Fake config values available | Placeholder Supabase URL and key | Unit test | Client shell creates without hardcoded credentials | Integration boundary can leak secrets | Automated |
| FND-008 | Health CLI command stays smoke-safe | 00 | CLI | High | High | Built CLI available after approval | `jobflow --help`, health command | CLI smoke/integration test | Command responds without accessing live services | Foundation CLI is broken | Automated |

## Discovery Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DIS-001 | Job normalizer produces canonical jobs | 01 | Discovery | High | High | Normalizer tests available | Raw manual job listing | Unit test | Normalized job has stable fields | Downstream parsing and scoring receive unstable data | Automated |
| DIS-002 | Required job fields are enforced | 01 | Discovery | High | High | Normalizer tests available | Missing title/company/application URL | Unit test | Job rejected with safe error | Invalid jobs enter pipeline | Automated |
| DIS-003 | ATS type inferred from application URL | 01 | Discovery | Medium | Medium | ATS inference available | Greenhouse, Lever, Workday, generic URLs | Unit test | Expected ATS type assigned | Later ATS flow may select wrong strategy | Automated |
| DIS-004 | Duplicate application URLs are removed | 01 | Discovery | High | High | Deduplicator tests available | Duplicate normalized URLs | Unit test | One canonical job remains | Duplicate jobs inflate scoring and generation | Automated |
| DIS-005 | Discovery service orchestrates crawler and normalizer | 01 | Discovery | High | High | Fake crawler available | Manual crawler response | Unit test | Service returns normalized deduped jobs | Discovery pipeline breaks | Automated |
| DIS-006 | Unsupported crawler source is rejected | 01 | Discovery | Medium | Medium | Use case tests available | Unknown crawler source | Unit test | Safe unsupported-source error | CLI may imply unsupported behavior exists | Automated |
| DIS-007 | Discovery use case persists through repository | 01 | Repositories | Critical | Critical | Mock repository available | Normalized job batch | Use-case test | Repository called with canonical jobs | Jobs are not persisted or wrong layer persists them | Automated |
| DIS-008 | Discover CLI parses options and displays result | 01 | CLI | Medium | Medium | CLI integration tests available | `discover` options | CLI integration test | CLI delegates and prints controlled output | User-facing discovery command regresses | Automated |

## Parsing Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PAR-001 | HTML cleaner removes unsafe markup noise | 02 | Parsing | High | High | Cleaner tests available | HTML with tags and scripts | Unit test | Clean text output | Parser extracts noisy or unsafe content | Automated |
| PAR-002 | Section extractor identifies job sections | 02 | Parsing | High | High | Section tests available | Job description sections | Unit test | Responsibilities, requirements, and benefits separated | Skill and seniority extraction degrade | Automated |
| PAR-003 | Skill extractor finds deterministic skills | 02 | Parsing | High | High | Skill fixtures available | Job text with known skills | Unit test | Expected skills extracted | Scoring and generation context become weaker | Automated |
| PAR-004 | Salary parser handles ranges and currency | 02 | Parsing | High | High | Salary fixtures available | Salary text variants | Unit test | Expected salary structure | Compensation scoring breaks | Automated |
| PAR-005 | Seniority extractor handles known levels | 02 | Parsing | Medium | Medium | Seniority fixtures available | Junior, mid, senior text | Unit test | Expected seniority assigned | Experience scoring degrades | Automated |
| PAR-006 | Parsing service orchestrates all parsers | 02 | Parsing | Critical | Critical | Parser fakes available | Full job description | Unit test | Parsed profile contains deterministic fields | Parsed profile contract breaks | Automated |
| PAR-007 | Parsed job repository maps schema fields | 02 | Repositories | Critical | Critical | Mock Supabase client available | Parsed job profile payload | Repository integration test | Correct table fields and responses | Database persistence corrupts parsed profiles | Automated |
| PAR-008 | Parse CLI parses options and displays result | 02 | CLI | Medium | Medium | CLI integration tests available | `parse` options | CLI integration test | CLI delegates and prints controlled output | User-facing parse command regresses | Automated |

## Scoring Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| SCO-001 | Required skill intersection scoring is correct | 03 | Scoring | Critical | Critical | Scorer tests available | Required skills and user skills | Unit test | Expected component score and metadata | Ranking becomes misleading | Automated |
| SCO-002 | Empty required skills behavior is stable | 03 | Scoring | High | High | Scorer tests available | Empty required skills | Unit test | Documented score behavior | Edge cases distort final score | Automated |
| SCO-003 | Experience lookup table is deterministic | 03 | Scoring | High | High | Experience tests available | Parsed seniority and user seniority | Unit test | Expected score from lookup table | Seniority match is unstable | Automated |
| SCO-004 | Unknown seniority is handled conservatively | 03 | Scoring | High | High | Experience tests available | Unknown seniority | Unit test | Conservative documented score | Unknown data inflates match | Automated |
| SCO-005 | Industry match uses direct deterministic match | 03 | Scoring | Medium | Medium | Industry tests available | Job industry and target industries | Unit test | Expected match score | Industry signal weakens | Automated |
| SCO-006 | Location match respects remote preference | 03 | Scoring | High | High | Location tests available | Remote/hybrid/location combinations | Unit test | Expected location score | Remote fit ranking breaks | Automated |
| SCO-007 | Compensation score handles thresholds and currency | 03 | Scoring | Critical | Critical | Compensation tests available | Salary range and expectations | Unit test | Expected compensation score | Compensation fit becomes misleading | Automated |
| SCO-008 | Weighted final score formula is stable | 03 | Scoring | Critical | Critical | Service tests available | Component score set | Unit test | Expected final score and breakdown | Overall ranking becomes invalid | Automated |

## Resume Intelligence Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RI-001 | Resume fragments remain atomic | 04 | Resume Intelligence | High | High | Fragmenter tests available | Resume text blocks | Unit test | Atomic fragments created | Retrieval context becomes noisy | Automated |
| RI-002 | Fragment type validation rejects invalid types | 04 | Resume Intelligence | Critical | Critical | Validation tests available | Unsupported fragment type | Unit test | Safe validation failure | Bad fragment data corrupts retrieval | Automated |
| RI-003 | Embedding dimension validation is enforced | 04 | Providers | Critical | Critical | Fake embeddings available | Wrong vector dimension | Unit test | Invalid embedding rejected | Similarity search becomes invalid | Automated |
| RI-004 | Existing parsed job embeddings can be reused | 04 | Resume Intelligence | High | High | Retriever tests available | Parsed profile with embedding | Unit test | Existing embedding used | Unneeded provider calls or inconsistent retrieval | Automated |
| RI-005 | Job text embedding fallback is mockable | 04 | Providers | High | High | Fake provider available | Parsed profile without embedding | Unit test | Fake provider called through interface | Business logic couples to provider | Automated |
| RI-006 | Retrieval defaults are stable | 04 | Resume Intelligence | High | High | Retriever tests available | No explicit `topK` or threshold | Unit test | `topK=5` and threshold `0.72` used | Prompt context changes unexpectedly | Automated |
| RI-007 | Prompt context deduplicates and orders fragments | 04 | Resume Intelligence | High | High | Context builder tests available | Duplicate scored fragments | Unit test | Deduped, ordered context | Prompt evidence quality degrades | Automated |
| RI-008 | Fragment CLI commands delegate safely | 04 | CLI | Medium | Medium | CLI tests available | `fragments add/context` options | CLI integration test | Controlled output and use-case calls | User fragment workflow regresses | Automated |

## Generation Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GEN-001 | ResumeJson schema rejects malformed output | 05 | Generation | Critical | Critical | Validator tests available | Invalid ResumeJson | Unit test | Validation failure | Renderer receives invalid resume contract | Automated |
| GEN-002 | CoverLetterDraft schema rejects malformed output | 05 | Generation | Critical | Critical | Validator tests available | Invalid cover letter draft | Unit test | Validation failure | Bad artifact persisted | Automated |
| GEN-003 | RecruiterMessageDraft schema rejects malformed output | 05 | Generation | Critical | Critical | Validator tests available | Invalid recruiter message | Unit test | Validation failure | Outreach content becomes unreliable | Automated |
| GEN-004 | ScreeningResponseDraft schema preserves evidence | 05 | Generation | Critical | Critical | Validator tests available | Screening response without evidence | Unit test | Missing evidence rejected or normalized safely | Unsupported answers could be used in ATS | Automated |
| GEN-005 | Prompt builders include job, score, and context | 05 | Generation | High | High | Prompt tests available | Job, parsed profile, match score, context | Unit test | Prompt includes required structured data | Provider gets incomplete context | Automated |
| GEN-006 | Generation provider boundary is mock-only in tests | 05 | Providers | High | High | Fake provider available | Generation request | Unit/integration test | Business logic calls interface only | Live provider calls leak into tests | Automated |
| GEN-007 | Hallucination guard blocks unsupported claims | 05 | Generation | Critical | Critical | Guard tests available | Generated claim without evidence | Unit test | Claim rejected or omitted | Fabricated resume content | Automated |
| GEN-008 | Generated document repository maps artifacts | 05 | Repositories | High | High | Mock Supabase client available | Structured generated document | Repository integration test | Correct mapping to persistence layer | Generated artifacts persist incorrectly | Automated |

## Rendering Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RND-001 | Minimal ResumeJson renders to LaTeX | 06 | Rendering | Critical | Critical | Renderer tests available | Minimal valid ResumeJson | Unit test | Valid deterministic `.tex` output | Rendering cannot support required contract | Automated |
| RND-002 | Complete ResumeJson renders all sections | 06 | Rendering | Critical | Critical | Renderer tests available | Complete ResumeJson | Unit test | Summary, skills, experience, projects, education, certifications rendered | Professional resume output incomplete | Automated |
| RND-003 | Dense ResumeJson remains stable | 06 | Rendering | High | High | Dense fixtures available | Long experience and project lists | Unit test | Output remains deterministic | Real resumes may break rendering | Automated |
| RND-004 | Long skills lists render predictably | 06 | Rendering | High | High | Skills fixtures available | Large skills inventory | Unit test | Stable skills section | ATS resume readability degrades | Automated |
| RND-005 | Empty optional sections are handled | 06 | Rendering | High | High | Edge fixtures available | No education or certifications | Unit test | Optional sections omitted safely | Renderer needs special-case hacks | Automated |
| RND-006 | LaTeX escaping covers reserved characters | 06 | Rendering | Critical | Critical | Escape tests available | `& % $ # _ { } ~ ^ \` | Unit test | Escaped output cannot break LaTeX | Malformed or unsafe `.tex` output | Automated |
| RND-007 | PDF compiler wrapper is mockable | 06 | Providers | Critical | Critical | Mock compiler available | `.tex` compile request | Unit test | Compiler interface called, no LaTeX required | CI depends on local compiler | Automated |
| RND-008 | Artifact storage writes expected files safely | 06 | Rendering | Medium | Medium | Temp storage available | Rendered resume artifacts | Unit test | `resume.json`, `resume.tex`, `resume.pdf`, `metadata.json` stored under ignored path | Artifact workflow becomes inconsistent | Automated |

## ATS Foundation Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ATSF-001 | ATS detector identifies Greenhouse | 07A | ATS Foundation | High | High | Detector tests available | Greenhouse URL/content | Unit test | Greenhouse type returned | Wrong strategy selected | Automated |
| ATSF-002 | ATS detector identifies Lever and Workday | 07A | ATS Foundation | High | High | Detector tests available | Lever and Workday signatures | Unit test | Expected ATS type returned | Wrong strategy selected | Automated |
| ATSF-003 | Generic fallback is conservative | 07A | ATS Foundation | Critical | Critical | Detector tests available | Unknown ATS URL/content | Unit test | Generic type returned only as fallback | Unknown page may be over-automated | Automated |
| ATSF-004 | Strategy registry resolves one strategy | 07A | ATS Foundation | Critical | Critical | Registry tests available | Multiple registered strategies | Unit test | First valid match selected | Multiple strategies could act on one page | Automated |
| ATSF-005 | SubmitGuard blocks final submit actions | 07A | Safety | Critical | Critical | Submit guard tests available | Submit, Apply Now, Send Application | Unit test | Action blocked, human approval required | Potential unintended application submission | Automated |
| ATSF-006 | Semantic locator priority is accessibility-first | 07A | ATS Foundation | High | High | Locator tests available | Label, ARIA, placeholder, CSS candidates | Unit test | Expected locator priority order | Strategies become brittle | Automated |
| ATSF-007 | Resume PDF path validator rejects unsafe paths | 07A | Security | Medium | Medium | Validator tests available | Non-PDF or traversal path | Unit test | Unsafe path rejected | Unsafe file access or upload attempt | Automated |
| ATSF-008 | Apply CLI scaffold remains non-executing | 07A | CLI | Medium | Medium | CLI tests available | `apply --help` | CLI integration test | Help output only, no browser opened | Scaffold could imply live automation | Automated |

## ATS Strategies Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ATSS-001 | Greenhouse strategy fills fixture personal fields | 07B | ATS Strategies | High | High | Greenhouse fixture available | Applicant profile and fixture page | Unit fixture test | Obvious fields filled through adapter | Greenhouse path unusable | Automated |
| ATSS-002 | Lever strategy fills fixture personal fields | 07B | ATS Strategies | High | High | Lever fixture available | Applicant profile and fixture page | Unit fixture test | Obvious fields filled through adapter | Lever path unusable | Automated |
| ATSS-003 | Generic strategy fills obvious fields only | 07B | ATS Strategies | High | High | Generic fixture available | Applicant profile and ambiguous fields | Unit fixture test | Obvious fields filled, ambiguous skipped | Unknown ATS pages over-automated | Automated |
| ATSS-004 | Every strategy ends at human approval | 07B | Safety | Critical | Critical | Strategy tests available | Strategy execution request | Unit fixture test | `HUMAN_APPROVAL_REQUIRED` returned | Unsafe automated submission path | Automated |
| ATSS-005 | SubmitGuard is checked before button-like actions | 07B | Safety | Critical | Critical | Strategy tests available | Button-like candidates | Unit test | Submit-adjacent actions blocked | Potential final-submit click | Automated |
| ATSS-006 | Resume upload verifier confirms visible filename | 07B | ATS Strategies | High | High | Upload fixture available | Resume PDF placeholder | Unit fixture test | Upload verified through adapter | Resume may not attach | Automated |
| ATSS-007 | Screening handler fills only safe matches | 07B | ATS Strategies | High | High | Screening fixtures available | Known question-answer pairs | Unit test | Clear matches filled, ambiguous skipped | Unsupported answers may be entered | Automated |
| ATSS-008 | ATS automation service delegates through registry | 07B | ATS Strategies | Medium | Medium | Fake registry/strategy available | Automation request | Unit test | Registry-selected strategy executes | Use case may bypass strategy pattern | Automated |

## Workday Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| WD-001 | Workday state detector identifies current state | 07C | Workday | Critical | Critical | Workday fixtures available | Mock Workday pages | Unit fixture test | Correct current state returned | Workday checkpointing becomes unsafe | Automated |
| WD-002 | Workday transition validator rejects invalid moves | 07C | Workday | Critical | Critical | State machine tests available | Invalid state transition | Unit test | Transition rejected | Workday flow may skip required states | Automated |
| WD-003 | Workday strategy does not auto-progress states | 07C | Safety | Critical | Critical | Workday strategy tests available | Mock Workday current state | Unit test | Strategy detects and stops safely | Unapproved production-like Workday navigation | Automated |
| WD-004 | Login or session required states stop safely | 07C | Workday | High | High | Workday fixtures available | Login/session state page | Unit fixture test | Safe stop and checkpoint payload | Session handling becomes unsafe | Automated |
| WD-005 | Workday checkpoint payload is deterministic | 07C | Workday | High | High | Checkpoint builder tests available | State and context | Unit test | Expected checkpoint payload | Recovery cannot trust checkpoints | Automated |
| WD-006 | Workday fixture tests use local pages only | 07C | Safety | High | High | Fixture config available | Workday mock fixture path | Test/audit | No live Workday URL required | Automated tests depend on live site | Automated |

## ATS Reliability Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| REL-001 | Failure capture builds controlled payloads | 07D | ATS Reliability | High | High | Failure capture tests available | Strategy failure context | Unit test | Structured safe failure payload | Failures become opaque or unsafe | Automated |
| REL-002 | Failure capture excludes sensitive values | 07D | Security | Critical | Critical | Redaction tests available | Failure with secret-like values | Unit test | Secrets omitted or redacted | Secret exposure in diagnostics | Automated |
| REL-003 | Screenshot path builder uses ignored storage | 07D | Security | Critical | Critical | Path tests available | Execution ID and failure ID | Unit test | Path under ignored screenshot storage | Sensitive screenshots may be committed | Automated |
| REL-004 | Session storage path builder uses ignored storage | 07D | Security | Critical | Critical | Path tests available | Execution ID/session ID | Unit test | Path under ignored session storage | Cookies/session files may be committed | Automated |
| REL-005 | Checkpoint boundary stays ATS-scoped | 07D | ATS Reliability | Critical | Critical | Checkpoint tests available | ATS checkpoint payload | Unit test | No lifecycle event behavior created | Phase 8 behavior leaks backward | Automated |
| REL-006 | Retry policy identifies retryable failures | 07D | ATS Reliability | High | High | Retry tests available | Timeout/transient failures | Unit test | Retry allowed only when safe | Reliability recovery is weak | Automated |
| REL-007 | Retry policy blocks unsafe retries | 07D | Safety | High | High | Retry tests available | Submit-adjacent failure | Unit test | No retry allowed | Unsafe repeated submit action | Automated |
| REL-008 | Artifact security scan protects screenshots and sessions | 07D | Security | Critical | Critical | Git ignore and path tests available | Storage artifact paths | Security test/audit | Artifacts ignored and untracked | Sensitive files may reach repo | Automated |

## Security Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| SEC-001 | Real secrets are not tracked | 00-07D | Security | Critical | Critical | Git available | `.env`, secret patterns | Git/secret scan | No real secrets tracked | Credential compromise | Automated scan |
| SEC-002 | `.env.example` contains placeholders only | 00-07D | Security | Critical | Critical | Example env available | `.env.example` | File inspection | Placeholder values only | Secrets copied into docs | Automated/manual |
| SEC-003 | Service role key never appears in output | 00-07D | Security | Critical | Critical | CLI and logs available | CLI smoke/test output | Output scan | No service role key printed | Database compromise | Automated scan |
| SEC-004 | LLM and embedding keys never appear in output | 04-05 | Security | Critical | Critical | Provider tests available | Provider errors/output | Unit/output scan | No API key printed | Provider credential compromise | Automated |
| SEC-005 | Artifact storage stays ignored | 06-07D | Security | Critical | Critical | Git ignore available | Resume, screenshot, session paths | Git/path scan | Storage artifacts not tracked | Sensitive artifact exposure | Automated scan |
| SEC-006 | PDF rendering uses escaped LaTeX input | 06 | Security | Critical | Critical | Escape tests available | LaTeX reserved chars | Unit test | Reserved chars escaped | Broken or unsafe rendered output | Automated |
| SEC-007 | ATS submit safety cannot be bypassed | 07A-07D | Safety | Critical | Critical | Submit tests available | Submit labels/actions | Unit test | Blocked and human approval required | Unintended application submission | Automated |
| SEC-008 | Checkpoints exclude credentials and cookies | 07C-07D | Security | High | High | Checkpoint tests available | Session-like checkpoint context | Unit test | Sensitive values omitted | Sensitive state exposure | Automated |
| SEC-009 | Provider tests use mocks only | 04-05 | Security | High | High | Provider tests available | Fake provider requests | Unit test/audit | No live network or real key usage | Automated tests leak to external services | Automated |

## Architecture Boundaries Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ARCH-001 | No Supabase queries outside repositories | 00-07D | Architecture Boundaries | Critical | Critical | Source tree available | `from`, `rpc`, Supabase imports | Source scan | Supabase syntax only in repositories/integration shell | Data boundary violation | Automated scan |
| ARCH-002 | CLI contains no business logic | 00-07D | Architecture Boundaries | Critical | Critical | Source tree available | CLI command files | Source review/scan | CLI parses, invokes, displays only | CLI becomes untestable workflow layer | Automated/manual |
| ARCH-003 | Domain layer remains pure | 00-07D | Architecture Boundaries | Critical | Critical | Source tree available | Domain imports | Source scan | No Supabase, provider, Playwright, fs, env imports | Domain coupling and hidden side effects | Automated scan |
| ARCH-004 | Provider SDK/network logic stays in integrations | 04-05 | Architecture Boundaries | Critical | Critical | Source tree available | Provider imports and fetch calls | Source scan | Business logic depends on interfaces | Provider lock-in or live calls in services | Automated scan |
| ARCH-005 | Use cases orchestrate without business logic | 01-07D | Architecture Boundaries | High | High | Use-case tests available | Use-case source | Source review/unit tests | Use cases coordinate collaborators only | Layering drift | Automated/manual |
| ARCH-006 | Services do not access Supabase directly | 01-07D | Architecture Boundaries | High | High | Source tree available | Service imports | Source scan | Services use repositories/interfaces | Business logic bypasses persistence boundary | Automated scan |
| ARCH-007 | ATS strategies use adapter boundary | 07B-07D | Architecture Boundaries | High | High | Strategy source available | Strategy files | Source scan/test | Strategies call `ATSPageAdapter` only | Hidden browser scripts appear | Automated/manual |
| ARCH-008 | Reliability does not become lifecycle/observability | 07D | Architecture Boundaries | High | High | Reliability source available | Checkpoint/failure modules | Source review/unit tests | ATS-scoped boundaries only | Future Phase 8/9 behavior leaks backward | Automated/manual |

## CLI Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CLI-001 | Root CLI help renders | 00 | CLI | High | High | Built CLI available | `jobflow --help` | CLI smoke test | Help output renders | CLI entrypoint broken | Automated |
| CLI-002 | Discover CLI help and options render | 01 | CLI | Medium | Medium | Built CLI available | `discover --help` | CLI smoke/integration test | Help output renders | Discovery UX regresses | Automated |
| CLI-003 | Parse CLI help and options render | 02 | CLI | Medium | Medium | Built CLI available | `parse --help` | CLI smoke/integration test | Help output renders | Parsing UX regresses | Automated |
| CLI-004 | Score CLI help and options render | 03 | CLI | Medium | Medium | Built CLI available | `score --help` | CLI smoke/integration test | Help output renders | Scoring UX regresses | Automated |
| CLI-005 | Fragments CLI help and options render | 04 | CLI | Medium | Medium | Built CLI available | `fragments --help` | CLI smoke/integration test | Help output renders | Resume intelligence UX regresses | Automated |
| CLI-006 | Generate CLI help and options render | 05 | CLI | Medium | Medium | Built CLI available | `generate --help` | CLI smoke/integration test | Help output renders | Generation UX regresses | Automated |
| CLI-007 | Render CLI help and options render | 06 | CLI | Medium | Medium | Built CLI available | `render --help` | CLI smoke/integration test | Help output renders | Rendering UX regresses | Automated |
| CLI-008 | Apply CLI remains scaffold-safe | 07A-07D | CLI | High | High | Built CLI available | `apply --help` and apply scaffold options | CLI smoke/integration test | Help/scaffold output only, no live browser | ATS automation may start unexpectedly | Automated |

## Repositories Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| REPO-001 | Job repository maps `jobs` fields | 01 | Repositories | Critical | Critical | Mock Supabase client available | Job persistence payload | Repository integration test | Correct table and field mapping | Discovery persistence corrupts jobs | Automated |
| REPO-002 | Parsed job repository maps `parsed_job_profiles` | 02 | Repositories | High | High | Mock Supabase client available | Parsed profile payload | Repository integration test | Correct mapping | Parsing persistence breaks | Automated |
| REPO-003 | Match score repository maps `job_match_scores` | 03 | Repositories | High | High | Mock Supabase client available | Score payload | Repository integration test | Correct mapping | Score history/data breaks | Automated |
| REPO-004 | User profile repository maps `user_profile` | 03 | Repositories | High | High | Mock Supabase client available | User profile lookup | Repository integration test | Correct lookup mapping | Scoring uses wrong profile data | Automated |
| REPO-005 | Resume fragment repository maps inserts and RPC | 04 | Repositories | High | High | Mock Supabase client available | Fragment insert and `match_resume_fragments` request | Repository integration test | Correct insert/RPC mapping | Retrieval context breaks | Automated |
| REPO-006 | Generated document repository maps artifacts | 05 | Repositories | High | High | Mock Supabase client available | Generated document payload | Repository integration test | Correct mapping | Generated artifacts persist incorrectly | Automated |
| REPO-007 | Generated resume repository maps rendered artifacts | 06 | Repositories | High | High | Mock Supabase client available | Rendered resume metadata | Repository integration test | Correct mapping | Rendered artifact persistence breaks | Automated |

## Providers Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PROV-001 | Embedding provider uses configurable base URL/model | 04 | Providers | Critical | Critical | Fake env/config available | Provider config | Unit test | No hardcoded provider endpoint or model | Provider-agnostic architecture breaks | Automated |
| PROV-002 | Generation provider uses configurable base URL/model | 05 | Providers | Critical | Critical | Fake env/config available | Provider config | Unit test | No hardcoded provider endpoint or model | Provider lock-in | Automated |
| PROV-003 | Provider errors are safe | 04-05 | Providers | High | High | Provider tests available | Failed provider response | Unit test | Safe error without secrets | Secret leak or poor diagnostics | Automated |
| PROV-004 | Provider interfaces are mockable | 04-05 | Providers | High | High | Fake providers available | Service requests | Unit test | Services use interface fakes | Live calls leak into tests | Automated |
| PROV-005 | PDF compiler provider is mockable | 06 | Providers | Critical | Critical | Mock compiler available | Compile request | Unit test | No real compiler required in automated tests | CI requires local LaTeX | Automated |

## CI Matrix

| Test ID | Title | Phase | Category | Priority | Risk Level | Preconditions | Input | Execution Method | Expected Result | Failure Impact | Automation Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CI-001 | CI runs core gates on Node.js 22 | 00-07D | CI | Critical | Critical | GitHub Actions workflow available | Push, PR, manual dispatch | CI run | `npm ci`, lint, typecheck, test, build pass | Regressions reach main | Automated |
| CI-002 | CI uses fake placeholder environment only | 00-07D | CI | High | High | Workflow env available | CI environment | Workflow review/CI run | No real credentials required | CI depends on secrets or leaks values | Automated/manual |
| CI-003 | CI avoids live external dependencies | 00-07D | CI | High | High | Workflow available | CI execution | CI run/review | No live Supabase, provider, ATS, Playwright, or LaTeX requirement | CI becomes flaky or unsafe | Automated/manual |

## Master Regression Suite

Must run every release:

- All Critical tests.
- All High tests.
- Full lint, typecheck, test, and build gates.
- All compiled CLI smoke tests.
- Security scan for secrets and tracked artifacts.
- Architecture boundary scans.
- CI workflow validation.

Must run before major refactor:

- Architecture boundary matrix.
- Repository matrix.
- Provider matrix.
- CLI matrix.
- Full unit and integration suite.
- Source scans for Supabase, environment, provider, filesystem, and ATS browser boundary drift.

Must run before ATS changes:

- ATS Foundation matrix.
- ATS Strategies matrix.
- Workday matrix.
- ATS Reliability matrix.
- Security matrix tests for submit safety, screenshots, sessions, checkpoints, and artifacts.
- CLI apply scaffold tests.
- Local fixture-only ATS tests.

Must run before lifecycle phase:

- Foundation through rendering regression path.
- Full ATS safety and reliability matrix.
- Checkpoint boundary tests proving Phase 7D has not become lifecycle state management.
- Repository boundary tests.
- Security and artifact safety scans.
- Documentation review for Phase 8 scope boundaries.

## Recommended Execution Order

Recommended order after explicit approval:

1. Check working tree for unexpected generated artifacts.
2. Run lint.
3. Run typecheck.
4. Run targeted unit tests by phase.
5. Run repository integration tests with mocked Supabase clients.
6. Run CLI integration tests.
7. Run full test suite.
8. Run build.
9. Run compiled CLI smoke tests.
10. Run architecture boundary scans.
11. Run security scans.
12. Review failures by priority.
13. Block release on any Critical or unresolved High failure.

Planned commands after approval:

```bash
npm run lint
npm run typecheck
npm test -- tests/unit/config
npm test -- tests/unit/services/discovery
npm test -- tests/unit/services/parsing
npm test -- tests/unit/services/scoring
npm test -- tests/unit/services/resume-intelligence
npm test -- tests/unit/services/document-generation
npm test -- tests/unit/services/resume-rendering
npm test -- tests/unit/services/ats
npm test -- tests/integration/repositories
npm test -- tests/integration/cli-health.test.ts tests/integration/cli-discover.test.ts tests/integration/cli-parse.test.ts tests/integration/cli-score.test.ts tests/integration/cli-fragments.test.ts tests/integration/cli-generate.test.ts tests/integration/cli-render.test.ts tests/integration/cli-apply.test.ts
npm test
npm run build
node dist\src\cli\index.js --help
node dist\src\cli\index.js discover --help
node dist\src\cli\index.js parse --help
node dist\src\cli\index.js score --help
node dist\src\cli\index.js fragments --help
node dist\src\cli\index.js generate --help
node dist\src\cli\index.js render --help
node dist\src\cli\index.js apply --help
```

Planned architecture and security scans after approval:

```bash
rg "@supabase|createSupabaseClient|\.from\(|\.rpc\(" src
rg "process\.env|loadEnvFile|node:process" src
rg "console\.|from\(|rpc\(|fetch\(" src\cli src\services src\domain src\use-cases
rg "@supabase|node:process|loadEnv|OpenAI|fetch|fs|playwright|process\.env" src\domain src\services src\use-cases
git ls-files .env storage screenshots dist
rg "SUPABASE_SERVICE_ROLE_KEY|LLM_API_KEY|sk-[A-Za-z0-9]|service_role|Bearer [A-Za-z0-9]" --glob "!dist/**" --glob "!node_modules/**"
```

## Approval Required Before Execution

No tests were executed during this planning task.

Test execution requires explicit user approval.
