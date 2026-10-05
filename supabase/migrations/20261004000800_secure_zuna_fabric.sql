alter table public.zuna_workspaces enable row level security;
alter table public.zuna_memberships enable row level security;
alter table public.zuna_contexts enable row level security;
alter table public.zuna_memories enable row level security;
alter table public.zuna_evidence enable row level security;
alter table public.zuna_patterns enable row level security;
alter table public.zuna_beliefs enable row level security;
alter table public.zuna_insights enable row level security;
alter table public.zuna_recommendations enable row level security;
alter table public.zuna_decisions enable row level security;
alter table public.zuna_learning_items enable row level security;
alter table public.zuna_outcomes enable row level security;
alter table public.zuna_shadow_events enable row level security;
alter table public.zuna_conversations enable row level security;
alter table public.zuna_messages enable row level security;
alter table public.zuna_agent_tasks enable row level security;

drop policy if exists "memberships are private to the signed in user" on public.zuna_memberships;
create policy "memberships are private to the signed in user"
on public.zuna_memberships for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "members can read their workspaces" on public.zuna_workspaces;
create policy "members can read their workspaces"
on public.zuna_workspaces for select to authenticated
using (exists (
  select 1 from public.zuna_memberships m
  where m.workspace_id = zuna_workspaces.id
    and m.user_id = (select auth.uid())
));

do $$
declare t text;
begin
  foreach t in array array[
    'zuna_contexts','zuna_memories','zuna_evidence','zuna_patterns','zuna_beliefs',
    'zuna_insights','zuna_recommendations','zuna_decisions','zuna_learning_items',
    'zuna_outcomes','zuna_shadow_events','zuna_conversations','zuna_messages',
    'zuna_agent_tasks'
  ] loop
    execute format('drop policy if exists "zuna member select %1$s" on public.%1$s', t);
    execute format('drop policy if exists "zuna member insert %1$s" on public.%1$s', t);
    execute format('drop policy if exists "zuna member update %1$s" on public.%1$s', t);
    execute format('drop policy if exists "zuna member delete %1$s" on public.%1$s', t);

    execute format('create policy "zuna member select %1$s" on public.%1$s for select to authenticated using (exists (select 1 from public.zuna_memberships m where m.workspace_id = %1$s.workspace_id and m.user_id = (select auth.uid())))', t);
    execute format('create policy "zuna member insert %1$s" on public.%1$s for insert to authenticated with check (exists (select 1 from public.zuna_memberships m where m.workspace_id = %1$s.workspace_id and m.user_id = (select auth.uid())))', t);
    execute format('create policy "zuna member update %1$s" on public.%1$s for update to authenticated using (exists (select 1 from public.zuna_memberships m where m.workspace_id = %1$s.workspace_id and m.user_id = (select auth.uid()))) with check (exists (select 1 from public.zuna_memberships m where m.workspace_id = %1$s.workspace_id and m.user_id = (select auth.uid())))', t);
    execute format('create policy "zuna member delete %1$s" on public.%1$s for delete to authenticated using (exists (select 1 from public.zuna_memberships m where m.workspace_id = %1$s.workspace_id and m.user_id = (select auth.uid())))', t);
  end loop;
end $$;