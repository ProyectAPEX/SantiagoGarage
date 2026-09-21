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

/** Llamar por telefono */
export const TEL_URL = `tel:+${TELEFONO_WHATSAPP}`;

/** Ficha del taller en Google Maps */
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Santiago+Garage+SPA+Desabolladura+Pintura+Automotriz+Ureta+Cox+1038+San+Miguel";

/** Foto del inicio (el Camaro blanco). El auto esta a la derecha de la foto. */
export const FOTO_INICIO = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80";
export const FOTO_INICIO_ENCUADRE = "70% center";
