# JobFlow AI

## Database Design Document

Version: 1.0

Author: Kenneth Flororita

Status: Planning

---

# 1. Database Overview

JobFlow AI uses Supabase PostgreSQL as the primary source of truth.

The database must support:

* Job ingestion
* Job parsing
* Deterministic scoring
* Resume fragment retrieval
* Generated documents
* LaTeX resume artifacts
* Application lifecycle state
* Immutable application events
* Observability logs
* Analytics queries

Extensions required:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

# 2. Core Tables

## jobs

Stores raw and normalized job listings.

```sql
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  source text NOT NULL,
  source_job_id text,
  title text NOT NULL,
  company text NOT NULL,

  location text,
  remote_type text CHECK (remote_type IN ('remote', 'hybrid', 'onsite', 'unknown')) DEFAULT 'unknown',

  salary_raw text,
  salary_min numeric,
  salary_max numeric,
  currency text,

  description_raw text NOT NULL,
  description_clean text,

  application_url text NOT NULL,
  ats_type text CHECK (ats_type IN ('greenhouse', 'lever', 'workday', 'generic', 'unknown')) DEFAULT 'unknown',

  discovered_at timestamptz DEFAULT now(),
  parsed_at timestamptz,
  updated_at timestamptz DEFAULT now(),

  UNIQUE(source, source_job_id),
  UNIQUE(application_url)
);
```

---

## parsed_job_profiles

Stores structured extracted job intelligence.

```sql
CREATE TABLE parsed_job_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  responsibilities text[] DEFAULT '{}',
  required_skills text[] DEFAULT '{}',
  preferred_skills text[] DEFAULT '{}',

  seniority text CHECK (
    seniority IN ('intern', 'junior', 'mid', 'senior', 'lead', 'unknown')
  ) DEFAULT 'unknown',

  industry text,

  compensation jsonb DEFAULT '{}',
  raw_metadata jsonb DEFAULT '{}',

  embedding vector(1536),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(job_id)
);
```

---

## user_profile

Stores user preferences and target job parameters.

```sql
CREATE TABLE user_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name text NOT NULL,
  headline text,

  email text,
  phone text,
  location text,

  linkedin_url text,
  github_url text,
  portfolio_url text,

  target_roles text[] DEFAULT '{}',
  target_industries text[] DEFAULT '{}',
  verified_skills text[] DEFAULT '{}',

  preferred_remote_types text[] DEFAULT ARRAY['remote'],
  minimum_salary numeric,
  salary_currency text DEFAULT 'PHP',

  baseline_seniority text CHECK (
    baseline_seniority IN ('intern', 'junior', 'mid', 'senior', 'lead')
  ) DEFAULT 'mid',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## user_resume_fragments

Stores atomic resume/career fragments for pgvector retrieval.

```sql
CREATE TABLE user_resume_fragments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_profile_id uuid REFERENCES user_profile(id) ON DELETE CASCADE,

  fragment_text text NOT NULL,

  fragment_type text CHECK (
    fragment_type IN (
      'project',
      'work_experience',
      'skill',
      'certification',
      'leadership',
      'education'
    )
  ) NOT NULL,

  source_label text,
  metadata jsonb DEFAULT '{}',

  embedding vector(1536),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

Vector index:

```sql
CREATE INDEX user_resume_fragments_embedding_idx
ON user_resume_fragments
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

Similarity search:

```sql
CREATE OR REPLACE FUNCTION match_resume_fragments(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  fragment_text text,
  fragment_type text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    user_resume_fragments.id,
    user_resume_fragments.fragment_text,
    user_resume_fragments.fragment_type,
    user_resume_fragments.metadata,
    1 - (user_resume_fragments.embedding <=> query_embedding) AS similarity
  FROM user_resume_fragments
  WHERE 1 - (user_resume_fragments.embedding <=> query_embedding) > match_threshold
  ORDER BY user_resume_fragments.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

# 3. Scoring Tables

## job_match_scores

Stores deterministic scoring breakdowns.

```sql
CREATE TABLE job_match_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  skill_match numeric NOT NULL CHECK (skill_match >= 0 AND skill_match <= 100),
  experience_match numeric NOT NULL CHECK (experience_match >= 0 AND experience_match <= 100),
  industry_match numeric NOT NULL CHECK (industry_match >= 0 AND industry_match <= 100),
  location_match numeric NOT NULL CHECK (location_match >= 0 AND location_match <= 100),
  compensation_match numeric NOT NULL CHECK (compensation_match >= 0 AND compensation_match <= 100),

  final_score numeric NOT NULL CHECK (final_score >= 0 AND final_score <= 100),

  scoring_metadata jsonb DEFAULT '{}',

  created_at timestamptz DEFAULT now(),

  UNIQUE(job_id)
);
```

Final score formula:

```text
final_score =
(skill_match * 0.40) +
(experience_match * 0.25) +
(industry_match * 0.10) +
(location_match * 0.10) +
(compensation_match * 0.15)
```

---

# 4. Generated Content Tables

## generated_documents

Stores AI-generated text artifacts.

```sql
CREATE TABLE generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  document_type text CHECK (
    document_type IN (
      'resume_json',
      'cover_letter',
      'recruiter_message',
      'screening_response'
    )
  ) NOT NULL,

  content jsonb NOT NULL,

  prompt text,
  context_fragments uuid[] DEFAULT '{}',
  model text,
  provider text,

  created_at timestamptz DEFAULT now()
);
```

---

## generated_resumes

Stores rendered resume artifacts.

```sql
CREATE TABLE generated_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  generated_document_id uuid REFERENCES generated_documents(id) ON DELETE SET NULL,

  template text NOT NULL,

  resume_json jsonb NOT NULL,
  latex_source text NOT NULL,

  tex_path text,
  pdf_path text,
  metadata_path text,

  compiler text DEFAULT 'latexmk',

  created_at timestamptz DEFAULT now()
);
```

---

# 5. Application Lifecycle Tables

## applications

Stores current application snapshot.

```sql
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  current_state text NOT NULL CHECK (
    current_state IN (
      'DISCOVERED',
      'PARSED',
      'SCORED',
      'GENERATED',
      'RENDERED',
      'READY_FOR_APPLICATION',
      'HUMAN_APPROVAL_REQUIRED',
      'APPLIED',
      'INTERVIEWING',
      'OFFER',
      'REJECTED',
      'WITHDRAWN',
      'HIRED'
    )
  ) DEFAULT 'DISCOVERED',

  selected_resume_id uuid REFERENCES generated_resumes(id) ON DELETE SET NULL,

  application_url text,
  ats_type text,

  notes text,
  last_execution_id text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(job_id)
);
```

---

## application_events

Stores immutable state transition history.

```sql
CREATE TABLE application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  from_state text,
  to_state text NOT NULL,

  event_type text DEFAULT 'STATE_TRANSITION',

  execution_id text,
  metadata jsonb DEFAULT '{}',

  created_at timestamptz DEFAULT now()
);
```

---

# 6. Lifecycle Event Strategy

Application lifecycle events are written explicitly by the lifecycle service through the application event repository.

The database no longer uses `trigger_audit_application_state`.

Reason:

```text
Phase 8 creates lifecycle events explicitly so application timelines have one event writer and avoid duplicate transition records.
```

Lifecycle state changes must still:

```text
update applications.current_state
insert an application_events row
preserve from_state, to_state, event_type, execution_id, metadata, and created_at
```

---

# 7. Observability Tables

## execution_logs

Stores operational logs across all services.

```sql
CREATE TABLE execution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  execution_id text NOT NULL,

  service text NOT NULL,
  step text NOT NULL,

  status text CHECK (
    status IN ('started', 'success', 'failed', 'warning')
  ) NOT NULL,

  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,

  ats_type text,
  error_message text,
  error_stack text,

  metadata jsonb DEFAULT '{}',

  created_at timestamptz DEFAULT now()
);
```

---

## automation_checkpoints

Stores resumable automation progress.

```sql
CREATE TABLE automation_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  execution_id text NOT NULL,

  ats_type text NOT NULL,
  current_step text NOT NULL,

  checkpoint_data jsonb DEFAULT '{}',

  is_completed boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

# 8. ATS Tables

## ats_field_mappings

Stores reusable field mappings per ATS type.

```sql
CREATE TABLE ats_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  ats_type text NOT NULL,
  field_key text NOT NULL,

  locator_strategy text CHECK (
    locator_strategy IN (
      'role',
      'label',
      'text',
      'placeholder',
      'data_attribute',
      'css'
    )
  ) NOT NULL,

  locator_value text NOT NULL,

  priority int DEFAULT 1,

  metadata jsonb DEFAULT '{}',

  created_at timestamptz DEFAULT now(),

  UNIQUE(ats_type, field_key, locator_strategy, locator_value)
);
```

---

# 9. Analytics Views

## application_summary_view

```sql
CREATE VIEW application_summary_view AS
SELECT
  a.id AS application_id,
  j.title,
  j.company,
  j.source,
  j.ats_type,
  a.current_state,
  s.final_score,
  a.created_at,
  a.updated_at
FROM applications a
JOIN jobs j ON j.id = a.job_id
LEFT JOIN job_match_scores s ON s.job_id = j.id;
```

---

## application_state_counts_view

```sql
CREATE VIEW application_state_counts_view AS
SELECT
  current_state,
  COUNT(*) AS count
FROM applications
GROUP BY current_state;
```

---

## platform_performance_view

```sql
CREATE VIEW platform_performance_view AS
SELECT
  j.source,
  COUNT(a.id) AS total_applications,
  COUNT(*) FILTER (WHERE a.current_state IN ('INTERVIEWING', 'OFFER', 'HIRED')) AS positive_responses,
  ROUND(
    COUNT(*) FILTER (WHERE a.current_state IN ('INTERVIEWING', 'OFFER', 'HIRED'))::numeric
    / NULLIF(COUNT(a.id), 0) * 100,
    2
  ) AS positive_response_rate
FROM applications a
JOIN jobs j ON j.id = a.job_id
GROUP BY j.source;
```

---

# 10. Indexes

```sql
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_discovered_at ON jobs(discovered_at DESC);
CREATE INDEX idx_jobs_ats_type ON jobs(ats_type);

CREATE INDEX idx_parsed_job_profiles_job_id ON parsed_job_profiles(job_id);

CREATE INDEX idx_job_match_scores_job_id ON job_match_scores(job_id);
CREATE INDEX idx_job_match_scores_final_score ON job_match_scores(final_score DESC);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_current_state ON applications(current_state);

CREATE INDEX idx_application_events_application_id ON application_events(application_id);
CREATE INDEX idx_application_events_created_at ON application_events(created_at DESC);
CREATE INDEX idx_application_events_application_id_created_at
ON application_events(application_id, created_at ASC);

CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_execution_logs_service ON execution_logs(service);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);
CREATE INDEX idx_execution_logs_created_at ON execution_logs(created_at DESC);
```

---

# 11. Row Level Security

For local MVP, RLS can be disabled during development.

For production:

* Enable RLS on all tables.
* Restrict access to authenticated user.
* Prevent public reads.
* Prevent client-side writes to event tables.

Example:

```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;
```

---

# 12. Seed Data

Initial user profile:

```sql
INSERT INTO user_profile (
  full_name,
  headline,
  email,
  location,
  target_roles,
  target_industries,
  verified_skills,
  preferred_remote_types,
  minimum_salary,
  salary_currency,
  baseline_seniority
)
VALUES (
  'Kenneth Flororita',
  'AI Automation Engineer | QA Automation Enthusiast',
  'your_email@example.com',
  'Philippines',
  ARRAY['QA Automation Engineer', 'SDET', 'AI Automation Engineer'],
  ARRAY['SaaS', 'DevOps', 'AI', 'Automation'],
  ARRAY['Playwright', 'TypeScript', 'n8n', 'Supabase', 'PostgreSQL', 'GitHub Actions'],
  ARRAY['remote'],
  40000,
  'PHP',
  'mid'
);
```

---

# 13. Non-Negotiables

1. Do not store only the final score.
2. Always store score breakdowns.
3. Do not mutate application state without event logging.
4. Do not store only generated PDFs.
5. Always store resume JSON, LaTeX source, and PDF path.
6. Do not send full resume context to the LLM.
7. Resume fragments must be vector-searchable.
8. Every execution must have an execution_id.
9. ATS automation must be checkpointed.
10. Analytics must be computed from database records, not memory.

---

# 14. MVP Database Completion Checklist

The database is MVP-ready when it supports:

* Job storage
* Parsed job profiles
* User profile
* Resume fragments with embeddings
* Match scoring
* Generated documents
* Generated LaTeX resumes
* Applications
* Application events
* Execution logs
* Automation checkpoints
* ATS field mappings
* Analytics views
