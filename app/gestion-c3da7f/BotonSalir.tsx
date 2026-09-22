"use client";
import { useState } from "react";

/** Cierra la sesion del panel y vuelve al sitio. */
export default function BotonSalir() {
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    await fetch("/api/acceso", { method: "DELETE" }).catch(() => null);
    // Carga completa y sin dejar el panel en el historial: "atras" no vuelve a el
    window.location.replace("/");
  }

  return (
    <button
      type="button"
      onClick={salir}
      disabled={saliendo}
      className="font-display font-semibold text-[14px] py-1 disabled:opacity-50"
      style={{ color: "#6B7280" }}
    >
      {saliendo ? "Saliendo..." : "Salir"}
    </button>
  );
}
