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

  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "Vea's intelligence backend is not connected yet." }, { status: 503 });

  const fabric = await loadZunaFabric();
  const contextBlock = [
    fabric.workspace ? `Universe: ${fabric.workspace.universe}; Intelligence: ${fabric.workspace.intelligence}; Unforeseen layer: ${fabric.workspace.shadow}.` : "Zuna fabric is not connected.",
    fabric.contexts.length ? `ACTIVE CONTEXTS:\n${fabric.contexts.map((c:any) => JSON.stringify(c)).join("\n")}` : "No active context is available.",
    fabric.memories.length ? `MEMORY FABRIC:\n${fabric.memories.map(memoryInstruction).join("\n\n")}` : "No memories are available.",
    fabric.evidence.length ? `RECENT EVIDENCE:\n${fabric.evidence.map((e:any) => JSON.stringify(e)).join("\n")}` : "No evidence is available."
  ].join("\n\n");

  const instructions = `You are Vea, the intelligence layer inside Zuna, the universe created by Zunoverse.

Architecture:
- Zunoverse = company.
- Zuna = universe / operating environment.
- Vea = intelligence: context, memory, evidence, reasoning, insight, recommendation.
- Shadow = the Unforeseen: uncertainty, unknowns, missing information, emerging signals.

Memory Fabric rules:
1. Memory is distinct from belief, pattern, insight, and recommendation.
2. Preserve provenance, scope, confidence, and lifecycle.
3. Active memories may inform a response only when their scope is relevant.
4. Dormant or review memories are candidates for re-evaluation, never silent facts.
5. Before a memory materially influences a recommendation, assess whether its original context still applies.
6. Never invent memory, provenance, evidence, actions, or certainty.
7. If something is uncertain or not represented in the fabric, place it conceptually in Shadow rather than pretending to know.

Current Zuna fabric:
${contextBlock}

Speak with calm warmth, precision, curiosity, and quiet confidence. You are a thinking partner, not a generic chatbot.`;

  const upstream = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      reasoning: { effort: "low" },
      max_output_tokens: 700,
      instructions,
      input: parsed.data.messages.map(m => ({
        type: "message",
        role: m.role,
        content: [{ type: "input_text", text: m.content }]
      }))
    })
  });

  if (!upstream.ok) return Response.json({ error: "Vea's intelligence connection failed." }, { status: 502 });
  const data = await upstream.json();
  const reply = String(data.output_text || "").trim();
  if (!reply) return Response.json({ error: "Vea couldn't form a response just now." }, { status: 502 });

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const workspaceId = getZunaWorkspaceId();
    const { data: conversation } = await supabase.from("zuna_conversations").insert({
      workspace_id: workspaceId,
      title: parsed.data.messages.at(-1)?.content.slice(0, 120) || "Conversation",
      context_snapshot: {
        context_ids: fabric.contexts.map((c:any) => c.id),
        memory_ids: fabric.memories.map((m:any) => m.id),
        evidence_ids: fabric.evidence.map((e:any) => e.id)
      }
    }).select("id").single();

    if (conversation?.id) {
      await supabase.from("zuna_messages").insert([
        { conversation_id: conversation.id, workspace_id: workspaceId, role: "user", content: parsed.data.messages.at(-1)?.content || "" },
        { conversation_id: conversation.id, workspace_id: workspaceId, role: "assistant", content: reply, metadata: { intelligence: "Vea", universe: "Zuna" } }
      ]);
    }
  }

  return Response.json({ reply, fabric: { contexts: fabric.contexts.length, memories: fabric.memories.length, evidence: fabric.evidence.length } });
}
