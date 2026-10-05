create table if not exists public.zuna_memberships (
  workspace_id uuid not null references public.zuna_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);

alter table public.zuna_workspaces enable row level security;
alter table public.zuna_memberships enable row level security;
alter table public.zuna_contexts enable row level security;
alter table public.zuna_memories enable row level security;
alter table public.zuna_evidence enable row level security;

create policy "memberships are private to the signed in user"
on public.zuna_memberships for select to authenticated
using (user_id = (select auth.uid()));

create policy "members can read their workspaces"
on public.zuna_workspaces for select to authenticated
using (
  exists (
    select 1 from public.zuna_memberships m
    where m.workspace_id = id
      and m.user_id = (select auth.uid())
  )
);

create policy "members can read contexts"
on public.zuna_contexts for select to authenticated
using (
  exists (
    select 1 from public.zuna_memberships m
    where m.workspace_id = zuna_contexts.workspace_id
      and m.user_id = (select auth.uid())
  )
);

create policy "members can read memories"
on public.zuna_memories for select to authenticated
using (
  exists (
    select 1 from public.zuna_memberships m
    where m.workspace_id = zuna_memories.workspace_id
      and m.user_id = (select auth.uid())
  )
);

create policy "members can read evidence"
on public.zuna_evidence for select to authenticated
using (
  exists (
    select 1 from public.zuna_memberships m
    where m.workspace_id = zuna_evidence.workspace_id
      and m.user_id = (select auth.uid())
  )
);
