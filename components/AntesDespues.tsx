"use client";
import { useRef, useState, useCallback } from "react";
import Reveal from "@/components/anim/Reveal";

export default function AntesDespues() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) updateFromClientX(e.clientX);
  };
  const onPointerUp = () => { dragging.current = false; };

  return (
    <section className="px-10 py-20" style={{ background: "#F1EFEA" }}>
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <p className="font-display text-[13px] font-medium tracking-[3px] uppercase mb-4" style={{ color: "#D0021B" }}>
              Resultados reales
            </p>
            <h2 className="font-display font-bold uppercase" style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
              Antes y después
            </h2>
          </div>
        </Reveal>

        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl select-none cursor-ew-resize w-full"
          style={{ height: "min(72vh, 680px)", touchAction: "none", border: "1px solid #E8E6E1" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* DESPUÉS — capa base */}
          <img
            src="/despues.jpg"
            alt="Después de la reparación"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          {/* ANTES — capa superior recortada con clip-path (siempre alineada) */}
          <img
            src="/antes.jpg"
            alt="Antes de la reparación"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            draggable={false}
          />

          {/* Etiquetas */}
          <span className="absolute top-4 left-4 font-display font-semibold text-[12px] tracking-[1px] uppercase px-4 py-2 rounded-full pointer-events-none" style={{ background: "rgba(22,24,29,0.85)", color: "#fff", opacity: pos > 20 ? 1 : 0, transition: "opacity .3s" }}>
            Antes
          </span>
          <span className="absolute top-4 right-4 font-display font-semibold text-[12px] tracking-[1px] uppercase px-4 py-2 rounded-full pointer-events-none" style={{ background: "#D0021B", color: "#fff", opacity: pos < 80 ? 1 : 0, transition: "opacity .3s" }}>
            Después
          </span>

          {/* Línea + handle */}
          <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
            <div className="w-[3px] h-full mx-auto" style={{ background: "#fff", boxShadow: "0 0 12px rgba(0,0,0,0.4)" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
              <svg width="20" height="14" viewBox="0 0 24 14" fill="none" stroke="#16181D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 1L1 7l6 6M17 1l6 6-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <p className="text-center text-[14px] mt-8" style={{ color: "#6B7280" }}>
          Desliza para comparar — Range Rover Sport, reparación de frontal completa
        </p>
      </div>
    </section>
  );
}
