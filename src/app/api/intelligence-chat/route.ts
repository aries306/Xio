import { z } from "zod";
import { loadZunaFabric } from "../../../lib/zuna/context";
import { getSupabaseServerClient, getZunaWorkspaceId } from "../../../lib/supabase/server";

const schema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(12000)
  })).min(1).max(12)
});

function memoryInstruction(memory: any) {
  const lifecycle = String(memory.lifecycle || "review");
  const status = lifecycle === "active"
    ? "ACTIVE — may inform the response when scope matches."
    : "DORMANT/REVIEW — candidate only; do not treat as current fact without re-evaluation.";
  return [
    `[MEMORY ${memory.id}] ${memory.title}`,
    `Type: ${memory.memory_type}; Confidence: ${Math.round(Number(memory.confidence || 0) * 100)}%; Lifecycle: ${status}`,
    `Scope: ${JSON.stringify(memory.scope || {})}`,
    `Provenance: ${JSON.stringify(memory.provenance || {})}`,
    `Content: ${memory.content}`
  ].join("\n");
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Please send a valid message." }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Your message could not be processed." }, { status: 400 });

  const fabric = await loadZunaFabric();
  const contextBlock = [
    fabric.workspace ? `Universe: ${fabric.workspace.universe}; Intelligence: ${fabric.workspace.intelligence}; Unforeseen layer: ${fabric.workspace.shadow}.` : "Zuna fabric is not connected.",
    fabric.contexts.length ? `ACTIVE CONTEXTS:\n${fabric.contexts.map((c:any) => JSON.stringify(c)).join("\n")}` : "No active context is available.",
    fabric.memories.length ? `MEMORY FABRIC:\n${fabric.memories.map(memoryInstruction).join("\n\n")}` : "No memories are available.",
    fabric.evidence.length ? `RECENT EVIDENCE:\n${fabric.evidence.map((e:any) => JSON.stringify(e)).join("\n")}` : "No evidence is available."
  ].join("\n\n");

  const userText = parsed.data.messages.at(-1)?.content.trim() || "";
  const lower = userText.toLowerCase();
  const activeMemories = fabric.memories.filter((m:any) => m.lifecycle === "active");
  const matching = activeMemories.filter((m:any) => {
    const haystack = [m.title, m.content, JSON.stringify(m.scope || {})].join(" ").toLowerCase();
    return lower.split(/\s+/).some(word => word.length > 3 && haystack.includes(word));
  }).slice(0, 3);

  let reply: string;
  if (/^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/i.test(userText)) {
    reply = `I'm Vea, the intelligence layer inside Zuna. The fabric is connected with ${fabric.memories.length} memories, ${fabric.contexts.length} contexts, and ${fabric.evidence.length} evidence items. Tell me what you're working through, and I'll keep memory, evidence, uncertainty, and recommendation separate.`;
  } else if (/what do you remember|remember me|my memory|memories/i.test(lower)) {
    reply = activeMemories.length
      ? `I can currently see ${activeMemories.length} active memories. I will only use one when its original scope is relevant. ${activeMemories.slice(0, 2).map((m:any) => `“${m.title}”`).join(" and ")} are among the active items. Dormant or review memories remain candidates rather than assumed facts.`
      : "I don't have an active memory that I can safely use yet. That's intentional: I won't invent continuity where the fabric has no supported record.";
  } else if (matching.length) {
    reply = `I found ${matching.length} active memory item${matching.length === 1 ? "" : "s"} that may be relevant, but relevance is not the same as truth. ${matching.map((m:any) => `“${m.title}”`).join(", ")} ${matching.length === 1 ? "is" : "are"} in scope for this query. I would preserve the provenance and confidence before letting it drive a recommendation.`;
  } else if (/recommend|should i|what should|next step|what do you think/i.test(lower)) {
    reply = "I can help structure the decision, but I won't manufacture certainty. Right now I would separate three things: what the fabric already supports, what is still uncertain, and the smallest next action that would produce useful evidence. If you give me the decision or goal, I can map it against the current Zuna context.";
  } else if (/who are you|what are you|vea|zuna/i.test(lower)) {
    reply = "I'm Vea: Zuna's intelligence layer. Zunoverse is the company, Zuna is the universe, Vea is the intelligence, and Shadow represents the unforeseen—unknowns, missing information, and emerging signals. My job is to make context useful without pretending uncertainty is knowledge.";
  } else {
    reply = `I have your message in the current Zuna context. The free local intelligence layer can reason from the fabric without an external paid AI API. I currently have ${fabric.contexts.length} contexts, ${fabric.memories.length} memories, and ${fabric.evidence.length} evidence items available. I won't invent an answer beyond that evidence.\n\nYour message: “${userText.slice(0, 500)}”\n\nTell me whether you want to explore the context, memory, evidence, uncertainty, or a next decision.`;
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const workspaceId = getZunaWorkspaceId();
    const { data: conversation } = await supabase.from("zuna_conversations").insert({
      workspace_id: workspaceId,
      title: userText.slice(0, 120) || "Conversation",
      context_snapshot: {
        context_ids: fabric.contexts.map((c:any) => c.id),
        memory_ids: fabric.memories.map((m:any) => m.id),
        evidence_ids: fabric.evidence.map((e:any) => e.id),
        engine: "zuna-local"
      }
    }).select("id").single();

    if (conversation?.id) {
      await supabase.from("zuna_messages").insert([
        { conversation_id: conversation.id, workspace_id: workspaceId, role: "user", content: userText },
        { conversation_id: conversation.id, workspace_id: workspaceId, role: "assistant", content: reply, metadata: { intelligence: "Vea", universe: "Zuna", engine: "zuna-local" } }
      ]);
    }
  }

  return Response.json({ reply, fabric: { contexts: fabric.contexts.length, memories: fabric.memories.length, evidence: fabric.evidence.length } });
}
