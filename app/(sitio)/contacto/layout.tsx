import type { Metadata } from "next";
import { HORARIO_VISIBLE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    `Cotización sin costo. Estamos en Ureta Cox 1038, San Miguel, Santiago. WhatsApp +56 9 8611 1234. ${HORARIO_VISIBLE}. Todos los medios de pago.`,
  alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
