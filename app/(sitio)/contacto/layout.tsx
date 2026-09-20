import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Cotización sin costo. Estamos en Ureta Cox 1038, San Miguel, Santiago. WhatsApp +56 9 8611 1234. Lun–Vie 8:00–18:00 · Sáb 9:00–14:00. Todos los medios de pago.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
