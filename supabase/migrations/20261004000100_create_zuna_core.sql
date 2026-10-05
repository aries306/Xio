create table if not exists public.zuna_workspaces (
  id uuid primary key,
  name text not null,
  universe text not null default 'Zuna',
  intelligence text not null default 'Vea',
  shadow text not null default 'Shadow',
  created_at timestamptz not null default now()
);

create table if not exists public.zuna_contexts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  name text not null,
  summary text,
  status text not null default 'active',
  scope jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zuna_memories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  original_context_id uuid references public.zuna_contexts(id) on delete set null,
  supersedes_id uuid references public.zuna_memories(id) on delete set null,
  title text not null,
  content text not null,
  memory_type text not null default 'context',
  scope jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) not null default 0.5,
  lifecycle text not null default 'active',
  last_retrieved_at timestamptz,
  last_revalidated_at timestamptz,
  dormant_since timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zuna_evidence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  context_id uuid references public.zuna_contexts(id) on delete set null,
  title text not null,
  content text not null,
  evidence_type text not null default 'research',
  source_uri text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) not null default 0.5,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now()
);

insert into public.zuna_workspaces (id,name,universe,intelligence,shadow)
values ('7c6cdc5f-e6d3-47e3-8347-a2c8caead95a','Zunoverse','Zuna','Vea','Shadow')
on conflict (id) do update set name=excluded.name, universe=excluded.universe, intelligence=excluded.intelligence, shadow=excluded.shadow;
