"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cerrarDia, abrirDia } from "../acciones";
import { fechaLarga, diaSemana } from "@/lib/agenda";

const campo =
  "w-full rounded-xl px-4 py-3.5 text-[16px] outline-none border border-[#D5D2CC] bg-white text-[#16181D] focus:border-[#16181D] transition-colors";

/**
 * Cerrar un dia lo saca de la agenda publica. Las horas que ya estaban
 * tomadas ese dia siguen en pie: esas se cancelan una por una, para que a
 * cada cliente le llegue su aviso.
 */
export default function CerrarDia({
  bloqueos,
  minimo,
}: {
  bloqueos: { fecha: string; motivo: string | null }[];
  minimo: string;
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [pendiente, iniciar] = useTransition();

  function cerrar(e: React.FormEvent) {
    e.preventDefault();
    if (!fecha) return setError("Elige el día.");
    const dia = diaSemana(fecha);
    if (dia === 0 || dia === 6) return setError("Sábado y domingo ya están cerrados en la agenda.");
    setError("");
    iniciar(async () => {
      const ok = await cerrarDia(fecha, motivo).catch(() => false);
      if (!ok) return setError("No se pudo cerrar ese día. Intenta de nuevo.");
      setFecha("");
      setMotivo("");
      router.refresh();
    });
  }

  return (
    <div>
      <form onSubmit={cerrar} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3">
          <input type="date" className={campo} value={fecha} min={minimo} onChange={(e) => setFecha(e.target.value)} aria-label="Día a cerrar" />
          <input className={campo} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (solo lo ves tú)" maxLength={80} />
        </div>
        {error && (
          <p role="alert" className="text-[13px] font-medium" style={{ color: "#D0021B" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pendiente}
          className="self-start font-display font-semibold text-[14px] px-5 py-3 rounded-lg disabled:opacity-50"
          style={{ background: "#16181D", color: "#fff" }}
        >
          {pendiente ? "..." : "Cerrar ese día"}
        </button>
      </form>

      {bloqueos.length > 0 && (
        <ul className="list-none mt-4 flex flex-col">
          {bloqueos.map((b) => (
            <li key={b.fecha} className="flex items-center justify-between gap-3 py-3" style={{ borderTop: "1px solid #F0EEE9" }}>
              <span className="min-w-0">
                <span className="block font-display font-semibold text-[15px] capitalize" style={{ color: "#16181D" }}>
                  {fechaLarga(b.fecha)}
                </span>
                {b.motivo && <span className="block text-[13px] truncate" style={{ color: "#6B7280" }}>{b.motivo}</span>}
              </span>
              <button
                type="button"
                disabled={pendiente}
                onClick={() =>
                  iniciar(async () => {
                    await abrirDia(b.fecha).catch(() => false);
                    router.refresh();
                  })
                }
                className="font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg shrink-0 disabled:opacity-50"
                style={{ color: "#16181D", border: "1px solid #E8E6E1" }}
              >
                Abrir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
