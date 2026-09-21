// Datos de contacto centralizados — configurables vía variables de entorno
// (con fallback a los valores reales del taller para que el sitio nunca quede roto)

export const TELEFONO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "56986111234";
export const TELEFONO_VISIBLE = process.env.NEXT_PUBLIC_WHATSAPP_VISIBLE ?? "+56 9 8611 1234";
export const EMAIL_CONTACTO = process.env.NEXT_PUBLIC_EMAIL ?? "info@santiagogarage.cl";

export const WA_URL = `https://wa.me/${TELEFONO_WHATSAPP}`;

/** Horario de atencion. Unico lugar donde se define: de aqui salen el pie,
 *  contacto, la descripcion para Google y los datos estructurados. */
export const HORARIO = {
  semana: { abre: "08:30", cierra: "18:30" }, // lunes a viernes
  sabado: { abre: "09:00", cierra: "14:00" },
} as const;

const sinCero = (t: string) => t.replace(/^0/, "");
export const HORARIO_VISIBLE =
  `Lun–Vie ${sinCero(HORARIO.semana.abre)}–${sinCero(HORARIO.semana.cierra)}` +
  ` · Sáb ${sinCero(HORARIO.sabado.abre)}–${sinCero(HORARIO.sabado.cierra)}`;

/**
 * Ruta secreta del panel interno. Debe coincidir con el nombre de la carpeta
 * en app/. NUNCA se nombra en robots.txt: ese archivo es publico.
 */
export const RUTA_PANEL = "/gestion-c3da7f";
