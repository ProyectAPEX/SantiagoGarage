import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null | undefined;

/** ¿Esta conectada la base? Sin ella el panel va directo al presupuesto. */
export function baseConfigurada(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
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
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  cliente =
    url && clave
      ? createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  return cliente;
}
