create table if not exists public.zuna_conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  title text,
  context_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.zuna_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.zuna_conversations(id) on delete cascade,
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  role text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists zuna_messages_conversation_created_idx
  on public.zuna_messages(conversation_id,created_at);
