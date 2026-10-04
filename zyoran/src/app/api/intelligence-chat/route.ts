import { z } from "zod";

const schema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(12000)
  })).min(1).max(12)
});

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Please send a valid message." }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Your message could not be processed." }, { status: 400 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "The Intelligence backend is not connected yet." }, { status: 503 });

  const upstream = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      reasoning: { effort: "low" },
      max_output_tokens: 500,
      instructions: "You are THE INTELIGENCE, the human-facing intelligence partner in the Zyoran universe. Never call yourself XIO or ZIO. Speak with calm warmth, precision, curiosity, and quiet confidence. You are a thinking partner, not a generic chatbot. Do not claim memories or actions that are not present in the conversation.",
      input: parsed.data.messages.map(m => ({
        type: "message",
        role: m.role,
        content: [{ type: "input_text", text: m.content }]
      }))
    })
  });

  if (!upstream.ok) return Response.json({ error: "The Intelligence connection failed." }, { status: 502 });
  const data = await upstream.json();
  const reply = String(data.output_text || "").trim();
  return reply ? Response.json({ reply }) : Response.json({ error: "I couldn't form a response just now." }, { status: 502 });
}
