import type { Metadata } from "next";
import { accesoLibre } from "@/lib/panel";

export const metadata: Metadata = {
  title: "Presupuestos",
  // Página de uso interno: nunca debe aparecer en buscadores
  robots: { index: false, follow: false, nocache: true },
};

export default function InternoLayout({ children }: { children: React.ReactNode }) {
  // Para no confundir el local con la web publicada, que sí pide clave
  return (
    <>
      {accesoLibre() && (
        <p className="font-display text-[12px] font-semibold text-center py-1.5" style={{ background: "#16181D", color: "#fff" }}>
          Local · sin clave
        </p>
      )}
      {children}
    </>
  );
}
