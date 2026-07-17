"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import FormularioContacto from "@/components/FormularioContacto";
import Reveal from "@/components/anim/Reveal";
import Tilt from "@/components/anim/Tilt";
import CountUp from "@/components/anim/CountUp";

const stats = [
  { n: "20+", l: "Años de experiencia" },
  { n: "100+", l: "Clientes felices" },
  { n: "4,5★", l: "De 5 estrellas" },
  { n: "6", l: "Servicios especializados" },
];

const razones = [
  { n: "01", t: "Horno de pintura profesional", d: "Contamos con horno de secado propio — algo que muy pocos talleres en Chile tienen. Acabado de fábrica real: pintura curada a temperatura controlada, más dura, más brillante y más duradera.", destacado: true },
  { n: "02", t: "Materiales de primer nivel", d: "Pinturas PPG y Glasurit, los mismos estándares que usan las fábricas europeas. Nada de marcas genéricas." },
  { n: "03", t: "Tecnología de fábrica", d: "Cabina presurizada, scanner ADAS y laboratorio computarizado de igualación de color." },
  { n: "04", t: "20 años de oficio", d: "Cientos de vehículos restaurados en Santiago, desde autos de diario hasta piezas de colección." },
  { n: "05", t: "Gestión con aseguradoras", d: "Coordinamos presupuestos y peritajes directamente con tu seguro. Tú no te preocupas de nada." },
  { n: "06", t: "Todos los medios de pago", d: "Débito, crédito, transferencia y efectivo. Paga como te acomode, incluso en cuotas con tu tarjeta.", destacado: true },
];

const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.21, 0.65, 0.36, 1] as const } },
};

export default function Inicio() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "92vh", paddingTop: 76 }}>
        {/* Fondo con zoom lento (Ken Burns) */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.55)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(22,24,29,0.35) 0%, rgba(22,24,29,0.55) 70%, #FAFAF8 100%)" }} />

        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="show"
          className="relative z-10 px-10 py-24 max-w-[880px] flex flex-col items-center text-center"
        >
          <motion.p variants={heroItem} className="font-display text-[14px] font-medium tracking-[3px] uppercase mb-6" style={{ color: "rgba(255,255,255,0.85)" }}>
            La excelencia en Santiago
          </motion.p>
          <motion.h1 variants={heroItem} className="font-display uppercase mb-7" style={{ fontSize: "clamp(46px,6.5vw,84px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-2px", color: "#fff" }}>
            Restauramos el<br />orgullo de conducir
          </motion.h1>
          <motion.p variants={heroItem} className="text-[18px] font-light mb-10 max-w-[560px]" style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
            Pasión por la perfección, compromiso con la calidad. Más de 20 años de desabolladura y pintura profesional con tecnología europea.
          </motion.p>
          <motion.div variants={heroItem} className="flex gap-4 items-center justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/servicios" className="font-display font-semibold text-[15px] px-8 py-4 rounded-full inline-block" style={{ background: "#D0021B", color: "#fff" }}>
                Ver servicios
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/contacto" className="font-display font-medium text-[15px] px-8 py-4 rounded-full inline-block transition-colors duration-300 hover:bg-white hover:text-black" style={{ border: "1px solid rgba(255,255,255,0.5)", color: "#fff" }}>
                Cotizar ahora
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
        </motion.div>
      </section>

      {/* STATS */}
      <div className="px-10 py-16">
        <div className="grid max-w-[1200px] mx-auto" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="px-8 py-2 text-center" style={{ borderLeft: i > 0 ? "1px solid #E8E6E1" : "none" }}>
                <div className="font-display font-bold text-[44px] leading-none mb-2" style={{ color: "#16181D" }}>
                  <CountUp value={s.n} />
                </div>
                <div className="text-[14px]" style={{ color: "#6B7280" }}>{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="px-10 py-20" style={{ background: "#F1EFEA" }}>
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <div className="mb-14 text-center">
              <h2 className="font-display font-bold uppercase" style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
                Por qué <span style={{ color: "#D0021B" }}>elegirnos</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
            {razones.map((r, i) => (
              <Reveal key={r.n} delay={(i % 2) * 0.12} y={50}>
                <Tilt className="h-full">
                  <div className="p-9 rounded-2xl h-full" style={{ background: r.destacado ? "#16181D" : "#fff", border: r.destacado ? "1px solid #16181D" : "1px solid #E8E6E1", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-display font-bold text-[15px]" style={{ color: "#D0021B" }}>{r.n}</span>
                      {r.destacado && (
                        <span className="font-display text-[11px] font-semibold tracking-[1px] uppercase px-3 py-1 rounded-full" style={{ background: "#D0021B", color: "#fff" }}>
                          Diferencial
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-[21px] mb-3" style={{ letterSpacing: "-0.5px", color: r.destacado ? "#fff" : "#16181D" }}>{r.t}</h3>
                    <p className="text-[15px] leading-relaxed" style={{ color: r.destacado ? "rgba(255,255,255,0.65)" : "#6B7280" }}>{r.d}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <FormularioContacto />

      {/* CTA */}
      <section className="px-10 py-24">
        <Reveal y={60}>
          <div className="max-w-[1200px] mx-auto rounded-3xl px-14 py-16 flex flex-col items-center text-center gap-9 relative overflow-hidden" style={{ background: "#16181D" }}>
            {/* Glow decorativo */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(208,2,27,0.25), transparent 70%)" }} />
            <div>
              <p className="font-display text-[13px] font-medium tracking-[3px] uppercase mb-4" style={{ color: "#D0021B" }}>
                ¿Tienes un siniestro o quieres un presupuesto?
              </p>
              <h2 className="font-display font-bold uppercase" style={{ fontSize: "clamp(30px,3.5vw,46px)", lineHeight: 1.15, letterSpacing: "-1px", color: "#fff" }}>
                Cotización <span style={{ color: "#D0021B" }}>gratis</span>
              </h2>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="shrink-0 relative z-10">
              <Link href="/contacto" className="font-display font-semibold text-[15px] px-8 py-4 rounded-full inline-block" style={{ background: "#fff", color: "#16181D" }}>
                Ir a contacto
              </Link>
            </motion.div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
