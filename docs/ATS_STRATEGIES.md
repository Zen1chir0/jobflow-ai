# JobFlow AI

## ATS Strategies Document

Version: 1.1

Author: Kenneth Flororita

Status: Planning

---

# 1. Purpose

This document defines how JobFlow AI handles ATS-specific browser automation using Playwright.

The Application Automation Service must not treat all job application pages the same.

Each ATS platform has different DOM structure, navigation behavior, and form complexity.

Therefore, JobFlow AI uses a Strategy Pattern.

---

# 2. Core Rule

Do not build one giant Playwright script.

Every ATS must be isolated behind a strategy class.

```text
ATSAutomationService
↓
ATSStrategyRegistry
↓
Resolved ATSStrategy
↓
Platform-Specific Execution
```

---

# 3. Approved Phase 7 Split

Phase 7 is no longer a single implementation phase.

Approved structure:

```text
Phase 7A - ATS Automation Foundation
Phase 7B - Greenhouse / Lever / Generic Strategies
Phase 7C - Workday State Machine
Phase 7D - ATS Reliability Hardening
```

## Phase 7A - ATS Automation Foundation

Responsibilities:

* define `ATSStrategy`
* implement ATS type detection utilities
* implement `ATSStrategyRegistry`
* implement `SemanticLocatorService`
* define applicant/profile input types
* validate resume PDF paths
* implement submit guard utility
* create mock ATS HTML fixture structure
* scaffold `jobflow apply --help`

Boundaries:

* no live ATS automation
* no Greenhouse, Lever, Generic, or Workday execution
* no lifecycle, observability, analytics, or final submission

Completion gate:

* detection tests pass
* registry tests pass
* semantic locator ordering tests pass
* submit guard tests pass
* mock fixture structure exists
* `node dist\src\cli\index.js apply --help` passes

## Phase 7B - Greenhouse / Lever / Generic Strategies

Responsibilities:

* implement Greenhouse strategy against mock fixture
* implement Lever strategy against mock fixture
* implement conservative Generic strategy against mock fixture
* fill safely resolvable personal information fields
* upload resume files with verification
* answer screening questions only when fields are safely resolvable
* stop at `HUMAN_APPROVAL_REQUIRED`

Boundaries:

* no Workday implementation
* no final submit action
* no lifecycle, observability, or analytics service

Completion gate:

* Greenhouse mock fixture tests pass
* Lever mock fixture tests pass
* Generic mock fixture tests pass
* upload verification tests pass
* human approval boundary tests pass

## Phase 7C - Workday State Machine

Responsibilities:

* define Workday states
* validate Workday transitions
* detect Workday page state
* implement Workday scaffold strategy
* test against mock Workday multi-step fixture
* handle login/session-required states
* create checkpoint boundaries per state

Boundaries:

* Workday must not be automated as a flat form
* no aggressive production Workday claims
* no final submit action
* no lifecycle, observability, or analytics service

Completion gate:

* Workday state transition tests pass
* Workday mock multi-step fixture tests pass
* checkpoint boundary tests pass
* login/session-required handling tests pass

## Phase 7D - ATS Reliability Hardening

Responsibilities:

* implement failure capture boundary
* implement screenshot path builder
* implement checkpoint persistence or checkpoint repository boundary
* handle session storage paths
* define retry/stability policy
* harden upload verification
* add cross-strategy failure tests
* verify screenshot/session artifact security

Boundaries:

* no final submit action
* no lifecycle, observability, or analytics service

Completion gate:

* screenshot path/security tests pass
* failure handling tests pass
* session persistence path tests pass
* recovery/checkpoint tests pass
* storage artifact security scan passes

---

# 4. Supported ATS Strategies

Initial supported strategies:

```text
GreenhouseStrategy
LeverStrategy
WorkdayStrategy
GenericStrategy
```

---

# 5. Strategy Interface

```ts
export interface ATSStrategy {
  type: ATSType;

  detect(url: string, page: Page): Promise<boolean>;

  initialize(page: Page): Promise<void>;

  fillPersonalInfo(data: ApplicantProfile): Promise<void>;

  uploadResume(filePath: string): Promise<void>;

  answerScreeningQuestions(
    answers: ScreeningAnswer[]
  ): Promise<void>;

  pauseForHumanReview(): Promise<void>;
}
```

---

# 6. ATS Detection Rules

Detection should be deterministic.

## Greenhouse

Detect using:

```text
greenhouse.io
boards.greenhouse.io
job_application
```

## Lever

Detect using:

```text
jobs.lever.co
lever
```

## Workday

Detect using:

```text
myworkdayjobs.com
workday
wd1.myworkdaysite.com
```

## Generic

Fallback strategy when no known ATS is detected.

---

# 7. Greenhouse Strategy

## Characteristics

Greenhouse usually has:

* Flat form structure
* Predictable field names
* Linear page layout
* Minimal multi-step navigation

Example field patterns:

```html
name="job_application[first_name]"
name="job_application[last_name]"
name="job_application[email]"
```

---

## Execution Flow

```text
Open Application URL
↓
Wait For Form
↓
Fill Personal Info
↓
Upload Resume
↓
Fill Required Questions
↓
Pause Before Submit
```

---

## Locator Priority

1. Field name
2. Label
3. Placeholder
4. CSS fallback

Example:

```ts
await page.locator('input[name="job_application[first_name]"]').fill(firstName);
```

Fallback:

```ts
await page.getByLabel(/first name/i).fill(firstName);
```

---

# 8. Lever Strategy

## Characteristics

Lever usually has:

* Simple form sections
* Predictable application flow
* Upload controls
* Optional questions

---

## Execution Flow

```text
Open Application URL
↓
Click Apply If Needed
↓
Fill Contact Section
↓
Upload Resume
↓
Fill Additional Information
↓
Pause Before Submit
```

---

## Locator Priority

1. Label
2. Placeholder
3. Text-neighbor lookup
4. CSS fallback

---

# 9. Workday Strategy

## Characteristics

Workday is complex.

Workday usually has:

* Multi-step workflows
* Dynamic page rendering
* Modal dialogs
* Network-heavy transitions
* Session-sensitive screens
* State-dependent navigation

Workday must not be automated as a simple flat form.

---

# 10. Workday State Machine

Workday automation must use a state machine.

```text
INIT
↓
LOGIN_REQUIRED
↓
PROFILE_IMPORT
↓
PERSONAL_INFO
↓
EXPERIENCE
↓
DOCUMENT_UPLOAD
↓
SCREENING_QUESTIONS
↓
VOLUNTARY_DISCLOSURES
↓
REVIEW
↓
HUMAN_APPROVAL_REQUIRED
```

Each state must:

* verify current page state
* wait for stable DOM
* process visible fields only
* persist checkpoint
* advance only after validation

---

# 11. Workday Synchronization Rules

Before processing fields:

```ts
await page.waitForLoadState("networkidle");
```

Also wait for animations and visible containers:

```ts
await page.locator('[data-automation-id]').first().waitFor({
  state: "visible"
});
```

Avoid fixed sleeps unless used as a fallback.

Preferred:

```ts
await expect(locator).toBeVisible();
```

Avoid:

```ts
await page.waitForTimeout(5000);
```

---

# 12. Generic Strategy

## Purpose

GenericStrategy handles unknown ATS pages.

It should be conservative.

It should not attempt aggressive automation.

---

## Behavior

The GenericStrategy may:

* detect common fields
* fill obvious personal information
* upload resume if file input is visible
* pause for review

The GenericStrategy must not:

* click unknown submit buttons
* assume multi-step behavior
* bypass login flows

---

# 13. Semantic Locator Service

The Semantic Locator Service resolves fields using stable accessibility-first strategies.

Priority order:

```text
ARIA Role
↓
Accessible Label
↓
Placeholder
↓
Associated Text
↓
Data Attribute
↓
CSS Fallback
```

---

## Example API

```ts
await semanticLocator.fillTextField(page, {
  fieldKey: "first_name",
  labels: [/first name/i, /given name/i],
  value: applicant.firstName
});
```

---

## Example Implementation Logic

```ts
const candidates = [
  page.getByRole("textbox", { name: /first name/i }),
  page.getByLabel(/first name/i),
  page.getByPlaceholder(/first name/i),
  page.locator('input[name*="first_name"]')
];

for (const candidate of candidates) {
  if (await candidate.count()) {
    await candidate.first().fill(value);
    return;
  }
}

throw new Error("Unable to resolve first_name field");
```

---

# 14. Field Mapping Layer

Reusable mappings should be stored in the database.

Table:

```text
ats_field_mappings
```

Each mapping contains:

* ats_type
* field_key
* locator_strategy
* locator_value
* priority
* metadata

---

# 15. Session Persistence

Use Playwright storage states.

```ts
await context.storageState({
  path: "storage/playwright-state/workday.json"
});
```

Purpose:

* reduce repeated login friction
* preserve authenticated sessions
* maintain continuity across automation runs

Session files must not be committed to GitHub.

Add to `.gitignore`:

```gitignore
storage/playwright-state/
```

---

# 16. Interaction Stability

Automation should avoid instant unnatural interaction patterns that may break fragile forms.

Use controlled interaction delays for stability.

Examples:

```ts
await locator.fill("");
await locator.pressSequentially(value, { delay: 80 });
```

Click stabilization:

```ts
await locator.hover();
await locator.click();
```

The purpose is reliability, not bypassing platform security.

---

# 17. File Upload Rules

Resume uploads must:

* verify file exists
* verify extension is `.pdf`
* resolve file input
* upload file
* verify uploaded filename appears

Example:

```ts
await page.setInputFiles('input[type="file"]', resumePath);
await expect(page.getByText(/resume.pdf/i)).toBeVisible();
```

---

# 18. Human Approval Boundary

Every strategy must stop before final submission.

The final state should be:

```text
HUMAN_APPROVAL_REQUIRED
```

The system may show:

```text
Application filled. Review the browser and submit manually.
```

The system must not click:

```text
Submit
Send Application
Apply
Finalize
```

unless a future explicit manual approval mechanism is implemented.

---

# 19. Checkpointing

Each major ATS step must persist a checkpoint.

Example:

```json
{
  "current_step": "DOCUMENT_UPLOAD",
  "completed_fields": [
    "first_name",
    "last_name",
    "email"
  ],
  "resume_uploaded": true
}
```

Checkpoint table:

```text
automation_checkpoints
```

---

# 20. Error Handling

On failure, the strategy must:

1. Capture screenshot.
2. Write execution log.
3. Persist checkpoint.
4. Preserve browser context if possible.
5. Return controlled failure.

Example:

```json
{
  "service": "ats",
  "step": "upload_resume",
  "status": "failed",
  "error": "file_input_not_found"
}
```

---

# 21. Screenshots

Screenshots must be stored under:

```text
storage/screenshots/
```

Naming convention:

```text
{execution_id}_{ats_type}_{step}.png
```

Example:

```text
exec_123_workday_upload_resume.png
```

---

# 22. Testing Strategy

Phase 7 testing must be mock-first and fixture-driven.

Automated tests must not use live job sites, real ATS credentials, or real browser sessions.

## Unit Tests

Test:

* ATS detection
* field mapping resolution
* state transition validation
* strategy registry resolution
* semantic locator fallback priority
* submit guard behavior
* resume upload path validation
* Workday transition validation
* checkpoint payload construction
* screenshot path generation

## Integration Tests

Use mock HTML pages for:

* Greenhouse
* Lever
* Workday
* Generic
* resume upload fixture
* human approval stop state

## E2E Tests

Test full automation flow against local static HTML fixtures.

Do not rely on live job sites for automated tests.

Do not use Playwright against external ATS pages in automated tests.

---

# 23. Non-Negotiables

1. Do not create one universal ATS script.
2. Do not click final submit.
3. Do not use CSS selectors first.
4. Do not skip checkpoints.
5. Do not ignore upload verification.
6. Do not store session state in Git.
7. Do not treat Workday as a flat form.
8. Do not swallow Playwright errors silently.
9. Do not run ATS automation without execution logging.
10. Do not continue after unknown critical fields fail.

---

# 24. MVP ATS Scope

MVP ATS automation is delivered through the Phase 7A-7D split:

* Phase 7A: ATS foundation and safe `jobflow apply` CLI scaffold
* Phase 7B: Greenhouse basic autofill, Lever basic autofill, and Generic conservative autofill
* Phase 7C: Workday partial state-machine scaffold
* Phase 7D: reliability hardening, failure capture, screenshots, sessions, checkpoints, and upload verification

Workday full support can be completed only after Phase 7C and Phase 7D gates are satisfied.
