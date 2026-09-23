import "server-only";
import { supabase } from "@/lib/supabase";
import { limpiarTexto } from "@/lib/sanitize";

/**
 * Historial de presupuestos. Solo servidor: la clave secreta de Supabase se
 * salta RLS, asi que este archivo nunca puede llegar al navegador.
 */

export type ItemGuardado = { descripcion: string; precio: number };

export type PresupuestoGuardado = {
  id: string;
  creado: string;
  numero: string;
  fecha: string;
  cliente_nombre: string;
  cliente_rut: string;
  cliente_telefono: string;
  cliente_email: string;
  cliente_domicilio: string;
  cliente_comuna: string;
  vehiculo_marca: string;
  vehiculo_modelo: string;
  vehiculo_patente: string;
  vehiculo_anio: string;
  vehiculo_color: string;
  items: ItemGuardado[];
  descuento: number;
  subtotal: number;
  iva: number;
  total: number;
  plazo_dias: string;
  validez_dias: string;
  observaciones: string;
  enviado_por: "whatsapp" | "pdf" | null;
};

const COLUMNAS =
  "id, creado, numero, fecha, cliente_nombre, cliente_rut, cliente_telefono, cliente_email, cliente_domicilio, cliente_comuna, vehiculo_marca, vehiculo_modelo, vehiculo_patente, vehiculo_anio, vehiculo_color, items, descuento, subtotal, iva, total, plazo_dias, validez_dias, observaciones, enviado_por";

const MAX_LISTA = 300;
const MAX_ITEMS = 40;
const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lo que manda el panel. Todo se recorta aca antes de tocar la base. */
export type EntradaPresupuesto = {
  numero: string;
  fecha: string;
  cliente: { nombre: string; rut: string; telefono: string; email: string; domicilio: string; comuna: string };
  vehiculo: { marca: string; modelo: string; patente: string; anio: string; color: string };
  items: ItemGuardado[];
  descuento: number;
  subtotal: number;
  iva: number;
  total: number;
  plazoDias: string;
  validezDias: string;
  observaciones: string;
  enviadoPor: "whatsapp" | "pdf";
};

const entero = (n: unknown) => Math.max(0, Math.round(Number(n) || 0));

/** Guarda el presupuesto recien emitido. Devuelve el id, o null si falló. */
export async function guardarPresupuesto(entrada: EntradaPresupuesto): Promise<string | null> {
  const db = supabase();
  if (!db) return null;

  const nombre = limpiarTexto(entrada.cliente?.nombre ?? "", 80);
  if (!nombre) return null;

  const fila = {
    numero: limpiarTexto(entrada.numero ?? "", 20),
    fecha: limpiarTexto(entrada.fecha ?? "", 12),
    cliente_nombre: nombre,
    cliente_rut: limpiarTexto(entrada.cliente?.rut ?? "", 12),
    cliente_telefono: limpiarTexto(entrada.cliente?.telefono ?? "", 17),
    cliente_email: limpiarTexto(entrada.cliente?.email ?? "", 120),
    cliente_domicilio: limpiarTexto(entrada.cliente?.domicilio ?? "", 60),
    cliente_comuna: limpiarTexto(entrada.cliente?.comuna ?? "", 30),
    vehiculo_marca: limpiarTexto(entrada.vehiculo?.marca ?? "", 40),
    vehiculo_modelo: limpiarTexto(entrada.vehiculo?.modelo ?? "", 40),
    vehiculo_patente: limpiarTexto(entrada.vehiculo?.patente ?? "", 10).toUpperCase(),
    vehiculo_anio: limpiarTexto(entrada.vehiculo?.anio ?? "", 4),
    vehiculo_color: limpiarTexto(entrada.vehiculo?.color ?? "", 25),
    items: (Array.isArray(entrada.items) ? entrada.items : []).slice(0, MAX_ITEMS).map((i) => ({
      descripcion: limpiarTexto(i?.descripcion ?? "", 200),
      precio: entero(i?.precio),
    })),
    descuento: entero(entrada.descuento),
    subtotal: entero(entrada.subtotal),
    iva: entero(entrada.iva),
    total: entero(entrada.total),
    plazo_dias: limpiarTexto(entrada.plazoDias ?? "", 3),
    validez_dias: limpiarTexto(entrada.validezDias ?? "", 3),
    observaciones: limpiarTexto(entrada.observaciones ?? "", 400),
    enviado_por: entrada.enviadoPor === "whatsapp" ? "whatsapp" : "pdf",
  };

  const { data, error } = await db.from("presupuestos").insert(fila).select("id").single();
  if (error) {
    console.error("No se pudo guardar el presupuesto:", error.message);
    return null;
  }
  return data?.id ?? null;
}

/**
 * Historial, del mas nuevo al mas viejo. Con `busca` filtra por cliente,
 * patente o numero, que es como los busca el dueño.
 */
export async function listarPresupuestos(busca = ""): Promise<PresupuestoGuardado[] | null> {
  const db = supabase();
  if (!db) return null;

  let consulta = db.from("presupuestos").select(COLUMNAS).order("creado", { ascending: false }).limit(MAX_LISTA);

  const q = limpiarTexto(busca, 40).replace(/[%,()]/g, " ").trim();
  if (q) {
    consulta = consulta.or(
      `cliente_nombre.ilike.%${q}%,vehiculo_patente.ilike.%${q}%,numero.ilike.%${q}%,cliente_rut.ilike.%${q}%`
    );
  }

  const { data, error } = await consulta;
  if (error) {
    console.error("No se pudo leer el historial:", error.message);
    return null;
  }
  return (data ?? []) as unknown as PresupuestoGuardado[];
}

/** Un presupuesto del historial, para volver a abrirlo en el formulario. */
export async function obtenerPresupuesto(id: string): Promise<PresupuestoGuardado | null> {
  const db = supabase();
  if (!db || !ES_UUID.test(id)) return null;
  const { data, error } = await db.from("presupuestos").select(COLUMNAS).eq("id", id).maybeSingle();
  if (error) {
    console.error("No se pudo leer el presupuesto:", error.message);
    return null;
  }
  return (data ?? null) as unknown as PresupuestoGuardado | null;
}
