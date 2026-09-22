import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { RUTA_PANEL, COOKIE_PANEL, DURACION_SESION, claveCorrecta, crearSesion, panelConfigurado } from "@/lib/panel";

// Entrada al panel del dueño. El tope de intentos por IP va en el proxy.
//
// La cookie vale solo dentro de la ruta del panel: el resto del sitio nunca
// la recibe. Y la ruta secreta viaja recien en la respuesta, despues de la
// clave correcta: el JavaScript publico (la entrada escondida) no la conoce.

const galleta = {
  httpOnly: true,
  sameSite: "lax" as const, // "strict" la perderia al abrir el panel desde un enlace de WhatsApp
  secure: process.env.NODE_ENV === "production",
  path: RUTA_PANEL,
};

export async function POST(req: Request) {
  if (!panelConfigurado()) {
    return NextResponse.json({ ok: false, error: "El panel no está configurado." }, { status: 503 });
  }

  let clave = "";
  try {
    const cuerpo = await req.json();
    clave = typeof cuerpo?.clave === "string" ? cuerpo.clave.slice(0, 200) : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  if (!(await claveCorrecta(clave))) {
    return NextResponse.json({ ok: false, error: "Clave incorrecta." }, { status: 401 });
  }

  (await cookies()).set(COOKIE_PANEL, await crearSesion(), { ...galleta, maxAge: DURACION_SESION });
  return NextResponse.json({ ok: true, destino: RUTA_PANEL });
}

/** Salir: borra la sesion. */
export async function DELETE() {
  (await cookies()).set(COOKIE_PANEL, "", { ...galleta, maxAge: 0 });
  return NextResponse.json({ ok: true });
}
