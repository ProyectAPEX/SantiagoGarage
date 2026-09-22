"use client";
import { useEffect, useState } from "react";
import FormularioAcceso from "./FormularioAcceso";

// Entrada escondida al panel del dueño, como en Ulloa SNKR: 5 toques seguidos
// al logo, o un toque al © del footer. Pide la clave ahi mismo, sin cambiar
// de pagina ni mostrar la ruta del panel.

const EVENTO = "sg:entrar";

export function abrirEntrada() {
  window.dispatchEvent(new Event(EVENTO));
}

/** El © del footer: a simple vista es texto, pero abre la entrada. */
export function CopyrightSecreto() {
  return (
    <button type="button" onClick={abrirEntrada} tabIndex={-1} aria-hidden="true" className="cursor-default" style={{ font: "inherit", color: "inherit" }}>
      ©
    </button>
  );
}

export default function EntradaSecreta() {
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    const abrir = () => setAbierta(true);
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  // Esc cierra, y la pagina de atras no se desplaza mientras esta abierta
  useEffect(() => {
    if (!abierta) return;
    const conEsc = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", conEsc);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", conEsc);
    };
  }, [abierta]);

  if (!abierta) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-acceso"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(22,24,29,0.72)" }}
      onClick={(e) => e.target === e.currentTarget && setAbierta(false)}
    >
      <div className="w-full max-w-[380px] rounded-2xl p-6 sm:p-7" style={{ background: "#F1EFEA" }}>
        <FormularioAcceso />
        <button
          type="button"
          onClick={() => setAbierta(false)}
          className="w-full mt-2 py-3 font-display font-semibold text-[14px]"
          style={{ color: "#6B7280" }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
