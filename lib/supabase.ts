import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { variable } from "@/lib/variables";

let cliente: SupabaseClient | null | undefined;

/** ¿Esta conectada la base? Sin ella el panel va directo al presupuesto. */
export function baseConfigurada(): boolean {
  return Boolean(variable("SUPABASE_URL") && variable("SUPABASE_SECRET_KEY"));
}

/**
 * Cliente de Supabase para el SERVIDOR. Usa la clave secreta, que se salta
 * RLS, asi que nunca puede llegar al navegador: "server-only" hace fallar el
 * build si un componente del navegador lo importa.
 *
 * Devuelve null si faltan las variables de entorno. El sitio sigue
 * funcionando sin base: el formulario igual abre WhatsApp.
 */
export function supabase(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;
  const url = variable("SUPABASE_URL");
  const clave = variable("SUPABASE_SECRET_KEY");
  cliente =
    url && clave
      ? createClient(url, clave, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: fetchConReintento },
        })
      : null;
  return cliente;
}

/**
 * Supabase a veces rechaza una consulta con "JWT issued at future": su reloj
 * va desfasado unos segundos y la consulta ni alcanza a correr. En produccion
 * dejo a un cliente sin calendario (29 de octubre de 2026). Ese rechazo se
 * reintenta siempre; un error de red o un 502/503/504 solo en lecturas, porque
 * en una escritura no se sabe si alcanzo a guardarse.
 */
const PAUSAS = [400, 1200, 2500];

async function fetchConReintento(entrada: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const metodo = (init?.method ?? (entrada instanceof Request ? entrada.method : "GET")).toUpperCase();
  const lectura = metodo === "GET" || metodo === "HEAD";

  for (let intento = 0; ; intento++) {
    const ultimo = intento === PAUSAS.length || init?.signal?.aborted;
    try {
      const res = await fetch(entrada, init);
      if (ultimo) return res;
      const reintentar = (lectura && [502, 503, 504].includes(res.status)) || (await relojDesfasado(res));
      if (!reintentar) return res;
      console.warn(`[supabase] reintento ${intento + 1}: ${res.status} en ${metodo}`);
    } catch (e) {
      if (ultimo || !lectura) throw e;
      console.warn(`[supabase] reintento ${intento + 1}: sin conexión en ${metodo}`);
    }
    await new Promise((r) => setTimeout(r, PAUSAS[intento]));
  }
}

/** Rechazo por reloj: PostgREST lo marca PGRST303; Storage reclama por el "iat". */
async function relojDesfasado(res: Response): Promise<boolean> {
  if (![400, 401, 403].includes(res.status)) return false;
  const texto = await res.clone().text().catch(() => "");
  // Llega dentro de un JSON: las comillas del "iat" vienen escapadas
  return /issued at future|PGRST303|iat\W+claim timestamp/i.test(texto);
}
