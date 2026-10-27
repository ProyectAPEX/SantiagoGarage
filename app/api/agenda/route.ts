import { NextRequest, NextResponse } from "next/server";
import { esTipo, regla, fechaLarga, horaFin } from "@/lib/agenda";
import { disponibilidad, validarCita, reservarCita } from "@/lib/citas";
import { avisarReserva } from "@/lib/correo-agenda";

export const dynamic = "force-dynamic";

/** Un formulario de agenda no pesa mas que esto. */
const MAX_BYTES = 6_000;

const SIN_AGENDA = "La agenda no está disponible en este momento. Escríbenos por WhatsApp y te damos hora.";

/**
 * Dias y horas libres de un tipo. Solo devuelve horas: nunca quien tomo las
 * otras.
 */
export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo");
  if (!esTipo(tipo)) return NextResponse.json({ ok: false, error: "Tipo de atención inválido." }, { status: 400 });

  const dias = await disponibilidad(tipo);
  if (!dias) return NextResponse.json({ ok: false, error: SIN_AGENDA }, { status: 503 });
  return NextResponse.json({ ok: true, dias }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * Reserva una hora. El proxy ya limita la frecuencia por IP y bloquea envios
 * desde otros sitios; aca se revisa todo de nuevo antes de guardar.
 */
export async function POST(req: NextRequest) {
  const cuerpo = await req.text();
  if (cuerpo.length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(cuerpo);
  } catch {
    return NextResponse.json({ ok: false, error: "Formato inválido." }, { status: 400 });
  }

  // Campo trampa: lo llenan los bots. Se responde como si nada, sin guardar.
  if (json && typeof json === "object" && (json as Record<string, unknown>).empresa) {
    return NextResponse.json({ ok: true, correo: true }, { status: 201 });
  }

  const v = validarCita(json);
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

  // Se espera el correo dentro de la peticion: en segundo plano (after) puede
  // no ejecutarse nunca en Vercel y no deja rastro (ver Trampas conocidas)
  const c = reserva.cita;
  const aviso = await avisarReserva(c);

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
