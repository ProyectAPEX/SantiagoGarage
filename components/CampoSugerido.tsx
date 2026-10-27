"use client";
import { useId, useState } from "react";
import type { Sugerencia } from "@/lib/sugerencias";

/**
 * Campo de texto con sugerencias propias.
 *
 * No usa <datalist>: el del navegador se ve distinto en cada uno y en el
 * celular queda pésimo (ver Trampas conocidas). Sigue siendo texto libre; las
 * sugerencias solo ahorran tipeo.
 */
export default function CampoSugerido({
  id,
  valor,
  buscar,
  alEscribir,
  alElegir,
  placeholder,
  maxLength,
  className,
}: {
  id: string;
  valor: string;
  buscar: (texto: string) => Sugerencia[];
  alEscribir: (valor: string) => void;
  /** Por defecto escribe el texto elegido. El modelo ademas completa la marca. */
  alElegir?: (s: Sugerencia) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [indice, setIndice] = useState(-1);
  const listaId = useId();

  // Solo al escribir: entrar al campo no despliega nada
  const sugerencias = abierto && valor.trim() ? buscar(valor) : [];
  const visible = abierto && sugerencias.length > 0;

  function elegir(s: Sugerencia) {
    if (alElegir) alElegir(s);
    else alEscribir(s.texto);
    setAbierto(false);
    setIndice(-1);
  }

  function teclas(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!visible) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const paso = e.key === "ArrowDown" ? 1 : -1;
      const ultimo = sugerencias.length - 1;
      setIndice((i) => {
        const siguiente = i + paso;
        if (siguiente < 0) return ultimo;
        if (siguiente > ultimo) return 0;
        return siguiente;
      });
    } else if (e.key === "Enter" && indice >= 0) {
      e.preventDefault();
      elegir(sugerencias[indice]);
    } else if (e.key === "Escape") {
      setAbierto(false);
      setIndice(-1);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        className={className}
        value={valor}
        onChange={(e) => {
          alEscribir(e.target.value);
          setAbierto(true);
          setIndice(-1);
        }}
        onBlur={() => {
          setAbierto(false);
          setIndice(-1);
        }}
        onKeyDown={teclas}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        role="combobox"
        aria-expanded={visible}
        aria-controls={listaId}
        aria-autocomplete="list"
      />

      {visible && (
        <ul
          id={listaId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl overflow-hidden overflow-y-auto bg-white list-none"
          style={{ border: "1px solid #D5D2CC", boxShadow: "0 10px 30px rgba(22,24,29,0.12)", maxHeight: 264 }}
        >
          {sugerencias.map((s, i) => (
            <li key={`${s.texto}-${s.detalle ?? ""}`} role="option" aria-selected={i === indice}>
              <button
                type="button"
                // El clic no debe sacar el foco antes de tiempo: si no, se cierra la lista y no elige
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(s)}
                className="w-full text-left px-4 py-3 text-[16px] flex items-center justify-between gap-3"
                style={{ background: i === indice ? "#F1EFEA" : "#fff", color: "#16181D" }}
              >
                <span>{s.texto}</span>
                {s.detalle && <span className="text-[13px] shrink-0" style={{ color: "#9CA3AF" }}>{s.detalle}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
