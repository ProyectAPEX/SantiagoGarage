"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelarHora } from "../acciones";

/**
 * Cancelar pide un segundo toque dentro de la pagina. Nunca confirm(): hay
 * navegadores que lo bloquean sin avisar (ver Trampas conocidas).
 */
export default function BotonCancelarHora({ id, cliente }: { id: string; cliente: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [pendiente, iniciar] = useTransition();

  if (aviso) {
    return (
      <span className="text-[13px] font-medium" style={{ color: "#D0021B" }}>
        {aviso}
      </span>
    );
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg"
        style={{ color: "#6B7280", border: "1px solid #E8E6E1" }}
      >
        Cancelar hora
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-[13px]" style={{ color: "#6B7280" }}>
        Se le avisa por correo.
      </span>
      <button
        type="button"
        aria-label={`Confirmar cancelar la hora de ${cliente}`}
        onClick={() =>
          iniciar(async () => {
            const r = await cancelarHora(id).catch(() => ({ ok: false, correo: false }));
            setConfirmando(false);
            if (!r.ok) setAviso("No se pudo cancelar. Recarga e intenta de nuevo.");
            else if (!r.correo) setAviso("Cancelada, pero el correo al cliente no salió: avísale por WhatsApp.");
            router.refresh();
          })
        }
        disabled={pendiente}
        className="font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg disabled:opacity-50"
        style={{ background: "#D0021B", color: "#fff" }}
      >
        {pendiente ? "Cancelando..." : "Sí, cancelar"}
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
