import { getSupabaseServerClient, getZunaWorkspaceId } from "../supabase/server";
import { evaluateMemory } from "./memory-eligibility";

export type FabricContext = {
  workspace: { id: string; name: string; universe: string; intelligence: string; shadow: string } | null;
  contexts: unknown[];
  memories: unknown[];
  memoryCandidates: unknown[];
  evidence: unknown[];
  counts: Record<string, number>;
};

export async function loadZunaFabric(): Promise<FabricContext> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { workspace: null, contexts: [], memories: [], memoryCandidates: [], evidence: [], counts: {} };

  const workspaceId = getZunaWorkspaceId();
  const [workspace, contexts, memories, evidence] = await Promise.all([
    supabase.from("zuna_workspaces").select("id,name,universe,intelligence,shadow").eq("id", workspaceId).maybeSingle(),
    supabase.from("zuna_contexts").select("id,name,summary,status,scope,parent_context_id,updated_at").eq("workspace_id", workspaceId).eq("status","active").order("updated_at",{ascending:false}).limit(12),
    supabase.from("zuna_memories").select("id,title,content,memory_type,scope,provenance,confidence,lifecycle,original_context_id,last_revalidated_at,dormant_since,created_at,updated_at").eq("workspace_id", workspaceId).in("lifecycle",["active","dormant","review"]).order("confidence",{ascending:false}).limit(24),
    supabase.from("zuna_evidence").select("id,title,content,evidence_type,source_uri,provenance,confidence,verification_status,context_id,created_at").eq("workspace_id", workspaceId).order("created_at",{ascending:false}).limit(24),
  ]);

  const activeContexts = contexts.data ?? [];
  const evaluated = (memories.data ?? []).map((memory: any) => ({
    memory,
    decision: evaluateMemory(memory, activeContexts),
  }));
  const eligibleMemories = evaluated.filter((item) => item.decision.eligible).map((item) => item.memory);
  const memoryCandidates = evaluated
    .filter((item) => !item.decision.eligible)
    .map(({ memory, decision }) => ({ ...memory, retrieval_decision: decision }));

  return {
    workspace: workspace.data ? { ...workspace.data, universe: "Exelta", intelligence: "Zioren" } : null,
    contexts: activeContexts,
    memories: eligibleMemories,
    memoryCandidates,
    evidence: evidence.data ?? [],
    counts: {
      contexts: activeContexts.length,
      memories: eligibleMemories.length,
      memoryCandidates: memoryCandidates.length,
      evidence: evidence.data?.length ?? 0,
    },
  };
}
