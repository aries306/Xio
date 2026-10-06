import { z } from "zod";

const schema = z.object({ text: z.string().min(1).max(5000) });
const VOICE_ID = "HIgnmimOGyBH1e7eqy5o";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid text" }, { status: 400 });

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return Response.json({ error: "Voice provider is not connected" }, { status: 503 });

  const upstream = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID + "?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text: parsed.data.text, model_id: "eleven_multilingual_v2" })
  });

  if (!upstream.ok) return Response.json({ error: "Voice generation failed" }, { status: 502 });
  return new Response(await upstream.arrayBuffer(), {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" }
  });
}
