create table if not exists public.zuna_patterns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  context_id uuid references public.zuna_contexts(id) on delete set null,
  statement text not null,
  supporting_evidence jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) not null default 0.5,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'candidate',
  created_at timestamptz not null default now()
);

create table if not exists public.zuna_beliefs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  statement text not null,
  confidence numeric(5,4) not null default 0.5,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'provisional',
  created_at timestamptz not null default now()
);

create table if not exists public.zuna_insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  context_id uuid references public.zuna_contexts(id) on delete set null,
  statement text not null,
  rationale text,
  confidence numeric(5,4) not null default 0.5,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'provisional',
  created_at timestamptz not null default now()
);

create table if not exists public.zuna_recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  context_id uuid references public.zuna_contexts(id) on delete set null,
  statement text not null,
  rationale text,
  confidence numeric(5,4) not null default 0.5,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'proposed',
  created_at timestamptz not null default now()
);

create table if not exists public.zuna_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  context_id uuid references public.zuna_contexts(id) on delete set null,
  statement text not null,
  rationale text,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  decided_at timestamptz not null default now()
);
