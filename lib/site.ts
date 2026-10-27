// Datos de contacto centralizados — configurables vía variables de entorno
// (con fallback a los valores reales del taller para que el sitio nunca quede roto)

export const TELEFONO_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "56986111234";
export const TELEFONO_VISIBLE = process.env.NEXT_PUBLIC_WHATSAPP_VISIBLE ?? "+56 9 8611 1234";
/**
 * Correo publico del taller. A proposito NO sale de una variable de entorno:
 * es un dato publico que cambia muy de vez en cuando, y tenerlo aca evita que
 * el sitio publicado muestre uno viejo si la variable de Vercel queda atras.
 * Para cambiarlo, se cambia esta linea.
 */
export const EMAIL_CONTACTO = "cotizaciones.santiago@santiagogarage.cl";

/** Direccion del taller, para correos, invitaciones de calendario y mapas. */
export const DIRECCION = "Ureta Cox 1038, San Miguel, Santiago";
export const MAPS_URL = "https://maps.google.com/?q=Ureta+Cox+1038+San+Miguel+Santiago";

/** URL publica del sitio (los correos necesitan enlaces absolutos). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://santiagogarage.cl").replace(/\/$/, "");

export const WA_URL = `https://wa.me/${TELEFONO_WHATSAPP}`;

/**
 * Enlace de WhatsApp para el telefono de un cliente, como lo haya escrito:
 * "9 1234 5678" -> https://wa.me/56912345678. null si no parece un celular.
 */
export function enlaceWhatsApp(telefono: string): string | null {
  let n = telefono.replace(/\D/g, "");
  if (n.length === 8) n = "569" + n;
  else if (n.length === 9 && n.startsWith("9")) n = "56" + n;
  return n.length >= 10 ? `https://wa.me/${n}` : null;
}

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

/** Instagram del taller. Se usa en el footer y en el PDF del presupuesto. */
export const INSTAGRAM = "@santiagogarage.cl";
export const INSTAGRAM_URL = "https://www.instagram.com/santiagogarage.cl/";

/** Ficha del taller en Google Maps */
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Santiago+Garage+SPA+Desabolladura+Pintura+Automotriz+Ureta+Cox+1038+San+Miguel";

/** Foto del inicio (el Camaro blanco). El auto esta a la derecha de la foto. */
export const FOTO_INICIO = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80";
export const FOTO_INICIO_ENCUADRE = "70% center";
