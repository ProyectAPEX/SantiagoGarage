"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Reveal from "@/components/anim/Reveal";
import Tilt from "@/components/anim/Tilt";

const servicios = [
  {
    n: "01",
    name: "Desabolladura de Precisión",
    tag: "Estándar de fábrica",
    desc: "Restauración estructural de paneles preservando las líneas originales del fabricante. Mínimo uso de rellenos, máxima fidelidad estructural. Herramientas de última generación para resultados de fábrica.",
    img: "https://images.unsplash.com/photo-1645445511761-01834d53205b?w=800&q=80",
  },
  {
    n: "02",
    name: "Pintura de Alta Gama",
    tag: "PPG & Glasurit",
    desc: "Pintura al horno con secado a temperatura controlada — equipamiento que muy pocos talleres tienen. Laboratorio computarizado de color y aplicación en cabina presurizada con pinturas PPG y Glasurit.",
    img: "https://plus.unsplash.com/premium_photo-1661750334379-2f2b4b1f6ef4?w=800&q=80",
  },
  {
    n: "03",
    name: "Reparación de Plásticos",
    tag: "Recuperación técnica",
    desc: "Soldadura estructural en parachoques y molduras. Evitamos reemplazos costosos recuperando la geometría y resistencia original de cada pieza plástica.",
    img: "https://images.unsplash.com/photo-1632823639409-ce060d5a54cc?w=800&q=80",
  },
  {
    n: "04",
    name: "Pulido Espejo & Detailing",
    tag: "Acabado showroom",
    desc: "Corrección multietapa del barniz. Eliminamos microrayaduras, marcas de pulidor y oxidación superficial. Brillo profundo y nítido con resultado nivel showroom.",
    img: "https://images.unsplash.com/photo-1708805282706-f44730b7e527?w=800&q=80",
  },
  {
    n: "05",
    name: "Diagnóstico Digital",
    tag: "Seguridad activa",
    desc: "Scanner multimarca post-reparación. Verificamos sensores de proximidad, sistemas ADAS y cámaras. Tu vehículo sale con todos los sistemas electrónicos activos y calibrados.",
    img: "https://images.unsplash.com/photo-1727893380169-4dda123e19f7?w=800&q=80",
  },
  {
    n: "06",
    name: "Gestión de Siniestros",
    tag: "Asesoría integral",
    desc: "Asesoría completa para particulares y asegurados. Facilitamos presupuestos, peritajes y coordinación directa con todas las aseguradoras del mercado.",
    img: "https://images.unsplash.com/photo-1687867451910-28941a460f35?w=800&q=80",
  },
];

const proceso = [
  { n: "01", t: "Recepción & diagnóstico", d: "Evaluación completa con documentación fotográfica y escaneo digital previo." },
  { n: "02", t: "Reparación estructural", d: "Restauración con herramientas de precisión. Geometría de fábrica, cero compromisos." },
  { n: "03", t: "Preparación & pintura", d: "Cabina presurizada con PPG o Glasurit. Igualación computarizada de color." },
  { n: "04", t: "Entrega con garantía", d: "Inspección final, diagnóstico post-reparación y entrega con garantía escrita." },
];

export default function Servicios() {
  return (
    <>
      {/* HEADER */}
      <div className="px-10 pb-16" style={{ paddingTop: 156 }}>
        <div className="max-w-[1200px] mx-auto">
          <Reveal y={30}>
            <p className="font-display text-[13px] font-medium tracking-[3px] uppercase mb-4" style={{ color: "#D0021B" }}>
              Santiago Garage
            </p>
            <h1 className="font-display font-bold uppercase mb-5" style={{ fontSize: "clamp(42px,5.5vw,72px)", lineHeight: 1.05, letterSpacing: "-2px" }}>
              Servicios especializados
            </h1>
            <p className="text-[17px] font-light max-w-[520px]" style={{ color: "#6B7280", lineHeight: 1.7 }}>
              Equipamiento de última generación y materiales de primer nivel mundial. Sin atajos, sin compromisos en cada trabajo.
            </p>
          </Reveal>
        </div>
      </div>

      {/* SERVICES */}
      <section className="px-10 pb-24">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          {servicios.map((s, i) => {
            const imgLeft = i % 2 === 0;
            return (
              <Reveal key={s.n} x={imgLeft ? -60 : 60} y={0} duration={0.8}>
                <div
                  className="group grid overflow-hidden rounded-2xl"
                  style={{
                    gridTemplateColumns: imgLeft ? "440px 1fr" : "1fr 440px",
                    background: "#fff",
                    border: "1px solid #E8E6E1",
                    minHeight: 320,
                  }}
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden" style={{ order: imgLeft ? 0 : 1 }}>
                    <motion.img
                      src={s.img}
                      alt={s.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.07 }}
                      transition={{ duration: 0.7, ease: [0.21, 0.65, 0.36, 1] }}
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-center px-12 py-10" style={{ order: imgLeft ? 1 : 0 }}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-display font-bold text-[14px]" style={{ color: "#D0021B" }}>{s.n}</span>
                      <span className="font-display text-[12px] font-medium px-3 py-1 rounded-full" style={{ color: "#1B3B8C", background: "rgba(27,59,140,0.08)" }}>{s.tag}</span>
                    </div>
                    <h3 className="font-display font-semibold text-[28px] mb-4" style={{ letterSpacing: "-1px" }}>{s.name}</h3>
                    <p className="text-[15px] leading-relaxed mb-8 max-w-[480px]" style={{ color: "#6B7280" }}>{s.desc}</p>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-fit">
                      <Link
                        href="/contacto"
                        className="font-display font-semibold text-[14px] px-7 py-3.5 rounded-full inline-block"
                        style={{ background: "#16181D", color: "#fff" }}
                      >
                        Cotizar este servicio
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* PROCESO */}
      <section className="px-10 py-20" style={{ background: "#F1EFEA" }}>
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <div className="mb-14">
              <p className="font-display text-[13px] font-medium tracking-[3px] uppercase mb-4" style={{ color: "#D0021B" }}>
                Cómo trabajamos
              </p>
              <h2 className="font-display font-bold uppercase" style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
                Proceso sin atajos
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            {proceso.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.12} y={50}>
                <Tilt className="h-full">
                  <div className="p-8 rounded-2xl h-full" style={{ background: "#fff", border: "1px solid #E8E6E1" }}>
                    <span className="font-display font-bold text-[30px] block mb-4" style={{ color: "#D0021B" }}>{p.n}</span>
                    <h3 className="font-display font-semibold text-[18px] mb-2" style={{ letterSpacing: "-0.5px" }}>{p.t}</h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: "#6B7280" }}>{p.d}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 py-24">
        <Reveal y={60}>
          <div className="max-w-[1200px] mx-auto rounded-3xl px-14 py-16 flex items-center justify-between relative overflow-hidden" style={{ background: "#16181D" }}>
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(208,2,27,0.25), transparent 70%)" }} />
            <div>
              <p className="font-display text-[13px] font-medium tracking-[3px] uppercase mb-4" style={{ color: "#D0021B" }}>
                ¿Listo para empezar?
              </p>
              <h2 className="font-display font-bold uppercase" style={{ fontSize: "clamp(30px,3.5vw,46px)", lineHeight: 1.15, letterSpacing: "-1px", color: "#fff" }}>
                Solicita tu cotización{" "}
                <span className="inline-block px-3" style={{ background: "#D0021B", color: "#fff", transform: "skewX(-6deg)" }}>
                  GRATIS
                </span>
              </h2>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="shrink-0 relative z-10">
              <Link href="/contacto" className="font-display font-semibold text-[15px] px-8 py-4 rounded-full inline-block" style={{ background: "#fff", color: "#16181D" }}>
                Contactar ahora
              </Link>
            </motion.div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
