import "server-only";
import { variable } from "@/lib/variables";

/**
 * WhatsApp por la API oficial de Meta (Cloud API). Solo servidor: el token
 * da permiso para escribir a nombre del taller.
 *
 * Variables (todas en Vercel, ninguna NEXT_PUBLIC_):
 * - WHATSAPP_TOKEN: token permanente del usuario del sistema de Meta Business
 * - WHATSAPP_PHONE_ID: el id del numero en Meta (no es el numero en si)
 * - WHATSAPP_APP_SECRET: clave secreta de la app de Meta; con ella se
 *   comprueba que lo que llega a /api/whatsapp lo manda Meta de verdad
 * - WHATSAPP_VERIFICAR: palabra que inventamos nosotros y se pega en Meta al
 *   conectar el webhook
 * - Opcionales: WHATSAPP_PLANTILLA (recordatorio_hora), WHATSAPP_IDIOMA (es),
 *   WHATSAPP_VERSION (de la API de Meta, v23.0)
 *
 * Sin token ni numero, nada de esto hace nada: la agenda funciona igual.
 */

export function whatsappConfigurado(): boolean {
  return Boolean(variable("WHATSAPP_TOKEN") && variable("WHATSAPP_PHONE_ID"));
}

const version = () => variable("WHATSAPP_VERSION") || "v23.0";

/** Manda un mensaje. Devuelve el id que le da Meta, o null si no salio. */
async function enviar(cuerpo: Record<string, unknown>): Promise<string | null> {
  if (!whatsappConfigurado()) return null;
  try {
    const res = await fetch(`https://graph.facebook.com/${version()}/${variable("WHATSAPP_PHONE_ID")}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${variable("WHATSAPP_TOKEN")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", ...cuerpo }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("[whatsapp] Meta rechazó el envío:", res.status, JSON.stringify(json?.error ?? json));
      return null;
    }
    return json?.messages?.[0]?.id ?? null;
  } catch (e) {
    console.error("[whatsapp] no se pudo conectar con Meta:", e instanceof Error ? e.message : e);
    return null;
  }
}

export type DatosRecordatorio = {
  /** Telefono en formato de WhatsApp: 56912345678 */
  para: string;
  nombre: string;
  /** "martes 3 de noviembre" */
  dia: string;
  /** "10:30" */
  hora: string;
  citaId: string;
};

/** WhatsApp no acepta saltos de linea ni tabulaciones dentro de una variable de plantilla. */
const parametro = (texto: string) => texto.replace(/[\r\n\t]+/g, " ").replace(/ {4,}/g, " ").trim();

/**
 * El recordatorio, armado sobre la plantilla aprobada por Meta:
 *
 *   Hola {{1}}. Este es un recordatorio de tu hora en Santiago Garage,
 *   programada para el {{2}} a las {{3}}, en Ureta Cox 1038, San Miguel.
 *   Puedes comunicarte al +56 9 8611 1234 si necesitas ayuda.
 *   [Confirmo] [Cancelar]
 *
 * Cada boton lleva escondido que hora es (confirmar:<id> / cancelar:<id>):
 * cuando el cliente lo toca, Meta nos lo devuelve tal cual.
 */
export function cuerpoRecordatorio(d: DatosRecordatorio) {
  return {
    to: d.para,
    type: "template",
    template: {
      name: variable("WHATSAPP_PLANTILLA") || "recordatorio_hora",
      language: { code: variable("WHATSAPP_IDIOMA") || "es" },
      components: [
        { type: "body", parameters: [d.nombre, d.dia, d.hora].map((text) => ({ type: "text", text: parametro(text) })) },
        { type: "button", sub_type: "quick_reply", index: "0", parameters: [{ type: "payload", payload: `confirmar:${d.citaId}` }] },
        { type: "button", sub_type: "quick_reply", index: "1", parameters: [{ type: "payload", payload: `cancelar:${d.citaId}` }] },
      ],
    },
  };
}

export const enviarRecordatorio = (d: DatosRecordatorio) => enviar(cuerpoRecordatorio(d));

/**
 * Texto libre. Solo se puede mandar dentro de las 24 horas desde que el
 * cliente nos escribio (tocar un boton cuenta): fuera de eso Meta lo rechaza.
 */
export const enviarTexto = (para: string, texto: string) =>
  enviar({ to: para, type: "text", text: { body: texto, preview_url: false } });

// ——— Lo que llega de Meta ———

const enc = new TextEncoder();

function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Meta firma cada aviso con la clave secreta de la app:
 * X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(clave, cuerpo tal cual llego).
 * Sin clave configurada se rechaza todo: nunca se abre por defecto.
 */
export async function firmaDeMetaValida(cuerpo: string, firma: string | null): Promise<boolean> {
  const secreto = variable("WHATSAPP_APP_SECRET");
  if (!secreto || !firma?.startsWith("sha256=")) return false;
  const llave = await crypto.subtle.importKey("raw", enc.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", llave, enc.encode(cuerpo)));
  const hex = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  return iguales(hex, firma.slice("sha256=".length).toLowerCase());
}

/** La palabra que Meta manda una vez para comprobar que el webhook es nuestro. */
export function verificacionValida(modo: string | null, palabra: string | null): boolean {
  const esperada = variable("WHATSAPP_VERIFICAR");
  return modo === "subscribe" && Boolean(esperada) && palabra !== null && iguales(palabra, esperada);
}
