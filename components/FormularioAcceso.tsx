"use client";
import { useState } from "react";
import Image from "next/image";

/**
 * Clave del panel del dueño. Se usa en la entrada escondida del sitio y en la
 * pantalla de clave del panel.
 *
 * No conoce la ruta del panel: el servidor la entrega recien despues de la
 * clave correcta. Asi la ruta no queda escrita en el JavaScript publico.
 */
export default function FormularioAcceso() {
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!clave || enviando) return;
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave }),
      });
      const datos = await res.json().catch(() => ({}));
      const destino = datos?.destino;
      if (res.ok && typeof destino === "string" && destino.startsWith("/") && !destino.startsWith("//")) {
        window.location.assign(destino);
        return; // queda en "Entrando..." hasta que carga el panel
      }
      setError(datos?.error ?? "No se pudo entrar. Intenta de nuevo.");
    } catch {
      setError("Sin conexión. Revisa internet e intenta de nuevo.");
    }
    setEnviando(false);
  }

  return (
    <div>
      <Image src="/logo-nav.png" alt="Santiago Garage" width={172} height={52} className="h-[44px] w-auto mb-6" />
      <p className="font-display text-[12px] font-bold tracking-[2px] uppercase mb-1" style={{ color: "#D0021B" }}>
        Uso interno
      </p>
      <h2 id="titulo-acceso" className="font-display font-bold uppercase text-[26px] leading-none mb-6" style={{ color: "#16181D", letterSpacing: "-0.5px" }}>
        Panel del taller
      </h2>

      <form onSubmit={entrar} className="flex flex-col gap-3">
        {/* Nombre fijo para que el celular ofrezca guardar la clave */}
        <input type="text" name="username" autoComplete="username" defaultValue="Santiago Garage" className="hidden" tabIndex={-1} aria-hidden="true" />
        <label htmlFor="clave-panel" className="font-display font-semibold text-[13px]" style={{ color: "#16181D" }}>
          Clave
        </label>
        <input
          id="clave-panel"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="w-full rounded-lg px-4 py-3.5 bg-white outline-none focus:border-[#16181D]"
          style={{ fontSize: 16, border: "1px solid #D5D2CC", color: "#16181D" }}
        />
        {error && (
          <p role="alert" className="text-[14px] font-medium" style={{ color: "#D0021B" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={enviando || !clave}
          className="font-display font-semibold text-[15px] py-4 rounded-lg mt-1 transition-opacity disabled:opacity-50"
          style={{ background: "#D0021B", color: "#fff" }}
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
