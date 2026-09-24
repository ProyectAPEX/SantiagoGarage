import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { EMAIL_CONTACTO, TELEFONO_VISIBLE, INSTAGRAM } from "@/lib/site";

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

/**
 * El logo viaja dentro del correo (adjunto en linea), no como enlace: los
 * correos que cargan imagenes de afuera quedan con el hueco gris hasta que el
 * cliente aprieta "mostrar imagenes".
 */
async function logoAdjunto() {
  try {
    const archivo = await readFile(path.join(process.cwd(), "public", "logo-nav.png"));
    return { filename: "santiago-garage.png", content: archivo, cid: "logo-taller", contentType: "image/png" };
  } catch {
    return null; // sin logo el correo sale igual, solo sin la imagen
  }
}

function cuerpoHtml(datos: CorreoPresupuesto, conLogo: boolean): string {
  const nombre = datos.nombreCliente.split(" ")[0] || "";
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#F1EFEA;font-family:Arial,Helvetica,sans-serif;color:#16181D">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E8E6E1">
    <tr><td style="padding:28px 28px 8px">
      ${conLogo ? `<img src="cid:logo-taller" alt="Santiago Garage" width="180" style="display:block;margin-bottom:18px">` : `<p style="font-size:20px;font-weight:bold;margin:0 0 18px">SANTIAGO GARAGE</p>`}
      <p style="font-size:16px;line-height:1.6;margin:0 0 14px">Hola ${nombre},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 14px">
        Le adjuntamos la cotización <strong>N° ${datos.numero}</strong> por <strong>${datos.total}</strong>.
        Va en el PDF de este correo.
      </p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 22px">Cualquier duda quedamos atentos.</p>
    </td></tr>
    <tr><td style="padding:0 28px 26px;border-top:1px solid #F0EEE9">
      <p style="font-size:13px;line-height:1.7;color:#6B7280;margin:16px 0 0">
        <strong style="color:#16181D">Santiago Garage</strong> · Desabolladura y pintura automotriz<br>
        Ureta Cox 1038, San Miguel · ${TELEFONO_VISIBLE}<br>
        santiagogarage.cl · Instagram ${INSTAGRAM}
      </p>
    </td></tr>
  </table>
</body></html>`;
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

  const logo = await logoAdjunto();

  try {
    const envio = await transporte().sendMail({
      from: `Santiago Garage <${process.env.SMTP_USER}>`,
      // El buzon de cotizaciones es solo para enviar: si el cliente responde,
      // la respuesta cae en el correo que el taller si revisa.
      replyTo: process.env.SMTP_RESPUESTAS || EMAIL_CONTACTO,
      to: datos.para,
      subject: `Cotización N° ${datos.numero} · Santiago Garage`,
      text: texto, // por si el correo del cliente no muestra HTML
      html: cuerpoHtml(datos, !!logo),
      attachments: [
        { filename: datos.nombreArchivo, content: pdf, contentType: "application/pdf" },
        ...(logo ? [{ ...logo, contentDisposition: "inline" as const }] : []),
      ],
    });
    // Queda anotado para poder rastrearlo con el hosting si el cliente dice que no le llegó
    console.log(`Correo aceptado por el servidor: ${envio.messageId} · ${envio.response} · a ${datos.para}`);
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
