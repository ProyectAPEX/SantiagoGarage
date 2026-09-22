import type { Metadata } from "next";
import FormularioAcceso from "@/components/FormularioAcceso";

export const metadata: Metadata = { title: "Entrar" };

// Pantalla de clave. Aca llega quien abre el panel sin sesion (un marcador
// guardado, o la sesion de 7 dias que vencio). El proxy manda de vuelta al
// panel a quien ya tiene sesion.
export default function Entrar() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "#F1EFEA" }}>
      <div className="w-full max-w-[380px]">
        <FormularioAcceso />
      </div>
    </div>
  );
}
