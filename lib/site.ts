// Datos de contacto centralizados — configurables vía variables de entorno
// (con fallback a los valores reales del taller para que el sitio nunca quede roto)

export const TELEFONO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "56986111234";
export const TELEFONO_VISIBLE = process.env.NEXT_PUBLIC_WHATSAPP_VISIBLE ?? "+56 9 8611 1234";
export const EMAIL_CONTACTO = process.env.NEXT_PUBLIC_EMAIL ?? "info@santiagogarage.cl";

export const WA_URL = `https://wa.me/${TELEFONO_WHATSAPP}`;

/**
 * Ruta secreta del panel interno. Debe coincidir con el nombre de la carpeta
 * en app/. NUNCA se nombra en robots.txt: ese archivo es publico.
 */
export const RUTA_PANEL = "/gestion-c3da7f";
