import { HORARIO } from "@/lib/site";

/**
 * Reglas de la agenda publica. Todo lo que el taller quiera mover (tipos,
 * franjas, cupos, feriados) se cambia en este archivo y en ningun otro.
 *
 * Lo usan el navegador (para dibujar) y el servidor (que es el que manda:
 * vuelve a revisar todo antes de guardar una hora).
 */

export type TipoCita = "particular" | "aseguradora" | "presupuesto";

export type ReglaTipo = {
  id: TipoCita;
  nombre: string;
  bajada: string;
  /** Cuanto dura la atencion, en minutos. Tambien es el paso entre horas. */
  duracion: number;
  /** Dias en que se puede agendar: 1 = lunes … 5 = viernes */
  dias: number[];
  /** Franja en que la atencion empieza y termina, "HH:MM" en hora de Chile */
  desde: string;
  hasta: string;
  /** Tope de horas de este tipo en un mismo dia. null = sin tope */
  cupoDiario: number | null;
};

/**
 * Orden de prioridad que pidio el taller: particular > presupuesto >
 * aseguradora. El particular puede tomar cualquier hora de la semana; el
 * presupuesto, solo las tardes; la aseguradora, solo las mañanas de los dias
 * mas tranquilos (lunes y martes).
 */
export const TIPOS: ReglaTipo[] = [
  {
    id: "particular",
    nombre: "Reparación particular",
    bajada: "El trabajo lo pagas tú, sin seguro de por medio",
    duracion: 60,
    dias: [1, 2, 3, 4, 5],
    desde: HORARIO.semana.abre,
    hasta: HORARIO.semana.cierra,
    cupoDiario: null,
  },
  {
    id: "aseguradora",
    nombre: "Siniestro con aseguradora",
    bajada: "Tu compañía de seguros cubre la reparación",
    duracion: 60,
    dias: [1, 2],
    desde: HORARIO.semana.abre,
    hasta: "12:30",
    cupoDiario: 2,
  },
  {
    id: "presupuesto",
    nombre: "Evaluación y presupuesto",
    bajada: "Revisamos el daño y te cotizamos en el taller",
    duracion: 30,
    dias: [1, 2, 3, 4, 5],
    desde: "15:30",
    hasta: HORARIO.semana.cierra,
    cupoDiario: 3,
  },
];

/** Hasta cuantos dias hacia adelante se puede agendar. Desde mañana: hoy no. */
export const DIAS_ADELANTE = 30;

/**
 * Feriados de Chile en dia de semana (los de fin de semana no importan: esos
 * dias no se agenda). Revisar cada diciembre. Para cerrar un dia puntual
 * (vacaciones, un imprevisto) no hace falta tocar esto: se bloquea desde el
 * panel, en Agenda.
 */
export const FERIADOS = new Set([
  "2026-12-08", // Inmaculada Concepción
  "2026-12-25", // Navidad
  "2027-01-01", // Año Nuevo
  "2027-03-26", // Viernes Santo
  "2027-05-21", // Glorias Navales
  "2027-06-21", // Pueblos Indígenas
  "2027-06-28", // San Pedro y San Pablo (trasladado)
  "2027-07-16", // Virgen del Carmen
  "2027-10-11", // Encuentro de Dos Mundos (trasladado)
  "2027-11-01", // Todos los Santos
  "2027-12-08", // Inmaculada Concepción
]);

export const ZONA = "America/Santiago";

export function regla(tipo: TipoCita): ReglaTipo {
  return TIPOS.find((t) => t.id === tipo) ?? TIPOS[0];
}

export function esTipo(valor: unknown): valor is TipoCita {
  return typeof valor === "string" && TIPOS.some((t) => t.id === valor);
}

// ——— Fechas y horas ———
// Las fechas viajan como "AAAA-MM-DD" y las horas como "HH:MM", siempre en
// hora de Chile. Solo se pasan a un instante real (UTC) para guardar la cita y
// para la invitacion de calendario.

export function minutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** Hora en que termina una atencion que empieza a `hora`. */
export function horaFin(tipo: TipoCita, hora: string): string {
  return hhmm(minutos(hora) + regla(tipo).duracion);
}

/** Hoy, en Chile. El servidor corre en UTC: a las 22:00 de Chile alla ya es mañana. */
export function hoyEnChile(ahora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
}

export function sumarDias(fecha: string, n: number): string {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sabado */
export function diaSemana(fecha: string): number {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

export function esFecha(valor: unknown): valor is string {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  return sumarDias(valor, 0) === valor; // descarta 2026-02-31 y compañia
}

/** Desfase de Chile respecto de UTC en ese instante, en minutos (-180 o -240). */
function desfaseChile(instante: Date): number {
  const nombre =
    new Intl.DateTimeFormat("en-US", { timeZone: ZONA, timeZoneName: "shortOffset" })
      .formatToParts(instante)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = nombre.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const total = Number(m[2]) * 60 + Number(m[3] ?? 0);
  return m[1] === "-" ? -total : total;
}

/**
 * Instante real de una fecha y hora de Chile. Se calcula con el desfase de
 * ESE dia, no con uno fijo: Chile cambia de hora dos veces al año y una cita
 * de abril no tiene el mismo desfase que una de octubre.
 */
export function instanteChile(fecha: string, hora: string): Date {
  const [a, me, d] = fecha.split("-").map(Number);
  const [h, mi] = hora.split(":").map(Number);
  const ingenuo = Date.UTC(a, me - 1, d, h, mi);
  let t = ingenuo - desfaseChile(new Date(ingenuo)) * 60_000;
  t = ingenuo - desfaseChile(new Date(t)) * 60_000; // segunda pasada, por si cae justo en el cambio
  return new Date(t);
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-10-28" -> "miércoles 28 de octubre" */
export function fechaLarga(fecha: string): string {
  const [, m, d] = fecha.split("-").map(Number);
  return `${DIAS[diaSemana(fecha)]} ${d} de ${MESES[m - 1]}`;
}

export function nombreMes(mes: number): string {
  return MESES[mes - 1];
}

// ——— Disponibilidad ———

/** Una hora ya tomada, como instantes en milisegundos. */
export type Ocupada = { tipo: TipoCita; inicio: number; fin: number };

export type DiaAgenda = { fecha: string; horas: string[] };

/**
 * Horas de inicio libres para un tipo en un dia. `ocupadas` son las citas
 * confirmadas de ese mismo dia, de cualquier tipo: el taller atiende una a la
 * vez, asi que una hora tomada no la puede usar nadie mas.
 */
export function horasLibres(tipo: TipoCita, fecha: string, ocupadas: Ocupada[]): string[] {
  const r = regla(tipo);
  if (!r.dias.includes(diaSemana(fecha))) return [];
  if (r.cupoDiario !== null && ocupadas.filter((o) => o.tipo === tipo).length >= r.cupoDiario) return [];

  const libres: string[] = [];
  for (let m = minutos(r.desde); m + r.duracion <= minutos(r.hasta); m += r.duracion) {
    const hora = hhmm(m);
    const inicio = instanteChile(fecha, hora).getTime();
    const fin = inicio + r.duracion * 60_000;
    if (!ocupadas.some((o) => o.inicio < fin && inicio < o.fin)) libres.push(hora);
  }
  return libres;
}

/** Primer y ultimo dia que se puede agendar, contando desde hoy en Chile. */
export function rangoAgendable(ahora = new Date()): { desde: string; hasta: string } {
  const hoy = hoyEnChile(ahora);
  return { desde: sumarDias(hoy, 1), hasta: sumarDias(hoy, DIAS_ADELANTE) };
}

/**
 * Los dias de lunes a viernes del rango, con sus horas libres. Un dia sin
 * horas puede ser feriado, estar bloqueado, no corresponder al tipo o estar
 * lleno: para quien agenda es lo mismo, no se puede.
 */
export function agendaDelTipo(
  tipo: TipoCita,
  rango: { desde: string; hasta: string },
  ocupadasPorDia: Map<string, Ocupada[]>,
  bloqueados: Set<string>
): DiaAgenda[] {
  const dias: DiaAgenda[] = [];
  for (let f = rango.desde; f <= rango.hasta; f = sumarDias(f, 1)) {
    const dia = diaSemana(f);
    if (dia === 0 || dia === 6) continue;
    const cerrado = FERIADOS.has(f) || bloqueados.has(f);
    dias.push({ fecha: f, horas: cerrado ? [] : horasLibres(tipo, f, ocupadasPorDia.get(f) ?? []) });
  }
  return dias;
}

/** Bajada de la agenda: la usan el inicio y /agendar. */
export const TEXTO_AGENDA =
  "Elige qué necesita tu auto y la hora que más te acomode, de lunes a viernes. Te llega la confirmación al correo.";

// ——— Fotos del daño ———
// Se achican en el navegador antes de subir: una foto de celular pesa 3-5 MB
// y Vercel no acepta envios de mas de 4,5 MB. Achicadas quedan en ~300 KB.

export const MAX_FOTOS = 5;
/** Lado mas largo de la foto achicada, en pixeles: sobra para ver un choque. */
export const LADO_FOTO = 1600;
/** Tope por foto ya achicada. El espacio de Supabase tambien lo exige (2 MB). */
export const MAX_BYTES_FOTO = 1_500_000;
/** Despues de esto se borran las fotos de una cita (la cita queda). */
export const DIAS_GUARDAR_FOTOS = 90;
