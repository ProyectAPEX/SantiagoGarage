import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Desabolladura de precisión, pintura al horno (PPG y Glasurit), reparación de plásticos, pulido, diagnóstico digital y gestión de siniestros en San Miguel, Santiago.",
  alternates: { canonical: "/servicios" },
};

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
