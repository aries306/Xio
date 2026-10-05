import { loadZunaFabric } from "../../../lib/zuna/context";

export async function GET() {
  try {
    const fabric = await loadZunaFabric();
    return Response.json(fabric, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Zuna context could not be loaded." }, { status: 503 });
  }
}
