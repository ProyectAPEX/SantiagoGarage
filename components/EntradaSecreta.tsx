"use client";
import { useEffect, useState } from "react";
import FormularioAcceso from "./FormularioAcceso";

// Entrada escondida al panel del dueño, como en Ulloa SNKR: el iconito de
// persona casi transparente del footer, o 5 toques seguidos al logo. Pide la
// clave ahi mismo, sin cambiar de pagina ni mostrar la ruta del panel.

const EVENTO = "sg:entrar";

export function abrirEntrada() {
  window.dispatchEvent(new Event(EVENTO));
}

/** Iconito de persona del footer, igual que en Ulloa: se ve solo si uno sabe que esta. */
export function BotonEntrada() {
  return (
    <button
      type="button"
      onClick={abrirEntrada}
      tabIndex={-1}
      aria-label="Panel del taller"
      className="p-2 -m-2 opacity-30 hover:opacity-60 transition-opacity"
      style={{ color: "#6B7280" }}
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
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
