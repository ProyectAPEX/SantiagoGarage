import { NextRequest, NextResponse } from "next/server";
import { RUTA_PANEL } from "@/lib/site";

// ——— Rate limiting en memoria, por IP ———
// Suficiente para un despliegue de servidor único; si el sitio escala a
// múltiples instancias, cambiar por un almacén compartido (Redis/Upstash).
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = Number(process.env.RATE_LIMIT_MAX ?? 120);
const visitas = new Map<string, { count: number; reset: number }>();

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  // Purga perezosa para que el mapa no crezca sin límite
  if (visitas.size > 1000) {
    for (const [k, v] of visitas) if (ahora > v.reset) visitas.delete(k);
  }
  const reg = visitas.get(ip);
  if (!reg || ahora > reg.reset) {
    visitas.set(ip, { count: 1, reset: ahora + VENTANA_MS });
    return false;
  }
  reg.count++;
  return reg.count > MAX_POR_VENTANA;
}

// ——— CORS: solo el propio sitio (y la URL pública en producción) ———
function origenesPermitidos(req: NextRequest): Set<string> {
  const permitidos = new Set<string>([req.nextUrl.origin]);
  const sitio = process.env.NEXT_PUBLIC_SITE_URL;
  if (sitio) permitidos.add(sitio.replace(/\/$/, ""));
  return permitidos;
}

// ——— Acceso privado al panel (ruta secreta + HTTP Basic en el servidor) ———
function bloquearSiNoAutorizado(req: NextRequest): NextResponse | null {
  if (!req.nextUrl.pathname.startsWith(RUTA_PANEL)) return null;

  const usuario = process.env.PANEL_USUARIO;
  const clave = process.env.PANEL_CLAVE;

  // Si no hay credenciales configuradas, se niega el acceso (nunca se abre por defecto)
  if (!usuario || !clave) {
    return new NextResponse("Panel no configurado.", { status: 503 });
  }

  const [tipo, valor] = (req.headers.get("authorization") ?? "").split(" ");
  if (tipo === "Basic" && valor) {
    try {
      const i = atob(valor).indexOf(":");
      if (i > 0) {
        const u = atob(valor).slice(0, i);
        const c = atob(valor).slice(i + 1);
        if (u === usuario && c === clave) return null; // autorizado
      }
    } catch {
      /* cabecera mal formada: cae al 401 */
    }
  }

  return new NextResponse("Acceso restringido.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Santiago Garage - uso interno"',
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export default function proxy(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";

  // El rate limit va primero: tambien frena intentos de adivinar la clave
  if (excedeLimite(ip)) {
    return new NextResponse("Demasiadas solicitudes. Intenta de nuevo en un minuto.", {
      status: 429,
      headers: { "Retry-After": "60", "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const noAutorizado = bloquearSiNoAutorizado(req);
  if (noAutorizado) return noAutorizado;

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
  res.headers.set("X-RateLimit-Limit", String(MAX_POR_VENTANA));

  // El panel se oculta por cabecera, nunca nombrandolo en robots.txt (es publico)
  if (req.nextUrl.pathname.startsWith(RUTA_PANEL)) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
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
