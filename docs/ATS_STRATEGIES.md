# JobFlow AI

## ATS Strategies Document

Version: 1.0

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

# 3. Supported ATS Strategies

Initial supported strategies:

```text
GreenhouseStrategy
LeverStrategy
WorkdayStrategy
GenericStrategy
```

---

# 4. Strategy Interface

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

# 5. ATS Detection Rules

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

# 6. Greenhouse Strategy

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

# 7. Lever Strategy

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

# 8. Workday Strategy

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

# 9. Workday State Machine

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

# 10. Workday Synchronization Rules

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

# 11. Generic Strategy

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

# 12. Semantic Locator Service

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

# 13. Field Mapping Layer

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

# 14. Session Persistence

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

# 15. Interaction Stability

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

# 16. File Upload Rules

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

# 17. Human Approval Boundary

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

# 18. Checkpointing

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

# 19. Error Handling

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

# 20. Screenshots

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

# 21. Testing Strategy

## Unit Tests

Test:

* ATS detection
* field mapping resolution
* state transition validation

## Integration Tests

Use mock HTML pages for:

* Greenhouse
* Lever
* Workday
* Generic

## E2E Tests

Test full automation flow against local static HTML fixtures.

Do not rely on live job sites for automated tests.

---

# 22. Non-Negotiables

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

# 23. MVP ATS Scope

MVP must support:

* Greenhouse basic autofill
* Lever basic autofill
* Generic conservative autofill
* Workday partial state machine scaffold

Workday full support can be completed after basic ATS strategies are stable.
