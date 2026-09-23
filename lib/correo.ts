import "server-only";
import nodemailer from "nodemailer";

/**
 * Envio del presupuesto por correo, desde el buzon del propio taller
 * (cotizaciones.santiago@santiagogarage.cl, en el hosting antiguo).
 *
 * Se manda por el mismo servidor que ya recibe el correo del dominio, que es
 * el que el SPF autoriza: asi no hay que tocar los registros DNS del correo,
 * que si se rompen dejan al taller sin mail.
 */

const MAX_ADJUNTO = 4 * 1024 * 1024; // 4 MB de PDF es muchisimo para un presupuesto

export function correoConfigurado(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function transporte() {
  const puerto = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: puerto,
    secure: puerto === 465, // 465 va cifrado de entrada; 587 empieza en claro y sube a TLS
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
  });
}

export type CorreoPresupuesto = {
  para: string;
  nombreCliente: string;
  numero: string;
  total: string;
  pdfBase64: string;
  nombreArchivo: string;
};

/** Devuelve "" si salio bien, o el motivo de la falla para mostrarlo en el panel. */
export async function enviarPresupuestoPorCorreo(datos: CorreoPresupuesto): Promise<string> {
  if (!correoConfigurado()) return "El envío por correo no está configurado.";

  const pdf = Buffer.from(datos.pdfBase64, "base64");
  if (!pdf.length) return "El PDF llegó vacío.";
  if (pdf.length > MAX_ADJUNTO) return "El PDF pesa demasiado para enviarlo por correo.";

  const nombre = datos.nombreCliente.split(" ")[0] || "";
  const texto = [
    `Hola ${nombre},`,
    "",
    `Le adjuntamos la cotización N° ${datos.numero} de Santiago Garage por ${datos.total}.`,
    "",
    "Cualquier duda quedamos atentos.",
    "",
    "Santiago Garage · Desabolladura y pintura automotriz",
    "Ureta Cox 1038, San Miguel",
  ].join("\n");

  try {
    await transporte().sendMail({
      from: `Santiago Garage <${process.env.SMTP_USER}>`,
      to: datos.para,
      subject: `Cotización N° ${datos.numero} · Santiago Garage`,
      text: texto,
      attachments: [{ filename: datos.nombreArchivo, content: pdf, contentType: "application/pdf" }],
    });
    return "";
  } catch (e) {
    const motivo = e instanceof Error ? e.message : "desconocido";
    console.error("No se pudo enviar el correo:", motivo);
    // El motivo crudo puede traer datos del servidor: al panel va algo corto
    if (/auth/i.test(motivo)) return "El servidor de correo rechazó la clave.";
    if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(motivo)) return "No se pudo conectar al servidor de correo.";
    return "No se pudo enviar el correo. Intenta de nuevo.";
  }
}
