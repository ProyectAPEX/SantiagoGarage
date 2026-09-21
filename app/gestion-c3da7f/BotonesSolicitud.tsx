"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { descartarSolicitud, reabrirSolicitud } from "./acciones";
import type { EstadoSolicitud } from "@/lib/solicitudes";

const boton =
  "font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg transition-opacity disabled:opacity-50";

/**
 * Descartar pide confirmacion dentro de la pagina, con un segundo toque.
 * Nunca confirm(): hay navegadores que lo bloquean sin avisar y el boton
 * queda muerto (ver Trampas conocidas).
 */
export default function BotonesSolicitud({ id, estado }: { id: string; estado: EstadoSolicitud }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(false);
  const [pendiente, iniciar] = useTransition();

  const ejecutar = (accion: (id: string) => Promise<boolean>) =>
    iniciar(async () => {
      const ok = await accion(id).catch(() => false);
      setConfirmando(false);
      if (ok) router.refresh();
      else setError(true);
    });

  if (error) {
    return <span className="text-[13px] font-medium" style={{ color: "#D0021B" }}>No se pudo guardar. Recarga e intenta de nuevo.</span>;
  }

  if (estado !== "nueva") {
    return (
      <button type="button" onClick={() => ejecutar(reabrirSolicitud)} disabled={pendiente} className={boton} style={{ color: "#6B7280", border: "1px solid #D5D2CC" }}>
        {pendiente ? "..." : "Volver a nuevas"}
      </button>
    );
  }

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className={boton} style={{ color: "#6B7280", border: "1px solid #D5D2CC" }}>
        Descartar
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button type="button" onClick={() => ejecutar(descartarSolicitud)} disabled={pendiente} className={boton} style={{ background: "#16181D", color: "#fff" }}>
        {pendiente ? "..." : "Sí, descartar"}
      </button>
      <button type="button" onClick={() => setConfirmando(false)} disabled={pendiente} className={boton} style={{ color: "#16181D" }}>
        No
      </button>
    </span>
  );
}
