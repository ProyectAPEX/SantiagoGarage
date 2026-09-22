import { NextRequest, NextResponse } from "next/server";
import { RUTA_PANEL, RUTA_ENTRAR, COOKIE_PANEL, panelConfigurado, sesionValida } from "@/lib/panel";
import { permitir, ipDesde } from "@/lib/rate-limit";

const MAX_POR_MINUTO = Number(process.env.RATE_LIMIT_MAX ?? 120);

// ——— CORS: solo el propio sitio (y la URL pública en producción) ———
function origenesPermitidos(req: NextRequest): Set<string> {
  const permitidos = new Set<string>([req.nextUrl.origin]);
  const sitio = process.env.NEXT_PUBLIC_SITE_URL;
  if (sitio) permitidos.add(sitio.replace(/\/$/, ""));
  return permitidos;
}

const OCULTO = { "X-Robots-Tag": "noindex, nofollow, noarchive" };

function esPanel(pathname: string): boolean {
  return pathname === RUTA_PANEL || pathname.startsWith(`${RUTA_PANEL}/`);
}

// ——— Acceso privado al panel (ruta secreta + sesion firmada, como Ulloa) ———
// Sin sesion, todo el panel manda a la pantalla de clave. Con sesion, la
// pantalla de clave manda al panel.
async function guardiaPanel(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;
  if (!esPanel(pathname)) return null;

  // Si no hay clave configurada, se niega el acceso (nunca se abre por defecto)
  if (!panelConfigurado()) {
    return new NextResponse("Panel no configurado.", { status: 503, headers: OCULTO });
  }

  const conSesion = await sesionValida(req.cookies.get(COOKIE_PANEL)?.value);
  if (pathname === RUTA_ENTRAR) {
    return conSesion ? NextResponse.redirect(new URL(RUTA_PANEL, req.url), { headers: OCULTO }) : null;
  }
  return conSesion ? null : NextResponse.redirect(new URL(RUTA_ENTRAR, req.url), { headers: OCULTO });
}

export default async function proxy(req: NextRequest) {
  const ip = ipDesde(req.headers);

  // El límite general va primero: también frena intentos de adivinar la clave
  if (!permitir(`global:${ip}`, MAX_POR_MINUTO, 60_000)) {
    return new NextResponse("Demasiadas solicitudes. Intenta de nuevo en un minuto.", {
      status: 429,
      headers: { "Retry-After": "60", "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // El formulario público escribe en la base: límite mucho más estricto contra spam
  if (req.nextUrl.pathname === "/api/solicitudes" && req.method === "POST") {
    if (!permitir(`solicitud:${ip}`, 5, 10 * 60_000)) {
      return NextResponse.json(
        { ok: false, error: "Demasiadas solicitudes seguidas. Intenta en unos minutos." },
        { status: 429, headers: { "Retry-After": "600" } }
      );
    }
  }

  // La clave del panel: pocos intentos por IP, contra quien quiera adivinarla
  if (req.nextUrl.pathname === "/api/acceso" && req.method === "POST") {
    if (!permitir(`acceso:${ip}`, 10, 10 * 60_000)) {
      return NextResponse.json(
        { ok: false, error: "Demasiados intentos. Espera unos minutos." },
        { status: 429, headers: { "Retry-After": "600" } }
      );
    }
  }

  const desvio = await guardiaPanel(req);
  if (desvio) return desvio;

  const permitidos = origenesPermitidos(req);
  const origin = req.headers.get("origin");

  // Preflight CORS: responde solo a orígenes permitidos
  if (req.method === "OPTIONS" && origin) {
    if (!permitidos.has(origin)) return new NextResponse(null, { status: 403 });
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      },
    });
  }

  // Bloquea métodos de escritura desde orígenes ajenos (anti-CSRF)
  if (origin && !permitidos.has(origin) && req.method !== "GET" && req.method !== "HEAD") {
    return new NextResponse("Origen no permitido", { status: 403 });
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(MAX_POR_MINUTO));

  // El panel se oculta por cabecera, nunca nombrándolo en robots.txt (es público)
  if (esPanel(req.nextUrl.pathname)) {
    res.headers.set("X-Robots-Tag", OCULTO["X-Robots-Tag"]);
  }
  if (origin && permitidos.has(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
  }
  return res;
}

export const config = {
  // Excluye estáticos: no tiene sentido limitarlos y ensuciarían el conteo
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)$).*)"],
};
