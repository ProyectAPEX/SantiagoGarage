"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import FormularioContacto from "@/components/FormularioContacto";
import Reveal from "@/components/anim/Reveal";
import Tilt from "@/components/anim/Tilt";
import {
  WA_COTIZAR_URL,
  GOOGLE_NOTA,
  GOOGLE_RESENAS,
  GOOGLE_MAPS_URL,
  FOTO_INICIO,
} from "@/lib/site";

const Icono = {
  estrella: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  barras: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 20V14M12 20V8M18 20V4" /></svg>,
  escudo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3z" /></svg>,
  garantia: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>,
};

/** Sin cantidad de reseñas real, se muestra solo la nota: no se inventa la cifra. */
const tituloResenas = GOOGLE_RESENAS
  ? `${GOOGLE_NOTA} · ${GOOGLE_RESENAS} reseñas`
  : `${GOOGLE_NOTA} en Google`;

const confianza = [
  { icono: Icono.estrella, titulo: tituloResenas, detalle: GOOGLE_RESENAS ? "en Google Maps" : "calificación de nuestros clientes", href: GOOGLE_MAPS_URL },
  { icono: Icono.barras, titulo: "+20 años", detalle: "de experiencia en Santiago" },
  { icono: Icono.escudo, titulo: "Todas las aseguradoras", detalle: "gestión directa de siniestros" },
  { icono: Icono.garantia, titulo: "Garantía escrita", detalle: "en cada reparación" },
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
              Taller en San Miguel, Santiago
            </motion.p>
            <motion.h1
              variants={heroTitulo}
              className="font-condensed uppercase mb-6 text-[length:clamp(38px,10.5vw,54px)] lg:text-[length:clamp(36px,calc(4.7vw_-_10px),56px)]"
              style={{ fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.5px", color: "#16181D" }}
            >
              Desabolladura y pintura automotriz en San Miguel
            </motion.h1>
            <motion.p variants={heroItem} className="text-[16px] sm:text-[17px] mb-8" style={{ color: "#4B5058", lineHeight: 1.65 }}>
              Restauramos el orgullo de conducir. Tecnología europea, materiales PPG y Glasurit, y más de 20 años de oficio reparando vehículos en Santiago.
            </motion.p>
            <motion.div variants={heroItem} className="flex flex-col sm:flex-row gap-3">
              <motion.a
                href={WA_COTIZAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2.5 font-display font-semibold text-[15px] px-7 py-4 rounded-lg"
                style={{ background: "#D0021B", color: "#fff" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z" /></svg>
                Cotizar por WhatsApp
              </motion.a>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/servicios"
                  className="flex items-center justify-center font-display font-semibold text-[15px] px-7 py-4 rounded-lg transition-colors hover:bg-[#16181D] hover:text-white"
                  style={{ border: "2px solid #16181D", color: "#16181D" }}
                >
                  Ver servicios
                </Link>
              </motion.div>
            </motion.div>
            <motion.p variants={heroItem} className="text-[13px] mt-5 leading-relaxed" style={{ color: "#6B7280" }}>
              Respuesta en menos de 24 horas · Cotización sin costo · Envíanos una foto del daño
            </motion.p>
          </motion.div>
        </div>

        {/* Foto */}
        <div className="relative min-h-[300px] sm:min-h-[440px] lg:min-h-0 overflow-hidden" style={{ background: "#D9D2C3" }}>
          <motion.img
            src={FOTO_INICIO}
            alt="Reparación de desabolladura en curso"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
          />
        </div>
      </section>

      {/* BARRA DE CONFIANZA */}
      <section style={{ background: "#16181D" }} aria-label="Por qué confiar en nosotros">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4">
          {confianza.map((c, i) => {
            const contenido = (
              <>
                <span className="mt-0.5 shrink-0" style={{ color: "#D0021B" }}>{c.icono}</span>
                <span>
                  <span className="block font-display font-bold text-[14px] sm:text-[15px] text-white leading-tight">{c.titulo}</span>
                  <span className="block text-[12px] sm:text-[12.5px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.55)" }}>{c.detalle}</span>
                </span>
              </>
            );
            const clase = `flex items-start gap-3 px-5 sm:px-8 py-5 sm:py-6 border-white/10 ${bordeConfianza[i]}`;
            return c.href ? (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className={clase + " transition-colors hover:bg-white/5"}>{contenido}</a>
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
