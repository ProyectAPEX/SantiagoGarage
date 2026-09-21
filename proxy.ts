import { NextRequest, NextResponse } from "next/server";
import { RUTA_PANEL, credencialesValidas } from "@/lib/panel";
import { permitir, ipDesde } from "@/lib/rate-limit";

const MAX_POR_MINUTO = Number(process.env.RATE_LIMIT_MAX ?? 120);

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

  // Si no hay credenciales configuradas, se niega el acceso (nunca se abre por defecto)
  if (!process.env.PANEL_USUARIO || !process.env.PANEL_CLAVE) {
    return new NextResponse("Panel no configurado.", { status: 503 });
  }
  if (credencialesValidas(req.headers.get("authorization"))) return null;

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
  res.headers.set("X-RateLimit-Limit", String(MAX_POR_MINUTO));

  // El panel se oculta por cabecera, nunca nombrándolo en robots.txt (es público)
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
