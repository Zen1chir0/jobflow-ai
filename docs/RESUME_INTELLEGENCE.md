# JobFlow AI

## Resume Intelligence Architecture

Version: 1.0

Author: Kenneth Flororita

Status: Planning

---

# 1. Purpose

The Resume Intelligence Service is responsible for transforming a user's complete career history into targeted context that can be efficiently consumed by LLMs.

The service exists to solve three problems:

1. Context Window Inflation
2. Token Cost Growth
3. Resume Relevance Degradation

The system must never send an entire master resume to an LLM when only a small subset of information is relevant.

Instead, JobFlow AI uses semantic retrieval powered by pgvector.

---

# 2. Core Philosophy

Bad:

```text
Entire Resume
+
Entire Portfolio
+
Entire Job History
+
Entire Job Description
↓
LLM
```

Result:

* expensive
* slow
* noisy
* inconsistent

---

Good:

```text
Job Description
↓
Embedding
↓
Similarity Search
↓
Top Resume Fragments
↓
Prompt Construction
↓
LLM
```

Result:

* cheaper
* faster
* more relevant
* more deterministic

---

# 3. High-Level Architecture

```text
Master Profile
↓
Resume Fragmenter
↓
Resume Fragments
↓
Embedding Generation
↓
pgvector Storage

=========================

Job Description
↓
Embedding Generation
↓
Similarity Search
↓
Top Matching Fragments
↓
Prompt Context Builder
↓
Document Generation Service
```

---

# 4. Master Career Knowledge Base

The user's career history is not treated as a resume.

It is treated as a knowledge base.

The knowledge base contains:

* work experience
* projects
* leadership
* technical skills
* certifications
* education

Each component is stored independently.

---

# 5. Fragment Types

## Project Fragment

Example:

```json
{
  "type": "project",
  "title": "FlowSentinel",
  "description": "Built incident classification platform using n8n and Supabase.",
  "tech_stack": [
    "n8n",
    "Supabase",
    "PostgreSQL"
  ]
}
```

---

## Work Experience Fragment

```json
{
  "type": "work_experience",
  "company": "AgentGenius",
  "role": "AI Automation Engineer",
  "content": "Built automation workflows and monitoring systems."
}
```

---

## Leadership Fragment

```json
{
  "type": "leadership",
  "title": "Project Lead",
  "content": "Led team of engineers on applicant management platform."
}
```

---

## Skill Fragment

```json
{
  "type": "skill",
  "skill": "Playwright",
  "content": "Built automation frameworks using Playwright and TypeScript."
}
```

---

# 6. Fragment Design Rules

Every fragment must be atomic.

Bad:

```text
Entire Resume
```

---

Good:

```text
Project A
Project B
Leadership Experience
Playwright Experience
Supabase Experience
```

Each fragment should represent one idea.

---

# 7. Embedding Pipeline

Every fragment receives an embedding.

Pipeline:

```text
Fragment
↓
Embedding Model
↓
1536-Dimensional Vector
↓
pgvector
```

---

Stored In:

```sql
user_resume_fragments
```

---

# 8. Job Embedding Pipeline

Every parsed job description receives an embedding.

Pipeline:

```text
Job Description
↓
Job Parser
↓
Normalized Description
↓
Embedding Model
↓
Vector Storage
```

Stored In:

```sql
parsed_job_profiles.embedding
```

---

# 9. Similarity Search

When generating a resume:

```text
Job Embedding
↓
Cosine Similarity Search
↓
Top Matching Resume Fragments
```

---

Default Configuration

```yaml
top_k: 5
similarity_threshold: 0.72
```

---

Query Example

```sql
SELECT *
FROM match_resume_fragments(
  :job_embedding,
  0.72,
  5
);
```

---

# 10. Context Assembly Engine

Purpose:

Convert retrieved fragments into optimized LLM context.

---

Input:

```text
Project A
Project B
Playwright Experience
Leadership Experience
```

---

Output:

```text
Relevant Career Context:

- Built Playwright automation framework...
- Led engineering team...
- Developed monitoring platform...
```

---

The engine should:

* deduplicate content
* preserve chronology
* prioritize measurable outcomes

---

# 11. Prompt Construction

Prompts must be structured.

---

System Prompt

Defines:

* writing style
* ATS optimization rules
* formatting requirements

---

User Prompt

Contains:

* parsed job profile
* relevant fragments
* generation instructions

---

Never include:

* unrelated projects
* low-similarity fragments
* entire master resume

---

# 12. Resume Generation Strategy

LLM Output:

```json
{
  "summary": "...",
  "skills": [],
  "experience": [],
  "projects": []
}
```

The LLM should not generate:

```text
PDF
DOCX
LaTeX
```

Formatting belongs to the Resume Rendering Service.

---

# 13. Cover Letter Generation Strategy

Inputs:

* job description
* company
* retrieved fragments

Outputs:

```json
{
  "cover_letter": "..."
}
```

Focus:

* relevance
* measurable achievements
* alignment with role requirements

---

# 14. Recruiter Message Generation

Purpose:

Generate concise recruiter outreach messages.

Output:

```json
{
  "message": "..."
}
```

Maximum:

300 words

---

# 15. Context Compression Rules

If retrieved fragments exceed token budget:

Priority Order:

```text
Work Experience
↓
Projects
↓
Leadership
↓
Skills
↓
Education
```

Lower-priority fragments may be removed.

---

# 16. Hallucination Prevention

The model must never invent:

* companies
* job titles
* dates
* certifications
* technologies

Only retrieved fragments may be used.

---

# 17. Generation Audit Trail

Store:

* prompt
* retrieved fragments
* model
* provider
* response
* token usage
* timestamp

Table:

```sql
generated_documents
```

---

# 18. Cost Optimization

Goal:

Reduce API costs by minimizing context size.

Expected Savings:

```text
Traditional Resume Prompt:
15,000–20,000 tokens

Fragment Retrieval:
3,000–5,000 tokens
```

Estimated Reduction:

```text
60%–75%
```

---

# 19. Future Improvements

## Hybrid Retrieval

Use:

```text
Vector Similarity
+
Keyword Match
```

to improve precision.

---

## Fragment Re-Ranking

Use a lightweight model to re-rank retrieved fragments before prompt construction.

---

## Resume Variant Memory

Track:

```text
Resume Variant A
Resume Variant B
Resume Variant C
```

and correlate with interview performance.

---

# 20. Non-Negotiables

1. Never send full resume context to the LLM.
2. Every fragment must have an embedding.
3. Resume generation must use retrieval.
4. LLM outputs structured JSON only.
5. Resume formatting belongs to the rendering layer.
6. Hallucinated experiences are unacceptable.
7. Retrieved fragments must be stored for auditing.
8. Similarity search must be deterministic.
9. Cost optimization is a core requirement.
10. Resume intelligence is a retrieval system, not a chatbot.

---

# 21. MVP Definition

The Resume Intelligence Service is MVP-complete when it can:

1. Store resume fragments.
2. Generate embeddings.
3. Retrieve relevant fragments.
4. Assemble context.
5. Generate structured resume JSON.
6. Generate cover letters.
7. Generate recruiter messages.
8. Store generation metadata.
9. Reduce token usage versus full-resume prompting.
10. Produce role-specific application materials consistently.
