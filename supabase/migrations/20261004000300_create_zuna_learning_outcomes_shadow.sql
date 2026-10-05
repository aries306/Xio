create table if not exists public.zuna_learning_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  statement text not null,
  source_context_id uuid references public.zuna_contexts(id) on delete set null,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'candidate',
  created_at timestamptz not null default now()
);

create table if not exists public.zuna_outcomes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  recommendation_id uuid references public.zuna_recommendations(id) on delete set null,
  decision_id uuid references public.zuna_decisions(id) on delete set null,
  statement text not null,
  measured_effect text,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'unverified',
  created_at timestamptz not null default now()
);

create table if not exists public.zuna_shadow_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  context_id uuid references public.zuna_contexts(id) on delete set null,
  description text not null,
  uncertainty_type text not null default 'unknown',
  confidence numeric(5,4) not null default 0.25,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
