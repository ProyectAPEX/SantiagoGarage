import type { Metadata } from "next";
import Reveal from "@/components/anim/Reveal";
import AgendarHora from "@/components/AgendarHora";
import { TEXTO_AGENDA } from "@/lib/agenda";

export const metadata: Metadata = {
  title: "Agenda tu hora",
  description:
    "Agenda tu hora en Santiago Garage, San Miguel: reparación particular, siniestro con aseguradora o evaluación y presupuesto. Te llega la confirmación al correo.",
  alternates: { canonical: "/agendar" },
};

export default function Agendar() {
  return (
    <>
      <div className="px-5 sm:px-10 pb-10" style={{ paddingTop: 132 }}>
        <div className="max-w-[1000px] mx-auto">
          <Reveal y={30}>
            <p className="font-display text-[13px] font-medium tracking-[3px] uppercase mb-4" style={{ color: "#D0021B" }}>
              Santiago Garage
            </p>
            <h1 className="font-display font-bold uppercase mb-5" style={{ fontSize: "clamp(42px,5.5vw,72px)", lineHeight: 1.05, letterSpacing: "-2px" }}>
              Agenda tu hora
            </h1>
            <p className="text-[17px] font-light max-w-[560px]" style={{ color: "#6B7280", lineHeight: 1.7 }}>
              {TEXTO_AGENDA}
            </p>
          </Reveal>
        </div>
      </div>

      <section className="px-5 sm:px-10 pb-24">
        <div className="max-w-[1000px] mx-auto">
          <AgendarHora />
        </div>
      </section>
    </>
  );
}
