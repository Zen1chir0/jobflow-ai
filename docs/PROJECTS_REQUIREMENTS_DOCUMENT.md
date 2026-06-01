# JobFlow AI

## Product Requirements Document (PRD)

Version: 3.0

Author: Kenneth Flororita

Status: Planning

Target Audience:

* Codex
* Future Contributors
* Engineering Reviewers

---

# Executive Summary

JobFlow AI is a CLI-first job application orchestration platform designed to automate the repetitive operational aspects of the job application lifecycle while maintaining strict human approval over submission actions.

The system combines:

* Job Discovery
* Job Parsing
* Semantic Resume Retrieval
* Deterministic Match Scoring
* Resume Generation
* LaTeX Resume Rendering
* ATS Browser Automation
* Lifecycle Tracking
* Observability
* Analytics

The platform is intentionally designed as an orchestration system rather than a simple autofill script.

Core philosophy:

1. Deterministic before AI.
2. Human approval before submission.
3. Event sourcing before mutable state.
4. Modular services before monoliths.
5. Content generation separated from presentation rendering.

---

# Product Goals

Primary goals:

* Reduce manual application effort.
* Increase application throughput.
* Improve resume-job alignment.
* Maintain complete auditability.
* Provide measurable analytics.

Success Metrics:

* Applications submitted/week
* Interview conversion rate
* Response rate
* Resume generation time
* ATS autofill success rate
* Application recovery success rate after failures

---

# High-Level Architecture

Job Discovery Service

↓

Job Parsing Service

↓

Match Scoring Service

↓

Resume Intelligence Service

↓

Document Generation Service

↓

Resume Rendering Service

↓

Application Automation Service

↓

Lifecycle Service

↓

Observability Service

↓

Analytics Service

---

# System Design Principles

## Principle 1

Deterministic Before AI

Never use AI when deterministic computation is possible.

Examples:

* ATS detection
* scoring
* duplicate detection
* state transitions
* event reconstruction

must remain deterministic.

---

## Principle 2

AI Generates

AI may:

* generate resume bullets
* generate summaries
* generate cover letters

AI may not:

* assign final priority rankings
* transition application states
* auto-submit applications

---

## Principle 3

Event Sourcing

All state changes must generate immutable events.

Current state is a projection.

Event history is the source of truth.

---

## Principle 4

Human Approval Required

The system must never submit applications automatically.

Final submission must always require user approval.

---

# Component 1: Job Discovery Service

Purpose:

Collect job opportunities from supported platforms.

Responsibilities:

* discover jobs
* normalize data
* deduplicate records
* update existing jobs

Sources:

* LinkedIn
* Wellfound
* RemoteOK
* Company Career Pages
* Manual URLs

Technology:

* Playwright
* TypeScript

Architecture:

```text
Crawler
↓
Normalizer
↓
Deduplicator
↓
Repository
↓
Supabase
```

Output:

```json
{
  "job_id": "...",
  "title": "...",
  "company": "...",
  "location": "...",
  "salary": "...",
  "description": "...",
  "application_url": "..."
}
```

---

# Component 2: Job Parsing Service

Purpose:

Convert raw descriptions into structured job intelligence.

Pipeline:

1. HTML Extraction
2. Content Cleaning
3. Section Extraction
4. Metadata Extraction
5. Embedding Generation

Extracted Data:

* Responsibilities
* Required Skills
* Preferred Skills
* Seniority
* Industry
* Compensation
* Location
* Remote Type

Output:

```json
{
  "required_skills": [],
  "preferred_skills": [],
  "industry": "",
  "seniority": ""
}
```

---

# Component 3: Resume Intelligence Service

Purpose:

Provide targeted career context to generation workflows.

Problem:

Passing entire resumes to LLMs creates:

* high cost
* latency
* context pollution

Solution:

Semantic Retrieval using pgvector.

---

Resume Fragmentation

Master resume is decomposed into atomic fragments.

Examples:

* projects
* work experience
* certifications
* leadership
* technical skills

Table:

user_resume_fragments

Columns:

* id
* fragment_text
* fragment_type
* embedding
* metadata

---

Retrieval Pipeline

Job Description

↓

Embedding Generation

↓

Similarity Search

↓

Top N Fragments

↓

Prompt Construction

↓

LLM

---

Similarity Search

Retrieve only fragments exceeding similarity threshold.

Default:

Top 5 fragments

Minimum similarity:

0.72

Expected Benefits:

* 60–70% token reduction
* improved relevance
* lower cost
* faster response

---

# Component 4: Match Scoring Service

Purpose:

Generate deterministic job priority rankings.

Formula:

Final Score

=

40% Skill Match

*

25% Experience Match

*

10% Industry Match

*

10% Location Match

*

15% Compensation Match

---

Skill Match

Intersection coefficient between:

required_skills

and

verified_user_skills

---

Experience Match

Lookup Table

Match = 100

One Level Below = 50

One Level Above = 80

Multiple Levels Difference = 0

---

Industry Match

Direct comparison against preferred industries.

---

Location Match

Remote preference comparison.

---

Compensation Match

Deterministic salary evaluation.

---

Output

```json
{
  "skill_match": 90,
  "experience_match": 80,
  "industry_match": 100,
  "location_match": 100,
  "salary_match": 75,
  "final_score": 88
}
```

All score components must be stored.

---

# Component 5: Document Generation Service

Purpose:

Generate structured application content.

Outputs:

* resume JSON
* cover letter
* recruiter message
* screening question responses

Important:

LLM generates content.

LLM does not generate PDFs.

Output Format:

```json
{
  "summary": "...",
  "skills": [],
  "experience": []
}
```

Store:

* prompt
* context
* response
* model
* timestamp

---

# Component 6: Resume Rendering Service

Purpose:

Convert structured resume data into professional ATS-friendly PDFs.

Architecture:

Resume JSON

↓

Template Engine

↓

LaTeX Source

↓

PDF Compiler

↓

PDF Artifact

---

Template Engine

Supported:

* Handlebars
* Mustache
* EJS

Templates:

templates/

* ats.tex
* compact.tex
* modern.tex
* technical.tex

---

PDF Compiler

Preferred:

latexmk

Fallback:

pdflatex

Outputs:

* resume.json
* resume.tex
* resume.pdf

---

Database Storage

generated_resumes

Columns:

* id
* job_id
* template
* resume_json
* latex_source
* pdf_path
* created_at

---

# Component 7: Application Automation Service

Purpose:

Automate ATS interactions.

Technology:

Playwright

---

ATS Strategy Registry

Architecture:

ATSStrategy

↓

GreenhouseStrategy

LeverStrategy

WorkdayStrategy

GenericStrategy

---

Greenhouse Strategy

Characteristics:

* flat DOM
* predictable fields

Optimization:

Fast sequential filling.

---

Lever Strategy

Characteristics:

* flat structure
* straightforward mapping

Optimization:

Linear execution.

---

Workday Strategy

Characteristics:

* dynamic rendering
* step navigation
* network-heavy transitions

Requirements:

* state machine navigation
* networkidle synchronization
* block-based processing

---

Semantic Locator Layer

Priority Order:

1. ARIA Roles
2. Labels
3. Associated Text
4. Placeholders
5. Data Attributes
6. CSS Selectors

Preferred:

getByRole()

Avoid:

fragile CSS selectors

---

Session Persistence

Use:

storageState()

Persist:

* cookies
* local storage
* session storage

---

Human Approval

Application submission disabled by default.

User must explicitly approve final submission.

---

# Component 8: Lifecycle Service

Purpose:

Maintain application integrity.

State Machine:

DISCOVERED

↓

ANALYZED

↓

READY_TO_APPLY

↓

AUTOFILL_STARTED

↓

AUTOFILL_COMPLETED

↓

SUBMITTED

↓

ASSESSMENT

↓

INTERVIEW

↓

OFFER

↓

HIRED

Failure States:

* REJECTED
* WITHDRAWN
* GHOSTED

---

Event Sourcing

Applications table:

Current snapshot.

Application Events table:

Immutable history.

---

Transactional Auditing

Every state transition must generate an event.

Events must include:

* application_id
* from_state
* to_state
* timestamp
* execution_id
* metadata

---

# Component 9: Observability Service

Purpose:

Capture operational telemetry.

Track:

* ATS failures
* parsing failures
* upload failures
* generation failures
* crawler failures

Example:

```json
{
  "ats": "workday",
  "step": "upload_resume",
  "status": "failed",
  "error": "file_input_not_found"
}
```

Goals:

* debugging
* incident investigation
* failure analytics

---

# Component 10: Analytics Service

Purpose:

Measure job search effectiveness.

Metrics:

* Applications Submitted
* Interview Rate
* Offer Rate
* Response Rate
* Rejection Rate
* Average Match Score

Advanced Analytics:

* Resume Variant Performance
* Skill Correlation Analysis
* Platform Effectiveness
* Industry Conversion Rates

---

# Technical Stack

CLI

* Commander.js

Backend

* Node.js
* TypeScript

Database

* Supabase PostgreSQL
* pgvector

Automation

* Playwright

AI

* OpenAI
* Claude

Workflow Orchestration

* n8n

Infrastructure

* Docker
* GitHub Actions

Future UI

* Next.js
* React

---

# MVP Scope

Included:

* Job Discovery
* Job Parsing
* Resume Retrieval
* Match Scoring
* Resume Generation
* LaTeX Rendering
* ATS Autofill
* Lifecycle Tracking
* Observability

Excluded:

* SaaS Multi-Tenancy
* Autonomous Submission
* Recruiter CRM
* Public Dashboard

---

# Definition of Success

A user can:

1. Discover jobs automatically.
2. Rank jobs deterministically.
3. Generate tailored resumes.
4. Generate ATS-friendly PDFs through LaTeX.
5. Generate cover letters.
6. Autofill ATS applications.
7. Recover from automation failures.
8. Track application lifecycle events.
9. Analyze application performance.

The system should function as a reliable job application orchestration platform, not a browser automation script.
