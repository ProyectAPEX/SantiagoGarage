import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null | undefined;

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
