create extension if not exists vector with schema extensions;

alter table public.zuna_memories
  add column if not exists embedding extensions.vector(1536);

alter table public.zuna_evidence
  add column if not exists embedding extensions.vector(1536);

comment on table public.zuna_memories is
  'Durable contextual memory. Keep memory distinct from pattern, belief, insight, recommendation, and raw conversation history.';

comment on column public.zuna_memories.scope is
  'Original applicability boundary. Re-evaluate before dormant memory materially influences a recommendation.';

comment on column public.zuna_memories.provenance is
  'Source and context trail explaining where this memory came from.';

comment on column public.zuna_memories.lifecycle is
  'Explicit lifecycle: active, dormant, review, superseded, retired.';
