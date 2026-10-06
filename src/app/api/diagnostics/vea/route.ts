import { getSupabaseServerClient, getZunaWorkspaceId } from "../../../../lib/supabase/server";

export async function GET() {
  const model = process.env.OPENAI_MODEL || "gpt-6-luna";
  const supabase = getSupabaseServerClient();
  const supabaseStatus = {
    configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY),
    workspaceReadable: false
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("zuna_workspaces")
      .select("id")
      .eq("id", getZunaWorkspaceId())
      .maybeSingle();
    supabaseStatus.workspaceReadable = Boolean(data && !error);
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return Response.json({ ok: false, model, openai: { configured: false }, supabase: supabaseStatus }, { status: 503 });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model,
        max_output_tokens: 40,
        input: [{ role: "user", content: [{ type: "input_text", text: "Reply with the single word READY." }] }]
      })
    });
    const body = await upstream.json().catch(() => ({}));
    return Response.json({
      ok: upstream.ok,
      model,
      openai: {
        configured: true,
        status: upstream.status,
        reply: upstream.ok ? String(body.output_text || "").trim() : undefined,
        error: upstream.ok ? undefined : String(body?.error?.message || "OpenAI request failed")
      },
      supabase: supabaseStatus
    }, { status: upstream.ok ? 200 : 502 });
  } catch (error) {
    return Response.json({
      ok: false, model,
      openai: { configured: true, error: error instanceof Error ? error.message : "OpenAI request failed" },
      supabase: supabaseStatus
    }, { status: 502 });
  }
}
