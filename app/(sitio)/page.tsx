"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import FormularioContacto from "@/components/FormularioContacto";
import Reveal from "@/components/anim/Reveal";
import Tilt from "@/components/anim/Tilt";
import CountUp from "@/components/anim/CountUp";
import { GOOGLE_MAPS_URL, FOTO_INICIO, FOTO_INICIO_ENCUADRE } from "@/lib/site";

const Icono = {
  barras: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 20V14M12 20V8M18 20V4" /></svg>,
  personas: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  mapa: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  llave: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
};

/** Los mismos numeros que tenia el sitio, ahora en la barra oscura */
const stats = [
  { n: "20+", l: "Años de experiencia", icono: Icono.barras },
  { n: "1.000+", l: "Clientes felices", icono: Icono.personas },
  { n: "4,7★", l: "De 5 en Google Maps", icono: Icono.mapa, href: GOOGLE_MAPS_URL },
  { n: "7+", l: "Servicios especializados", icono: Icono.llave },
];

/** Bordes de la barra: 2x2 en movil, 4 en fila desde lg */
const bordeConfianza = [
  "",
  "border-l",
  "border-t lg:border-t-0 lg:border-l",
  "border-l border-t lg:border-t-0",
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
/** El titulo es el elemento principal: visible desde el primer pintado (sin
 *  opacidad 0), para que no quede en blanco mientras carga el JavaScript. */
const heroTitulo = {
  hidden: { y: 18 },
  show: { y: 0, transition: { duration: 0.85, ease: [0.21, 0.65, 0.36, 1] as const } },
};
const heroItem = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.21, 0.65, 0.36, 1] as const } },
};

export default function Inicio() {
  return (
    <>
      {/* HERO: dos columnas, segun el mockup del cliente */}
      <section className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[min(calc(100vh_-_164px),720px)]" style={{ paddingTop: 76 }}>
        {/* Texto */}
        <div className="flex items-center px-5 sm:px-10 lg:px-12 py-14 sm:py-20" style={{ background: "#F1EFEA" }}>
          <motion.div variants={heroStagger} initial="hidden" animate="show" className="max-w-[600px]">
            <motion.p variants={heroItem} className="font-display text-[12px] sm:text-[13px] font-bold tracking-[2.5px] uppercase mb-5" style={{ color: "#D0021B" }}>
              La excelencia en Santiago
            </motion.p>
            {/* "Orgullo de conducir" mide 8,52 veces el tamaño de letra: los clamps
                salen del ancho de la columna / 8,6, para que no parta en 3 lineas. */}
            <motion.h1
              variants={heroTitulo}
              className="font-titular uppercase mb-6 text-[length:clamp(32px,calc(11.4vw_-_4px),64px)] lg:text-[length:clamp(44px,calc(5.8vw_-_11.5px),68px)]"
              style={{ fontWeight: 800, lineHeight: 0.98, color: "#16181D" }}
            >
              Restauramos el<br />orgullo de conducir
            </motion.h1>
            <motion.p variants={heroItem} className="text-[16px] sm:text-[17px] mb-8" style={{ color: "#4B5058", lineHeight: 1.65 }}>
              Pasión por la perfección, compromiso con la calidad. Más de 20 años de desabolladura y pintura profesional con tecnología europea.
            </motion.p>
            <motion.div variants={heroItem} className="flex flex-col sm:flex-row gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/servicios"
                  className="flex items-center justify-center font-display font-semibold text-[15px] px-7 py-4 rounded-lg"
                  style={{ background: "#D0021B", color: "#fff" }}
                >
                  Ver servicios
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/contacto"
                  className="flex items-center justify-center font-display font-semibold text-[15px] px-7 py-4 rounded-lg transition-colors hover:bg-[#16181D] hover:text-white"
                  style={{ border: "2px solid #16181D", color: "#16181D" }}
                >
                  Cotizar ahora
                </Link>
              </motion.div>
            </motion.div>
            <motion.p variants={heroItem} className="text-[13px] mt-5 leading-relaxed" style={{ color: "#6B7280" }}>
              Cotización sin costo · Respondemos en menos de 24 horas · Trabajamos con todas las aseguradoras del mercado
            </motion.p>
          </motion.div>
        </div>

        {/* Foto */}
        <div className="relative min-h-[300px] sm:min-h-[440px] lg:min-h-0 overflow-hidden" style={{ background: "#D9D2C3" }}>
          <motion.img
            src={FOTO_INICIO}
            alt="Auto deportivo blanco en el taller"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: FOTO_INICIO_ENCUADRE }}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
          />
        </div>
      </section>

      {/* NUMEROS: los mismos de antes, en la barra oscura del mockup */}
      <section style={{ background: "#16181D" }} aria-label="Santiago Garage en números">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const contenido = (
              <>
                <span className="mt-1 shrink-0" style={{ color: "#D0021B" }}>{s.icono}</span>
                <span>
                  <span className="block font-display font-bold text-[20px] sm:text-[22px] text-white leading-tight"><CountUp value={s.n} /></span>
                  <span className="block text-[12px] sm:text-[13px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>{s.l}</span>
                </span>
              </>
            );
            const clase = `flex items-start gap-3 px-5 sm:px-8 py-5 sm:py-6 border-white/10 ${bordeConfianza[i]}`;
            return s.href ? (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className={clase + " transition-colors hover:bg-white/5"}>{contenido}</a>
            ) : (
              <div key={i} className={clase}>{contenido}</div>
            );
          })}
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ background: "#F1EFEA" }}>
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <div className="mb-14 text-center">
              <h2 className="font-display font-bold uppercase" style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
                Por qué <span style={{ color: "#D0021B" }}>elegirnos</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {razones.map((r, i) => (
              <Reveal key={r.n} delay={(i % 2) * 0.12} y={50}>
                <Tilt className="h-full">
                  <div className="p-4 sm:p-9 rounded-xl sm:rounded-2xl h-full" style={{ background: r.destacado ? "#16181D" : "#fff", border: r.destacado ? "1px solid #16181D" : "1px solid #E8E6E1", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                      <span className="font-display font-bold text-[13px] sm:text-[15px]" style={{ color: "#D0021B" }}>{r.n}</span>
                      {r.destacado && (
                        <span className="font-display text-[9px] sm:text-[11px] font-semibold tracking-[1px] uppercase px-2 sm:px-3 py-0.5 sm:py-1 rounded-full" style={{ background: "#D0021B", color: "#fff" }}>
                          Diferencial
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-[16px] sm:text-[21px] mb-2 sm:mb-3" style={{ letterSpacing: "-0.5px", color: r.destacado ? "#fff" : "#16181D" }}>{r.t}</h3>
                    <p className="text-[12.5px] sm:text-[15px] leading-relaxed" style={{ color: r.destacado ? "rgba(255,255,255,0.65)" : "#6B7280" }}>{r.d}</p>
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
      <section className="px-5 sm:px-10 py-16 sm:py-24">
        <Reveal y={60}>
          <div className="max-w-[1200px] mx-auto rounded-3xl px-7 sm:px-14 py-12 sm:py-16 flex flex-col items-center text-center gap-7 sm:gap-9 relative overflow-hidden" style={{ background: "#16181D" }}>
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
