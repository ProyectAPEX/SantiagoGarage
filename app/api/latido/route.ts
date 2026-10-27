import { NextResponse } from "next/server";
import { supabase, baseConfigurada } from "@/lib/supabase";
import { borrarFotosViejas } from "@/lib/citas";

/**
 * Latido diario para que Supabase no pause el proyecto.
 *
 * El plan gratis duerme la base tras una semana sin "actividad suficiente", y
 * entonces el panel y la agenda dejan de funcionar hasta que alguien la
 * despierta a mano. Vercel llama esta ruta una vez al dia (vercel.json).
 *
 * Escribe, no solo lee: en octubre de 2026 la base se pauso igual con un
 * latido que solo contaba filas. Reescribe la unica fila de la tabla latido
 * (supabase/004_latido.sql); si esa tabla todavia no existe, por lo menos lee.
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
  const db = supabase()!;

  const escrito = await db.from("latido").upsert({ id: 1, ultimo: new Date().toISOString() });
  if (!escrito.error) {
    // De paso, una vez al dia: las fotos de citas viejas no se guardan para siempre.
    // Si esto falla, el latido igual cuenta.
    const fotosBorradas = await borrarFotosViejas().catch(() => 0);
    return NextResponse.json({ ok: true, escribio: true, fotosBorradas });
  }

  const { count, error } = await db.from("presupuestos").select("id", { count: "exact", head: true });
  if (error) {
    console.error("Latido: la base no respondió:", error.message);
    return NextResponse.json({ ok: false, motivo: error.message }, { status: 503 });
  }
  console.error("Latido: solo se pudo leer, falta la tabla latido:", escrito.error.message);
  return NextResponse.json({ ok: true, escribio: false, presupuestos: count ?? 0 });
}
