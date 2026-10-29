import { NextResponse } from "next/server";
import { supabase, baseConfigurada } from "@/lib/supabase";
import { borrarFotosViejas } from "@/lib/citas";
import { enviarRecordatorios } from "@/lib/recordatorios";
import { variable } from "@/lib/variables";

/**
 * Tarea diaria. Vercel la llama una vez al dia (vercel.json, 13:00 UTC: las
 * 10:00 en Chile en verano y las 9:00 en invierno).
 *
 * 1. Latido, para que Supabase no pause el proyecto. El plan gratis duerme la
 *    base tras una semana sin "actividad suficiente", y entonces el panel y la
 *    agenda dejan de funcionar hasta que alguien la despierta a mano. Escribe,
 *    no solo lee: en octubre de 2026 la base se pauso igual con un latido que
 *    solo contaba filas. Si la tabla latido todavia no existe, por lo menos lee.
 * 2. Borra las fotos de citas viejas.
 * 3. Manda el recordatorio por WhatsApp de las horas de mañana.
 *
 * Ojo: si la base YA esta pausada, esto no la despierta. Eso se hace una vez
 * desde el panel de Supabase.
 */
export const dynamic = "force-dynamic";
// Con varias horas al dia los WhatsApp salen uno por uno: se da margen
export const maxDuration = 60;

export async function GET(req: Request) {
  // Si hay CRON_SECRET configurado, solo responde a quien lo trae (asi lo manda Vercel)
  const secreto = variable("CRON_SECRET");
  if (secreto && req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new NextResponse(null, { status: 401 });
  }

  if (!baseConfigurada()) return NextResponse.json({ ok: false, motivo: "sin base configurada" }, { status: 503 });
  const db = supabase()!;

  const escrito = await db.from("latido").upsert({ id: 1, ultimo: new Date().toISOString() });
  if (escrito.error) {
    const { error } = await db.from("presupuestos").select("id", { count: "exact", head: true });
    if (error) {
      console.error("Latido: la base no respondió:", error.message);
      return NextResponse.json({ ok: false, motivo: error.message }, { status: 503 });
    }
    console.error("Latido: solo se pudo leer, falta la tabla latido:", escrito.error.message);
  }

  // Cada tarea por su lado: si una falla, las otras igual corren
  const [fotosBorradas, recordatorios] = await Promise.all([
    borrarFotosViejas().catch(() => 0),
    enviarRecordatorios().catch((e) => {
      console.error("[whatsapp] falló la ronda de recordatorios:", e instanceof Error ? e.message : e);
      return null;
    }),
  ]);
  return NextResponse.json({ ok: true, escribio: !escrito.error, fotosBorradas, recordatorios });
}
