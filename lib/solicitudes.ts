import "server-only";
import { supabase } from "@/lib/supabase";
import { limpiarTexto, esTelefonoValido, esEmailValido } from "@/lib/sanitize";

export type EstadoSolicitud = "nueva" | "cotizada" | "descartada";

export type Solicitud = {
  id: string;
  creada: string;
  nombre: string;
  telefono: string;
  email: string | null;
  vehiculo: string | null;
  mensaje: string;
  estado: EstadoSolicitud;
  atendida: string | null;
};

export type NuevaSolicitud = Pick<Solicitud, "nombre" | "telefono" | "email" | "vehiculo" | "mensaje">;

/** Solo las columnas que se usan: pedir de mas es trafico regalado. */
const COLUMNAS = "id, creada, nombre, telefono, email, vehiculo, mensaje, estado, atendida";

/** Lo que muestra la bandeja. Explicito para no chocar con el tope de 1.000 filas de Supabase. */
const MAX_BANDEJA = 200;

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Valida y limpia lo que llega del formulario publico. Mismas reglas que el
 * formulario en el navegador, pero aqui manda: el navegador se puede saltar.
 */
export function validarSolicitud(
  entrada: unknown
): { ok: true; datos: NuevaSolicitud } | { ok: false; error: string } {
  const e = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>;
  const txt = (v: unknown, max: number) => limpiarTexto(typeof v === "string" ? v : "", max);

  const nombre = txt(e.nombre, 80);
  const telefono = txt(e.telefono, 20);
  const email = txt(e.email, 120);
  const vehiculo = txt(e.auto, 60);
  const mensaje = txt(e.mensaje, 600);

  if (!nombre || !telefono || !mensaje) return { ok: false, error: "Faltan datos obligatorios." };
  if (!esTelefonoValido(telefono)) return { ok: false, error: "El teléfono no es válido." };
  if (email && !esEmailValido(email)) return { ok: false, error: "El email no es válido." };

  return { ok: true, datos: { nombre, telefono, email: email || null, vehiculo: vehiculo || null, mensaje } };
}

export async function crearSolicitud(datos: NuevaSolicitud): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  const { error } = await sb.from("solicitudes").insert(datos);
  if (error) console.error("[solicitudes] no se pudo guardar:", error.message);
  return !error;
}

/**
 * Bandeja del admin: las nuevas primero, despues el resto; dentro de cada
 * grupo, lo mas reciente arriba. null = sin base o con error.
 */
/**
 * Cuántas solicitudes sin atender, para el globito del panel. Devuelve null
 * si la tabla no existe (hoy es el caso: solo se creó la de presupuestos).
 */
export async function contarSolicitudesNuevas(): Promise<number | null> {
  const sb = supabase();
  if (!sb) return null;
  const { count, error } = await sb
    .from("solicitudes")
    .select("id", { count: "exact", head: true })
    .eq("estado", "nueva");
  if (error) return null;
  return count ?? 0;
}

export async function listarSolicitudes(): Promise<Solicitud[] | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("solicitudes")
    .select(COLUMNAS)
    .order("creada", { ascending: false })
    .limit(MAX_BANDEJA);
  if (error) {
    console.error("[solicitudes] no se pudo listar:", error.message);
    return null;
  }
  const filas = (data ?? []) as Solicitud[];
  return [...filas.filter((s) => s.estado === "nueva"), ...filas.filter((s) => s.estado !== "nueva")];
}

export async function obtenerSolicitud(id: string): Promise<Solicitud | null> {
  if (!ES_UUID.test(id)) return null;
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from("solicitudes").select(COLUMNAS).eq("id", id).maybeSingle();
  if (error) console.error("[solicitudes] no se pudo leer:", error.message);
  return (data as Solicitud | null) ?? null;
}

export async function cambiarEstado(id: string, estado: EstadoSolicitud): Promise<boolean> {
  if (!ES_UUID.test(id)) return false;
  const sb = supabase();
  if (!sb) return false;
  const { error } = await sb
    .from("solicitudes")
    .update({ estado, atendida: estado === "nueva" ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("[solicitudes] no se pudo actualizar:", error.message);
  return !error;
}
