"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { borrarPresupuesto } from "../acciones";

/**
 * Borrar pide confirmacion dentro de la pagina, con un segundo toque.
 * Nunca confirm(): hay navegadores que lo bloquean sin avisar y el boton
 * queda muerto (ver Trampas conocidas).
 */
export default function BotonBorrar({ id, cliente }: { id: string; cliente: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(false);
  const [pendiente, iniciar] = useTransition();

  if (error) {
    return (
      <span className="text-[13px] font-medium" style={{ color: "#D0021B" }}>
        No se pudo borrar. Recarga e intenta de nuevo.
      </span>
    );
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg"
        style={{ color: "#6B7280" }}
      >
        Borrar
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Confirmar borrar el presupuesto de ${cliente}`}
        onClick={() =>
          iniciar(async () => {
            const ok = await borrarPresupuesto(id).catch(() => false);
            setConfirmando(false);
            if (ok) router.refresh();
            else setError(true);
          })
        }
        disabled={pendiente}
        className="font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg disabled:opacity-50"
        style={{ background: "#D0021B", color: "#fff" }}
      >
        {pendiente ? "..." : "Sí, borrar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        disabled={pendiente}
        className="font-display font-semibold text-[14px] px-3 py-2.5 rounded-lg"
        style={{ color: "#16181D" }}
      >
        No
      </button>
    </span>
  );
}
