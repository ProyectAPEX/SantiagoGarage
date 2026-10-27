import "server-only";

/**
 * Invitaciones de calendario (.ics, RFC 5545). Es el formato que entienden
 * Outlook, Google Calendar y el calendario del iPhone: el correo lo trae y con
 * un toque la hora queda guardada.
 *
 * - REQUEST: invitacion. Google Calendar y Outlook con cuenta Microsoft la
 *   ponen solas en el calendario, sin que nadie toque nada
 * - PUBLISH: "agrega este evento", con un toque. Para cuando el aviso le
 *   llega al mismo buzon que lo manda: una invitacion a uno mismo Outlook no
 *   la sabe mostrar
 * - CANCEL: borra el evento del calendario. Tiene que llevar el MISMO uid y
 *   una secuencia mayor que la original
 */

export type Persona = { nombre: string; email: string };

export type EventoCalendario = {
  uid: string;
  metodo: "REQUEST" | "PUBLISH" | "CANCEL";
  secuencia: number;
  inicio: Date;
  fin: Date;
  titulo: string;
  descripcion: string;
  lugar: string;
  organizador: Persona;
  asistentes?: Persona[];
  /** Recordatorio, en duracion ISO: "-P1D" = un dia antes, "-PT1H" = una hora antes */
  aviso?: string;
};

/** 2026-10-28T12:30:00.000Z -> 20261028T123000Z */
function utc(fecha: Date): string {
  return fecha.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Texto libre dentro del .ics: estos cuatro caracteres tienen significado propio. */
function texto(valor: string): string {
  return valor.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** El nombre va entre comillas en un parametro (CN="..."): no puede llevar comillas ni saltos. */
function nombre(valor: string): string {
  return valor.replace(/["\r\n]/g, "").trim() || "Cliente";
}

const codificador = new TextEncoder();

/**
 * Ninguna linea puede pasar de 75 bytes: las largas se cortan y siguen en la
 * proxima empezando con un espacio. Se cuentan bytes y no letras, porque una
 * "ñ" o una "é" ocupan dos.
 */
function plegar(linea: string): string {
  const partes: string[] = [];
  let actual = "";
  let bytes = 0;
  for (const ch of linea) {
    const largo = codificador.encode(ch).length;
    const limite = partes.length === 0 ? 75 : 74; // la continuacion ya gasta un byte en el espacio
    if (bytes + largo > limite) {
      partes.push(actual);
      actual = "";
      bytes = 0;
    }
    actual += ch;
    bytes += largo;
  }
  partes.push(actual);
  return partes.join("\r\n ");
}

export function crearIcs(e: EventoCalendario): string {
  const cancelada = e.metodo === "CANCEL";
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Santiago Garage//Agenda//ES",
    "CALSCALE:GREGORIAN",
    `METHOD:${e.metodo}`,
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${utc(new Date())}`,
    `SEQUENCE:${e.secuencia}`,
    `DTSTART:${utc(e.inicio)}`,
    `DTEND:${utc(e.fin)}`,
    `SUMMARY:${texto(e.titulo)}`,
    `DESCRIPTION:${texto(e.descripcion)}`,
    `LOCATION:${texto(e.lugar)}`,
    `STATUS:${cancelada ? "CANCELLED" : "CONFIRMED"}`,
    "TRANSP:OPAQUE",
    `ORGANIZER;CN="${nombre(e.organizador.nombre)}":mailto:${e.organizador.email}`,
  ];
  for (const a of e.asistentes ?? []) {
    lineas.push(`ATTENDEE;CN="${nombre(a.nombre)}";ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=FALSE:mailto:${a.email}`);
  }
  if (e.aviso && !cancelada) {
    lineas.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${texto(e.titulo)}`, `TRIGGER:${e.aviso}`, "END:VALARM");
  }
  lineas.push("END:VEVENT", "END:VCALENDAR");
  return lineas.map(plegar).join("\r\n") + "\r\n";
}
