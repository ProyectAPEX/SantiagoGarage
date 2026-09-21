import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presupuestos",
  // Página de uso interno: nunca debe aparecer en buscadores
  robots: { index: false, follow: false, nocache: true },
};

export default function InternoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
