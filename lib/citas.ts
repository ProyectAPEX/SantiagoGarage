import "server-only";
import { supabase } from "@/lib/supabase";
import { limpiarTexto, esTelefonoValido, esEmailValido } from "@/lib/sanitize";
import {
  type TipoCita,
  type Ocupada,
  type DiaAgenda,
  agendaDelTipo,
  horasLibres,
  rangoAgendable,
  instanteChile,
  hoyEnChile,
  sumarDias,
  diaSemana,
  regla,
  esTipo,
  esFecha,
  FERIADOS,
  MAX_FOTOS,
  MAX_BYTES_FOTO,
  DIAS_GUARDAR_FOTOS,
} from "@/lib/agenda";

/**
 * Citas de la agenda publica. Solo servidor: usa la clave secreta de
 * Supabase. Aca se revisan de nuevo todas las reglas de lib/agenda.ts, porque
 * lo que manda el navegador se puede inventar.
 */

export type Cita = {
  id: string;
  creada: string;
  tipo: TipoCita;
  fecha: string;
  hora: string;
  inicio: string;
  fin: string;
  estado: "confirmada" | "cancelada";
  cancelada: string | null;
  nombre: string;
  telefono: string;
  email: string;
  marca: string | null;
  modelo: string | null;
  patente: string | null;
  aseguradora: string | null;
  siniestro: string | null;
  /** Las observaciones del cliente (la columna se llama asi desde el inicio) */
  comentario: string | null;
  /** Rutas de las fotos del daño en el espacio privado "citas" */
  fotos: string[];
  /** Cuando salio el recordatorio por WhatsApp (null = todavia no) */
  recordatorio: string | null;
  /** Cuando el cliente toco "Confirmo" en el recordatorio */
  asistencia_confirmada: string | null;
};

export type NuevaCita = Pick<
  Cita,
  "tipo" | "fecha" | "hora" | "nombre" | "telefono" | "email" | "marca" | "modelo" | "patente" | "aseguradora" | "siniestro" | "comentario"
>;

const COLUMNAS =
  "id, creada, tipo, fecha, hora, inicio, fin, estado, cancelada, nombre, telefono, email, marca, modelo, patente, aseguradora, siniestro, comentario, fotos, recordatorio, asistencia_confirmada";

const ESPACIO_FOTOS = "citas";

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lo que muestra el panel. Explicito para no chocar con el tope de 1.000 filas de Supabase. */
const MAX_AGENDA = 300;

/** Valida y limpia lo que llega del formulario publico. */
export function validarCita(entrada: unknown): { ok: true; datos: NuevaCita } | { ok: false; error: string } {
  const e = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>;
  const txt = (v: unknown, max: number) => limpiarTexto(typeof v === "string" ? v : "", max);

  if (!esTipo(e.tipo)) return { ok: false, error: "Elige el tipo de atención." };
  if (!esFecha(e.fecha) || typeof e.hora !== "string" || !/^\d{2}:\d{2}$/.test(e.hora)) {
    return { ok: false, error: "Elige el día y la hora." };
  }

  const nombre = txt(e.nombre, 80);
  const telefono = txt(e.telefono, 20);
  const email = txt(e.email, 120);
  if (!nombre || !telefono || !email) return { ok: false, error: "Completa nombre, teléfono y correo." };
  if (!esTelefonoValido(telefono)) return { ok: false, error: "El teléfono no es válido." };
  if (!esEmailValido(email)) return { ok: false, error: "El correo no es válido." };

  const opcional = (v: unknown, max: number) => txt(v, max) || null;
  const esAseguradora = e.tipo === "aseguradora";

  return {
    ok: true,
    datos: {
      tipo: e.tipo,
      fecha: e.fecha,
      hora: e.hora,
      nombre,
      telefono,
      email,
      marca: opcional(e.marca, 40),
      modelo: opcional(e.modelo, 40),
      patente: opcional(e.patente, 10)?.toUpperCase() ?? null,
      // Solo tienen sentido con aseguradora: en otro tipo se descartan
      aseguradora: esAseguradora ? opcional(e.aseguradora, 40) : null,
      siniestro: esAseguradora ? opcional(e.siniestro, 30) : null,
      comentario: opcional(e.comentario, 400),
    },
  };
}

/** Citas confirmadas entre dos fechas, agrupadas por dia, mas los dias bloqueados. */
async function ocupacion(desde: string, hasta: string) {
  const db = supabase();
  if (!db) return null;

  const [citas, bloqueos] = await Promise.all([
    db.from("citas").select("tipo, fecha, inicio, fin").eq("estado", "confirmada").gte("fecha", desde).lte("fecha", hasta).limit(1000),
    db.from("agenda_bloqueos").select("fecha").gte("fecha", desde).lte("fecha", hasta),
  ]);
  if (citas.error || bloqueos.error) {
    console.error("[agenda] no se pudo leer la ocupación:", citas.error?.message ?? bloqueos.error?.message);
    return null;
  }

  const porDia = new Map<string, Ocupada[]>();
  for (const c of citas.data as { tipo: TipoCita; fecha: string; inicio: string; fin: string }[]) {
    const lista = porDia.get(c.fecha) ?? [];
    lista.push({ tipo: c.tipo, inicio: Date.parse(c.inicio), fin: Date.parse(c.fin) });
    porDia.set(c.fecha, lista);
  }
  const bloqueados = new Set((bloqueos.data as { fecha: string }[]).map((b) => b.fecha));
  return { porDia, bloqueados };
}

/** Dias y horas libres de un tipo, para el calendario publico. null = sin base o con error. */
export async function disponibilidad(tipo: TipoCita): Promise<DiaAgenda[] | null> {
  const rango = rangoAgendable();
  const o = await ocupacion(rango.desde, rango.hasta);
  if (!o) return null;
  return agendaDelTipo(tipo, rango, o.porDia, o.bloqueados);
}

export type Reserva =
  | { ok: true; cita: Cita }
  | { ok: false; motivo: "sin-base" | "no-disponible" | "ocupada" | "error" };

/**
 * Reserva la hora. Revisa de nuevo que el dia y la hora esten libres con los
 * datos de este momento, y la base frena dos reservas simultaneas de la misma
 * hora (restriccion citas_sin_choque).
 */
export async function reservarCita(d: NuevaCita): Promise<Reserva> {
  const db = supabase();
  if (!db) return { ok: false, motivo: "sin-base" };

  const rango = rangoAgendable();
  if (d.fecha < rango.desde || d.fecha > rango.hasta || FERIADOS.has(d.fecha)) {
    return { ok: false, motivo: "no-disponible" };
  }

  const o = await ocupacion(d.fecha, d.fecha);
  if (!o) return { ok: false, motivo: "error" };
  if (o.bloqueados.has(d.fecha)) return { ok: false, motivo: "no-disponible" };
  if (!horasLibres(d.tipo, d.fecha, o.porDia.get(d.fecha) ?? []).includes(d.hora)) {
    return { ok: false, motivo: "ocupada" };
  }

  const inicio = instanteChile(d.fecha, d.hora);
  const fin = new Date(inicio.getTime() + regla(d.tipo).duracion * 60_000);

  const { data, error } = await db
    .from("citas")
    .insert({ ...d, inicio: inicio.toISOString(), fin: fin.toISOString() })
    .select(COLUMNAS)
    .single();

  if (error) {
    // 23P01 = la restriccion de exclusion: alguien tomo esa hora recien
    if (error.code === "23P01") return { ok: false, motivo: "ocupada" };
    console.error("[agenda] no se pudo guardar la cita:", error.message);
    return { ok: false, motivo: "error" };
  }
  return { ok: true, cita: data as unknown as Cita };
}

// ——— Fotos del daño ———

/** Lo que llega tiene que ser un JPEG de verdad: se mira la firma del archivo, no el nombre. */
export function esFotoValida(bytes: Uint8Array): boolean {
  return bytes.length > 3 && bytes.length <= MAX_BYTES_FOTO && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

/**
 * Sube las fotos de una cita al espacio privado y las anota en la cita.
 * Devuelve las rutas que quedaron guardadas (si una falla, sigue con las otras:
 * la hora ya esta reservada y las fotos son un extra).
 */
export async function guardarFotos(id: string, fotos: Uint8Array[]): Promise<string[]> {
  const db = supabase();
  if (!db || !ES_UUID.test(id)) return [];

  const rutas: string[] = [];
  for (const [i, foto] of fotos.slice(0, MAX_FOTOS).entries()) {
    const ruta = `${id}/${i + 1}.jpg`;
    const { error } = await db.storage.from(ESPACIO_FOTOS).upload(ruta, foto, { contentType: "image/jpeg", upsert: false });
    if (error) console.error("[agenda] no se pudo subir una foto:", error.message);
    else rutas.push(ruta);
  }
  if (rutas.length) {
    const { error } = await db.from("citas").update({ fotos: rutas }).eq("id", id);
    if (error) console.error("[agenda] no se pudieron anotar las fotos:", error.message);
  }
  return rutas;
}

/** Enlaces para ver las fotos desde el panel. Vencen en una hora. */
export async function enlacesDeFotos(rutas: string[]): Promise<Map<string, string>> {
  const db = supabase();
  const enlaces = new Map<string, string>();
  if (!db || !rutas.length) return enlaces;
  const { data, error } = await db.storage.from(ESPACIO_FOTOS).createSignedUrls(rutas, 3600);
  if (error) console.error("[agenda] no se pudieron firmar las fotos:", error.message);
  for (const f of data ?? []) if (f.path && f.signedUrl) enlaces.set(f.path, f.signedUrl);
  return enlaces;
}

/**
 * Borra las fotos de las citas que ya pasaron hace mas de DIAS_GUARDAR_FOTOS.
 * La cita queda; solo se vacian sus fotos. Asi el espacio gratis (1 GB) no se
 * llena, y no se guardan datos de clientes mas tiempo del necesario.
 */
export async function borrarFotosViejas(): Promise<number> {
  const db = supabase();
  if (!db) return 0;
  const limite = sumarDias(hoyEnChile(), -DIAS_GUARDAR_FOTOS);
  const { data, error } = await db.from("citas").select("id, fotos").lt("fecha", limite).neq("fotos", "{}").limit(200);
  if (error || !data?.length) return 0;

  const viejas = data as { id: string; fotos: string[] }[];
  const borradas = await db.storage.from(ESPACIO_FOTOS).remove(viejas.flatMap((c) => c.fotos));
  if (borradas.error) {
    console.error("[agenda] no se pudieron borrar fotos viejas:", borradas.error.message);
    return 0;
  }
  await db.from("citas").update({ fotos: [] }).in("id", viejas.map((c) => c.id));
  return viejas.length;
}

// ——— Panel ———

/** Agenda del panel: desde hoy en adelante, en orden. Incluye las canceladas. */
export async function listarAgenda(): Promise<Cita[] | null> {
  const db = supabase();
  if (!db) return null;
  const { data, error } = await db
    .from("citas")
    .select(COLUMNAS)
    .gte("fecha", hoyEnChile())
    .order("inicio", { ascending: true })
    .limit(MAX_AGENDA);
  if (error) {
    console.error("[agenda] no se pudo leer la agenda:", error.message);
    return null;
  }
  return data as unknown as Cita[];
}

/** Horas confirmadas de hoy y los proximos 6 dias, para el tablero. */
export async function contarProximas(): Promise<number | null> {
  const db = supabase();
  if (!db) return null;
  const hoy = hoyEnChile();
  const { count, error } = await db
    .from("citas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "confirmada")
    .gte("fecha", hoy)
    .lte("fecha", sumarDias(hoy, 6));
  if (error) return null;
  return count ?? 0;
}

/**
 * Cancela una cita confirmada y la devuelve, para avisar por correo. La fila
 * queda (con estado cancelada): asi la hora se libera pero no se pierde el
 * registro de quien la habia tomado.
 */
export async function cancelarCita(id: string): Promise<Cita | null> {
  const db = supabase();
  if (!db || !ES_UUID.test(id)) return null;
  const { data, error } = await db
    .from("citas")
    .update({ estado: "cancelada", cancelada: new Date().toISOString() })
    .eq("id", id)
    .eq("estado", "confirmada")
    .select(COLUMNAS)
    .maybeSingle();
  if (error) {
    console.error("[agenda] no se pudo cancelar:", error.message);
    return null;
  }
  return (data ?? null) as unknown as Cita | null;
}

// ——— Recordatorio por WhatsApp ———

export async function obtenerCita(id: string): Promise<Cita | null> {
  const db = supabase();
  if (!db || !ES_UUID.test(id)) return null;
  const { data, error } = await db.from("citas").select(COLUMNAS).eq("id", id).maybeSingle();
  if (error) console.error("[agenda] no se pudo leer la cita:", error.message);
  return (data ?? null) as unknown as Cita | null;
}

/** Las horas confirmadas de un dia que todavia no reciben su recordatorio. */
export async function citasSinRecordatorio(fecha: string): Promise<Cita[]> {
  const db = supabase();
  if (!db || !esFecha(fecha)) return [];
  const { data, error } = await db
    .from("citas")
    .select(COLUMNAS)
    .eq("fecha", fecha)
    .eq("estado", "confirmada")
    .is("recordatorio", null)
    .order("inicio", { ascending: true })
    .limit(200);
  if (error) {
    console.error("[agenda] no se pudieron leer las horas de mañana:", error.message);
    return [];
  }
  return data as unknown as Cita[];
}

/** Anota que el recordatorio salio, con el id que le dio Meta. */
export async function anotarRecordatorio(id: string, idMeta: string): Promise<void> {
  const db = supabase();
  if (!db) return;
  const { error } = await db
    .from("citas")
    .update({ recordatorio: new Date().toISOString(), recordatorio_id: idMeta.slice(0, 200) })
    .eq("id", id);
  if (error) console.error("[agenda] no se pudo anotar el recordatorio:", error.message);
}

/** El cliente toco "Confirmo". Si ya lo habia tocado, queda la primera vez. */
export async function confirmarAsistencia(id: string): Promise<boolean> {
  const db = supabase();
  if (!db || !ES_UUID.test(id)) return false;
  const { error } = await db
    .from("citas")
    .update({ asistencia_confirmada: new Date().toISOString() })
    .eq("id", id)
    .eq("estado", "confirmada")
    .is("asistencia_confirmada", null);
  if (error) console.error("[agenda] no se pudo confirmar la asistencia:", error.message);
  return !error;
}

export type Bloqueo = { fecha: string; motivo: string | null };

export async function listarBloqueos(): Promise<Bloqueo[] | null> {
  const db = supabase();
  if (!db) return null;
  const { data, error } = await db
    .from("agenda_bloqueos")
    .select("fecha, motivo")
    .gte("fecha", hoyEnChile())
    .order("fecha", { ascending: true })
    .limit(100);
  if (error) {
    console.error("[agenda] no se pudieron leer los bloqueos:", error.message);
    return null;
  }
  return data as Bloqueo[];
}

/** Cierra un dia completo. Las horas ya tomadas ese dia NO se cancelan solas. */
export async function bloquearDia(fecha: string, motivo: string): Promise<boolean> {
  const db = supabase();
  if (!db || !esFecha(fecha) || fecha < hoyEnChile()) return false;
  if (diaSemana(fecha) === 0) return false; // el domingo ya esta cerrado
  const { error } = await db
    .from("agenda_bloqueos")
    .upsert({ fecha, motivo: limpiarTexto(motivo, 80) || null }, { onConflict: "fecha" });
  if (error) console.error("[agenda] no se pudo bloquear:", error.message);
  return !error;
}

export async function desbloquearDia(fecha: string): Promise<boolean> {
  const db = supabase();
  if (!db || !esFecha(fecha)) return false;
  const { error } = await db.from("agenda_bloqueos").delete().eq("fecha", fecha);
  if (error) console.error("[agenda] no se pudo desbloquear:", error.message);
  return !error;
}
