import { NextRequest, NextResponse } from "next/server";
import { esTipo, regla, fechaLarga, horaFin, agendaDelTipo, rangoAgendable, MAX_FOTOS } from "@/lib/agenda";
import { disponibilidad, validarCita, reservarCita, esFotoValida, guardarFotos } from "@/lib/citas";
import { avisarReserva } from "@/lib/correo-agenda";
import { whatsappConfigurado } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
// Guardar fotos y mandar los dos correos puede tardar unos segundos
export const maxDuration = 30;

/**
 * Vercel no acepta envios de mas de 4,5 MB. Las fotos llegan achicadas desde
 * el navegador (~300 KB cada una), asi que esto solo lo pasa algo armado a mano.
 */
const MAX_BYTES = 4_400_000;

const SIN_AGENDA = "La agenda no está disponible en este momento. Escríbenos por WhatsApp y te damos hora.";

/**
 * Dias y horas libres de un tipo. Solo devuelve horas: nunca quien tomo las
 * otras.
 */
export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo");
  if (!esTipo(tipo)) return NextResponse.json({ ok: false, error: "Tipo de atención inválido." }, { status: 400 });

  // Si la base no responde, el calendario igual aparece, armado solo con las
  // reglas del taller. Al reservar se revisa la hora contra la base de nuevo
  const dias = (await disponibilidad(tipo)) ?? agendaDelTipo(tipo, rangoAgendable(), new Map(), new Set());
  // recordatorio: si esta conectado WhatsApp, el formulario avisa que llegara uno
  return NextResponse.json({ ok: true, dias, recordatorio: whatsappConfigurado() }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * Reserva una hora. Llega como formulario (multipart) porque puede traer
 * fotos. El proxy ya limita la frecuencia por IP y bloquea envios desde otros
 * sitios; aca se revisa todo de nuevo antes de guardar.
 */
export async function POST(req: NextRequest) {
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Las fotos pesan demasiado. Prueba con menos." }, { status: 413 });
  }

  const campos: Record<string, string> = {};
  const fotos: Uint8Array[] = [];
  try {
    const form = await req.formData();
    for (const [clave, valor] of form.entries()) {
      if (typeof valor === "string") campos[clave] = valor;
      else if (clave === "fotos") fotos.push(new Uint8Array(await valor.arrayBuffer()));
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Formato inválido." }, { status: 400 });
  }

  // Campo trampa: lo llenan los bots. Se responde como si nada, sin guardar.
  if (campos.empresa) return NextResponse.json({ ok: true, correo: true }, { status: 201 });

  if (fotos.length > MAX_FOTOS || fotos.some((f) => !esFotoValida(f))) {
    return NextResponse.json({ ok: false, error: `Las fotos no son válidas (máximo ${MAX_FOTOS}).` }, { status: 400 });
  }

  const v = validarCita(campos);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  const reserva = await reservarCita(v.datos);
  if (!reserva.ok) {
    const respuestas = {
      "sin-base": [SIN_AGENDA, 503],
      "no-disponible": ["Ese día no está disponible. Elige otro.", 409],
      ocupada: ["Alguien tomó esa hora recién. Elige otra.", 409],
      error: ["No pudimos guardar tu hora. Intenta de nuevo en un momento.", 500],
    } as const;
    const [error, status] = respuestas[reserva.motivo];
    return NextResponse.json({ ok: false, error, motivo: reserva.motivo }, { status });
  }

  // La hora ya esta tomada. Fotos y correos van en paralelo, y se esperan
  // dentro de la peticion: en segundo plano (after) pueden no ejecutarse nunca
  // en Vercel y no dejan rastro (ver Trampas conocidas)
  const c = reserva.cita;
  const [, aviso] = await Promise.all([guardarFotos(c.id, fotos), avisarReserva(c, fotos)]);

  return NextResponse.json(
    {
      ok: true,
      correo: aviso.cliente,
      cita: {
        tipo: regla(c.tipo).nombre,
        dia: fechaLarga(c.fecha),
        hora: c.hora,
        hasta: horaFin(c.tipo, c.hora),
        email: c.email,
      },
    },
    { status: 201 }
  );
}
