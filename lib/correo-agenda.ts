import "server-only";
import { variable } from "@/lib/variables";
import { correoConfigurado, transporte, logoAdjunto } from "@/lib/correo";
import { crearIcs, type EventoCalendario } from "@/lib/ics";
import { regla, fechaLarga, horaFin } from "@/lib/agenda";
import type { Cita } from "@/lib/citas";
import { EMAIL_CONTACTO, TELEFONO_VISIBLE, WA_URL, INSTAGRAM, DIRECCION, GOOGLE_MAPS_URL, SITE_URL, enlaceWhatsApp } from "@/lib/site";

/**
 * Correos de la agenda: la confirmacion al cliente y el aviso al taller, los
 * dos con la invitacion de calendario adentro. Salen del mismo buzon que los
 * presupuestos.
 */

/**
 * A quien le llega el aviso de cada hora nueva. Por defecto, el correo del
 * taller. AGENDA_AVISO admite varios, separados por coma.
 */
function correosDelTaller(): string[] {
  return (variable("AGENDA_AVISO") || EMAIL_CONTACTO)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

/**
 * Los que reciben el aviso y NO son el buzon que lo manda. A ellos la hora
 * les llega como invitacion, y Google Calendar y Outlook con cuenta
 * Microsoft la ponen sola en el calendario. Si el aviso solo le llega al
 * buzon que lo manda, va como "agregar al calendario" (un toque).
 */
function invitadosDelTaller(): string[] {
  const remitente = variable("SMTP_USER").toLowerCase();
  return correosDelTaller().filter((c) => c.toLowerCase() !== remitente);
}

const metodoDelAviso = (): "REQUEST" | "PUBLISH" => (invitadosDelTaller().length ? "REQUEST" : "PUBLISH");

/** Lo que escribe el publico va dentro de HTML: nunca sin escapar. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function vehiculo(c: Cita): string {
  return [c.marca, c.modelo].filter(Boolean).join(" ");
}

/** Los datos del cliente como "Etiqueta: valor", solo los que vienen llenos. */
function datosDelCliente(c: Cita): string[] {
  const pares: [string, string | null][] = [
    ["Cliente", c.nombre],
    ["Teléfono", c.telefono],
    ["Correo", c.email],
    ["Vehículo", vehiculo(c) || null],
    ["Patente", c.patente],
    ["Aseguradora", c.aseguradora],
    ["N° de siniestro", c.siniestro],
    ["Observaciones", c.comentario],
  ];
  return pares.filter(([, v]) => v).map(([etiqueta, v]) => `${etiqueta}: ${v}`);
}

/** Mismo marco que el correo del presupuesto: tarjeta blanca sobre el gris del sitio. */
function marco(contenido: string, conLogo: boolean): string {
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#F1EFEA;font-family:Arial,Helvetica,sans-serif;color:#16181D">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E8E6E1">
    <tr><td style="padding:28px 28px 8px">
      ${conLogo ? `<img src="cid:logo-taller" alt="Santiago Garage" width="180" style="display:block;margin-bottom:18px">` : `<p style="font-size:20px;font-weight:bold;margin:0 0 18px">SANTIAGO GARAGE</p>`}
      ${contenido}
    </td></tr>
    <tr><td style="padding:0 28px 26px;border-top:1px solid #F0EEE9">
      <p style="font-size:13px;line-height:1.7;color:#6B7280;margin:16px 0 0">
        <strong style="color:#16181D">Santiago Garage</strong> · Desabolladura y pintura automotriz<br>
        ${escapar(DIRECCION)} · ${escapar(TELEFONO_VISIBLE)}<br>
        santiagogarage.cl · Instagram ${escapar(INSTAGRAM)}
      </p>
    </td></tr>
  </table>
</body></html>`;
}

/** Tabla de datos: etiqueta a la izquierda, valor (ya escapado) a la derecha. */
function tabla(filas: [string, string | null][]): string {
  const visibles = filas.filter(([, v]) => v);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;background:#F1EFEA;border-radius:10px">
    ${visibles
      .map(
        ([etiqueta, valor], i) => `<tr>
      <td style="padding:${i === 0 ? 14 : 6}px 0 ${i === visibles.length - 1 ? 14 : 6}px 16px;font-size:13px;color:#6B7280;white-space:nowrap;vertical-align:top">${etiqueta}</td>
      <td style="padding:${i === 0 ? 14 : 6}px 16px ${i === visibles.length - 1 ? 14 : 6}px 14px;font-size:15px;font-weight:bold;color:#16181D">${valor}</td>
    </tr>`
      )
      .join("")}
  </table>`;
}

function destacado(titulo: string, bajada: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px">
    <tr><td style="background:#fff;border:1px solid #E8E6E1;border-left:4px solid #D0021B;border-radius:8px;padding:14px 16px">
      <p style="font-size:16px;line-height:1.5;margin:0;font-weight:bold">${titulo}</p>
      <p style="font-size:14px;line-height:1.5;margin:6px 0 0;color:#4B5058">${bajada}</p>
    </td></tr>
  </table>`;
}

function evento(c: Cita, metodo: EventoCalendario["metodo"], paraTaller: boolean): string {
  const r = regla(c.tipo);
  const remitente = variable("SMTP_USER");
  const detalle = paraTaller
    ? [r.nombre, ...datosDelCliente(c)]
    : [
        `${r.nombre} en Santiago Garage.`,
        `Dirección: ${DIRECCION}`,
        `Si no puedes venir, avísanos por WhatsApp al ${TELEFONO_VISIBLE}.`,
      ];

  return crearIcs({
    // Un evento para el cliente y otro para el taller: dicen cosas distintas, y
    // si compartieran id un calendario que reciba los dos los mezclaria
    uid: paraTaller ? `${c.id}-taller@santiagogarage.cl` : `${c.id}@santiagogarage.cl`,
    metodo,
    secuencia: metodo === "CANCEL" ? 1 : 0,
    inicio: new Date(c.inicio),
    fin: new Date(c.fin),
    titulo: paraTaller
      ? [r.nombre, c.nombre, vehiculo(c)].filter(Boolean).join(" · ")
      : `Santiago Garage · ${r.nombre}`,
    descripcion: detalle.join("\n"),
    lugar: DIRECCION,
    organizador: { nombre: "Santiago Garage", email: remitente },
    asistentes: paraTaller
      ? invitadosDelTaller().map((email) => ({ nombre: "Santiago Garage", email }))
      : [{ nombre: c.nombre, email: c.email }],
    aviso: "-P1D", // un dia antes, al cliente y al taller
  });
}

type Logo = Awaited<ReturnType<typeof logoAdjunto>>;

async function enviar(opciones: {
  para: string;
  responderA: string;
  asunto: string;
  html: string;
  texto: string;
  ics: string;
  metodo: EventoCalendario["metodo"];
  logo: Logo;
  /** Fotos del daño, solo en el aviso al taller */
  fotos?: Uint8Array[];
  quien: string;
}): Promise<boolean> {
  const { logo, fotos = [] } = opciones;
  try {
    const envio = await transporte().sendMail({
      from: `Santiago Garage <${variable("SMTP_USER")}>`,
      replyTo: opciones.responderA,
      to: opciones.para,
      subject: opciones.asunto,
      text: opciones.texto,
      html: opciones.html,
      // Nodemailer la manda dos veces: como invitacion (la que Outlook muestra
      // con botones) y como archivo adjunto, para el correo que no la reconoce
      icalEvent: { method: opciones.metodo, filename: "hora-santiago-garage.ics", content: opciones.ics },
      attachments: [
        ...(logo ? [{ ...logo, contentDisposition: "inline" as const }] : []),
        ...fotos.map((foto, i) => ({ filename: `foto-${i + 1}.jpg`, content: Buffer.from(foto), contentType: "image/jpeg" })),
      ],
    });
    console.log(`[agenda] correo ${opciones.quien} aceptado: ${envio.messageId} · ${envio.response}`);
    return true;
  } catch (e) {
    console.error(`[agenda] no se pudo enviar el correo ${opciones.quien}:`, e instanceof Error ? e.message : e);
    return false;
  }
}

/**
 * Confirmacion al cliente y aviso al taller. Las fotos del daño van adjuntas
 * en el aviso al taller. Devuelve si salio cada uno.
 */
export async function avisarReserva(c: Cita, fotos: Uint8Array[] = []): Promise<{ cliente: boolean; taller: boolean }> {
  if (!correoConfigurado()) {
    console.error("[agenda] correo sin configurar: la cita", c.id, "quedó guardada sin aviso");
    return { cliente: false, taller: false };
  }

  const r = regla(c.tipo);
  const dia = fechaLarga(c.fecha);
  const horario = `${c.hora} a ${horaFin(c.tipo, c.hora)}`;
  const logo = await logoAdjunto();
  const conLogo = Boolean(logo);
  const nombre = c.nombre.split(" ")[0] || c.nombre;
  const wa = enlaceWhatsApp(c.telefono);

  // ——— Al cliente ———
  const htmlCliente = marco(
    `<p style="font-size:16px;line-height:1.6;margin:0 0 14px">Hola ${escapar(nombre)},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Tu hora quedó reservada. Te esperamos en el taller.</p>
      ${tabla([
        ["Atención", escapar(r.nombre)],
        ["Día", escapar(mayuscula(dia))],
        ["Hora", escapar(horario)],
        ["Dónde", `<a href="${GOOGLE_MAPS_URL}" style="color:#16181D">${escapar(DIRECCION)}</a>`],
      ])}
      ${destacado(
        "Guarda la hora en tu calendario",
        "Este correo trae la invitación: tócala y la hora queda en tu calendario, con recordatorio."
      )}
      <p style="font-size:15px;line-height:1.6;margin:0 0 22px;color:#4B5058">
        Si no puedes venir, avísanos por <a href="${WA_URL}" style="color:#D0021B">WhatsApp al ${escapar(TELEFONO_VISIBLE)}</a>
        o respondiendo este correo, así le damos la hora a otra persona.
      </p>`,
    conLogo
  );
  const textoCliente = [
    `Hola ${nombre},`,
    "",
    "Tu hora quedó reservada. Te esperamos en el taller.",
    "",
    `Atención: ${r.nombre}`,
    `Día: ${mayuscula(dia)}`,
    `Hora: ${horario}`,
    `Dónde: ${DIRECCION}`,
    `Cómo llegar: ${GOOGLE_MAPS_URL}`,
    "",
    "Este correo trae la invitación de calendario: ábrela para guardar la hora.",
    `Si no puedes venir, avísanos por WhatsApp al ${TELEFONO_VISIBLE} o respondiendo este correo.`,
    "",
    "Santiago Garage · Desabolladura y pintura automotriz",
  ].join("\n");

  // ——— Al taller ———
  const calendarioTaller =
    metodoDelAviso() === "REQUEST"
      ? {
          titulo: "Ya está en tu calendario",
          bajada:
            "La hora llega como invitación: Google Calendar y Outlook la agregan solos. Si no aparece, abre la invitación (hora-santiago-garage.ics) y acéptala. Si respondes este correo, le llega al cliente.",
        }
      : {
          titulo: "Agrégala a tu calendario de Outlook",
          bajada:
            "Abre la invitación que viene en este correo (hora-santiago-garage.ics) y queda en tu calendario con todos los datos. Si respondes este correo, le llega al cliente.",
        };
  const htmlTaller = marco(
    `<p style="font-size:13px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#D0021B;margin:0 0 8px">Nueva hora desde la web</p>
      <p style="font-size:20px;line-height:1.35;font-weight:bold;margin:0 0 16px">${escapar(mayuscula(dia))}, ${escapar(horario)}</p>
      ${tabla([
        ["Atención", escapar(r.nombre)],
        ["Cliente", escapar(c.nombre)],
        ["Teléfono", wa ? `<a href="${wa}" style="color:#16181D">${escapar(c.telefono)}</a>` : escapar(c.telefono)],
        ["Correo", `<a href="mailto:${escapar(c.email)}" style="color:#16181D">${escapar(c.email)}</a>`],
        ["Vehículo", vehiculo(c) ? escapar(vehiculo(c)) : null],
        ["Patente", c.patente ? escapar(c.patente) : null],
        ["Aseguradora", c.aseguradora ? escapar(c.aseguradora) : null],
        ["N° siniestro", c.siniestro ? escapar(c.siniestro) : null],
        ["Observaciones", c.comentario ? escapar(c.comentario) : null],
        ["Fotos", fotos.length ? `${fotos.length} adjunta${fotos.length === 1 ? "" : "s"} en este correo` : null],
      ])}
      ${destacado(calendarioTaller.titulo, calendarioTaller.bajada)}`,
    conLogo
  );
  const textoTaller = [
    "Nueva hora desde la web",
    "",
    `${mayuscula(dia)}, ${horario}`,
    `Atención: ${r.nombre}`,
    ...datosDelCliente(c),
    ...(fotos.length ? [`Fotos: ${fotos.length} adjunta${fotos.length === 1 ? "" : "s"} en este correo`] : []),
    "",
    calendarioTaller.bajada,
  ].join("\n");

  const [cliente, taller] = await Promise.all([
    enviar({
      para: c.email,
      responderA: variable("SMTP_RESPUESTAS") || EMAIL_CONTACTO,
      asunto: `Hora confirmada: ${dia}, ${c.hora} · Santiago Garage`,
      html: htmlCliente,
      texto: textoCliente,
      ics: evento(c, "REQUEST", false),
      metodo: "REQUEST",
      logo,
      quien: "al cliente",
    }),
    enviar({
      para: correosDelTaller().join(", "),
      responderA: c.email, // responder le escribe directo al cliente
      asunto: `Nueva hora: ${r.nombre} · ${c.nombre} · ${dia} ${c.hora}`,
      html: htmlTaller,
      texto: textoTaller,
      ics: evento(c, metodoDelAviso(), true),
      metodo: metodoDelAviso(),
      logo,
      fotos,
      quien: "al taller",
    }),
  ]);
  return { cliente, taller };
}

/** Avisa la cancelacion y saca la hora de los dos calendarios (mismo uid, METHOD:CANCEL). */
export async function avisarCancelacion(c: Cita): Promise<{ cliente: boolean; taller: boolean }> {
  if (!correoConfigurado()) return { cliente: false, taller: false };

  const r = regla(c.tipo);
  const dia = fechaLarga(c.fecha);
  const logo = await logoAdjunto();
  const conLogo = Boolean(logo);
  const nombre = c.nombre.split(" ")[0] || c.nombre;

  const htmlCliente = marco(
    `<p style="font-size:16px;line-height:1.6;margin:0 0 14px">Hola ${escapar(nombre)},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">
        Tu hora del <strong>${escapar(dia)} a las ${escapar(c.hora)}</strong> (${escapar(r.nombre)}) quedó cancelada.
      </p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 22px;color:#4B5058">
        Si quieres otra, puedes <a href="${SITE_URL}/agendar" style="color:#D0021B">agendar de nuevo aquí</a>
        o escribirnos por <a href="${WA_URL}" style="color:#D0021B">WhatsApp al ${escapar(TELEFONO_VISIBLE)}</a>.
      </p>`,
    conLogo
  );
  const textoCliente = [
    `Hola ${nombre},`,
    "",
    `Tu hora del ${dia} a las ${c.hora} (${r.nombre}) quedó cancelada.`,
    `Si quieres otra, agenda de nuevo en ${SITE_URL}/agendar o escríbenos por WhatsApp al ${TELEFONO_VISIBLE}.`,
    "",
    "Santiago Garage · Desabolladura y pintura automotriz",
  ].join("\n");

  const htmlTaller = marco(
    `<p style="font-size:13px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#D0021B;margin:0 0 8px">Hora cancelada</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">
        ${escapar(mayuscula(dia))} a las ${escapar(c.hora)} · ${escapar(r.nombre)} · ${escapar(c.nombre)}.
        Se le avisó al cliente y la hora volvió a quedar libre en la web.
      </p>`,
    conLogo
  );
  const textoTaller = `Hora cancelada: ${dia} a las ${c.hora} · ${r.nombre} · ${c.nombre}. Se le avisó al cliente.`;

  const [cliente, taller] = await Promise.all([
    enviar({
      para: c.email,
      responderA: variable("SMTP_RESPUESTAS") || EMAIL_CONTACTO,
      asunto: `Hora cancelada: ${dia}, ${c.hora} · Santiago Garage`,
      html: htmlCliente,
      texto: textoCliente,
      ics: evento(c, "CANCEL", false),
      metodo: "CANCEL",
      logo,
      quien: "de cancelación al cliente",
    }),
    enviar({
      para: correosDelTaller().join(", "),
      responderA: c.email,
      asunto: `Cancelada: ${r.nombre} · ${c.nombre} · ${dia} ${c.hora}`,
      html: htmlTaller,
      texto: textoTaller,
      ics: evento(c, "CANCEL", true),
      metodo: "CANCEL",
      logo,
      quien: "de cancelación al taller",
    }),
  ]);
  return { cliente, taller };
}
