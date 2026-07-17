import { NextRequest, NextResponse } from "next/server";

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

export default function proxy(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";

  if (excedeLimite(ip)) {
    return new NextResponse("Demasiadas solicitudes. Intenta de nuevo en un minuto.", {
      status: 429,
      headers: { "Retry-After": "60", "Content-Type": "text/plain; charset=utf-8" },
    });
  }

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
