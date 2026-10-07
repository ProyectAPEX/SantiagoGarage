import { NextResponse } from "next/server";
import { supabase, baseConfigurada } from "@/lib/supabase";

/**
 * Latido diario para que Supabase no pause el proyecto.
 *
 * El plan gratis duerme la base tras 7 dias sin consultas, y entonces el
 * panel deja de ver el historial hasta que alguien la despierta a mano. Esta
 * ruta hace la consulta mas barata posible (contar filas, sin traerlas) y la
 * llama Vercel una vez al dia, segun vercel.json.
 *
 * Ojo: si la base YA esta pausada, esto no la despierta. Eso se hace una vez
 * desde el panel de Supabase.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Si hay CRON_SECRET configurado, solo responde a quien lo trae (asi lo manda Vercel)
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new NextResponse(null, { status: 401 });
  }

  if (!baseConfigurada()) return NextResponse.json({ ok: false, motivo: "sin base configurada" }, { status: 503 });

  const db = supabase();
  const { count, error } = await db!.from("presupuestos").select("id", { count: "exact", head: true });

  if (error) {
    console.error("Latido: la base no respondió:", error.message);
    return NextResponse.json({ ok: false, motivo: error.message }, { status: 503 });
  }
  return NextResponse.json({ ok: true, presupuestos: count ?? 0 });
}
