export type MemoryForEvaluation = {
  id: string;
  lifecycle?: string | null;
  confidence?: number | string | null;
  scope?: Record<string, unknown> | null;
  provenance?: Record<string, unknown> | null;
  original_context_id?: string | null;
  last_revalidated_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type ActiveContext = { id?: string; name?: string };

export type MemoryDecision = {
  eligible: boolean;
  status: "eligible" | "dormant_candidate" | "review_candidate" | "insufficient_provenance" | "out_of_scope" | "stale" | "low_confidence";
  reasons: string[];
};

const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

function validProvenance(value: Record<string, unknown> | null | undefined): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const kind = typeof value.type === "string" && value.type.trim().length > 0;
  const captured = typeof value.capturedAt === "string" ? Date.parse(value.capturedAt) : Number.NaN;
  const lineage = ["userId", "conversationId", "messageId", "sourceId", "documentId", "source", "uri"]
    .some((key) => typeof value[key] === "string" && String(value[key]).trim().length > 0);
  return kind && Number.isFinite(captured) && captured <= Date.now() + 5 * 60 * 1000 && lineage;
}

function matchesContext(memory: MemoryForEvaluation, contexts: ActiveContext[]): boolean {
  const scope = memory.scope ?? {};
  const activeIds = new Set(contexts.map((item) => item.id).filter((v): v is string => Boolean(v)));
  const activeNames = new Set(contexts.map((item) => item.name?.trim().toLowerCase()).filter((v): v is string => Boolean(v)));
  const scoped = Array.isArray(scope.contexts)
    ? scope.contexts.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    : [];
  if (scoped.length > 0) {
    return scoped.some((value) => activeIds.has(value) || activeNames.has(value.toLowerCase()));
  }
  if (memory.original_context_id && activeIds.has(memory.original_context_id)) return true;

  const contextId = typeof scope.contextId === "string" ? scope.contextId : null;
  const contextName = typeof scope.contextName === "string" ? scope.contextName.toLowerCase() : null;
  if (contextId) return activeIds.has(contextId);
  if (contextName) return activeNames.has(contextName);
  return true;
}

/**
 * Memory retrieval is not memory trust. Only active, in-scope, well-sourced,
 * recently revalidated memories may enter the reasoning prompt. Dormant and
 * review records are surfaced separately as candidates, never as facts.
 */
export function evaluateMemory(memory: MemoryForEvaluation, contexts: ActiveContext[], now = Date.now()): MemoryDecision {
  if (!validProvenance(memory.provenance)) {
    return { eligible: false, status: "insufficient_provenance", reasons: ["missing_or_invalid_lineage"] };
  }
  if (!matchesContext(memory, contexts)) {
    return { eligible: false, status: "out_of_scope", reasons: ["no_active_context_match"] };
  }
  const confidence = Number(memory.confidence);
  if (!Number.isFinite(confidence) || confidence < 0.4 || confidence > 1) {
    return { eligible: false, status: "low_confidence", reasons: ["confidence_below_influence_threshold_or_invalid"] };
  }
  const freshness = memory.last_revalidated_at || memory.updated_at || memory.created_at;
  const timestamp = typeof freshness === "string" ? Date.parse(freshness) : Number.NaN;
  if (!Number.isFinite(timestamp) || timestamp > now + 5 * 60 * 1000 || now - timestamp > MAX_AGE_MS) {
    return { eligible: false, status: "stale", reasons: ["missing_future_or_stale_validation"] };
  }
  if (memory.lifecycle === "active") return { eligible: true, status: "eligible", reasons: [] };
  if (memory.lifecycle === "dormant") return { eligible: false, status: "dormant_candidate", reasons: ["context_match_requires_revalidation_and_user_confirmation"] };
  if (memory.lifecycle === "review") return { eligible: false, status: "review_candidate", reasons: ["explicit_review_required"] };
  return { eligible: false, status: "out_of_scope", reasons: ["lifecycle_not_influence_eligible"] };
}
