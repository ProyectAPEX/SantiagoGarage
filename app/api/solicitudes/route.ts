import { NextRequest, NextResponse } from "next/server";
import { validarSolicitud, crearSolicitud } from "@/lib/solicitudes";

/** Un formulario no pesa mas que esto; cualquier cosa mayor no es un cliente. */
const MAX_BYTES = 8_000;

/**
 * Recibe la solicitud del formulario publico y la guarda para el admin.
 * El proxy ya limita la frecuencia por IP y bloquea envios desde otros sitios.
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

  // Campo trampa: invisible para personas, lo llenan los bots. Se responde "ok"
  // sin guardar nada, para que el bot no aprenda que lo detectamos.
  if (json && typeof json === "object" && (json as Record<string, unknown>).empresa) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const v = validarSolicitud(json);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  const guardada = await crearSolicitud(v.datos);
  if (!guardada) {
    return NextResponse.json({ ok: false, error: "No se pudo guardar la solicitud." }, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
