import { NextRequest, NextResponse } from "next/server";
import { firmaDeMetaValida, verificacionValida } from "@/lib/whatsapp";
import { responderBoton } from "@/lib/recordatorios";

export const dynamic = "force-dynamic";
// Cancelar desde WhatsApp manda correos y un mensaje: se da margen
export const maxDuration = 30;

/** Lo que manda Meta pesa poco; algo mucho mas grande no viene de ahi. */
const MAX_BYTES = 200_000;

/**
 * Webhook de WhatsApp. En Meta se configura con la URL
 * https://santiagogarage.cl/api/whatsapp, la palabra de WHATSAPP_VERIFICAR y
 * suscrito al campo "messages".
 *
 * GET: Meta comprueba una sola vez que la URL es nuestra.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (!verificacionValida(p.get("hub.mode"), p.get("hub.verify_token"))) {
    return new NextResponse("No autorizado", { status: 403 });
  }
  return new NextResponse(p.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
}

type MensajeMeta = {
  from?: string;
  type?: string;
  button?: { payload?: string; text?: string };
  interactive?: { type?: string; button_reply?: { id?: string } };
};

type EstadoMeta = { status?: string; recipient_id?: string; errors?: { code?: number; title?: string }[] };

/**
 * POST: avisos de Meta. Solo se atiende cuando alguien toca un boton del
 * recordatorio; lo que el cliente escriba a mano lo sigue viendo el taller en
 * su app de WhatsApp Business, como siempre.
 *
 * Siempre se responde 200 a lo que viene firmado: si no, Meta reintenta el
 * mismo aviso durante horas. Por eso cada accion aguanta repetirse.
 */
export async function POST(req: NextRequest) {
  const cuerpo = await req.text();
  if (cuerpo.length > MAX_BYTES) return new NextResponse(null, { status: 413 });
  if (!(await firmaDeMetaValida(cuerpo, req.headers.get("x-hub-signature-256")))) {
    return new NextResponse("Firma inválida", { status: 401 });
  }

  let aviso: { entry?: { changes?: { value?: { messages?: MensajeMeta[]; statuses?: EstadoMeta[] } }[] }[] };
  try {
    aviso = JSON.parse(cuerpo);
  } catch {
    return NextResponse.json({ ok: true });
  }

  for (const entrada of aviso.entry ?? []) {
    for (const cambio of entrada.changes ?? []) {
      for (const m of cambio.value?.messages ?? []) {
        // Boton de plantilla ("button"), o de mensaje interactivo por si algun dia se usa
        const boton = m.type === "button" ? m.button?.payload : m.interactive?.button_reply?.id;
        if (!m.from || !boton) continue;
        const resultado = await responderBoton(m.from, boton).catch((e) => `error: ${e instanceof Error ? e.message : e}`);
        console.log(`[whatsapp] botón "${boton.split(":")[0]}" de ${m.from.slice(0, 5)}…: ${resultado}`);
      }
      // Recordatorios que Meta no pudo entregar (numero sin WhatsApp, por ejemplo)
      for (const e of cambio.value?.statuses ?? []) {
        if (e.status === "failed") console.error("[whatsapp] no se entregó un mensaje:", JSON.stringify(e.errors ?? []));
      }
    }
  }
  return NextResponse.json({ ok: true });
}
