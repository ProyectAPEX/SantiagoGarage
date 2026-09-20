"use client";
import Reveal from "@/components/anim/Reveal";
import { WA_URL, TELEFONO_VISIBLE, EMAIL_CONTACTO } from "@/lib/site";

export default function Contacto() {
  return (
    <>
      {/* HEADER */}
      <div className="px-5 sm:px-10 pb-14" style={{ paddingTop: 132 }}>
        <div className="max-w-[1200px] mx-auto">
          <Reveal y={30}>
            <p className="font-display text-[13px] font-medium tracking-[3px] uppercase mb-4" style={{ color: "#D0021B" }}>
              Santiago Garage
            </p>
            <h1 className="font-display font-bold uppercase mb-5" style={{ fontSize: "clamp(42px,5.5vw,72px)", lineHeight: 1.05, letterSpacing: "-2px" }}>
              Contacto
            </h1>
            <p className="text-[17px] font-light max-w-[500px]" style={{ color: "#6B7280", lineHeight: 1.7 }}>
              Cotización sin costo. Respondemos en menos de 24 horas. Trabajamos con todas las aseguradoras del mercado.
            </p>
          </Reveal>
        </div>
      </div>

      {/* MAIN */}
      <section className="px-5 sm:px-10 pb-24">
        <div className="max-w-[1200px] mx-auto grid gap-6 grid-cols-1 md:grid-cols-[1fr_1.2fr]">

          {/* INFO */}
          <div className="p-7 sm:p-10 rounded-2xl flex flex-col justify-between" style={{ background: "#fff", border: "1px solid #E8E6E1" }}>
            <div className="flex flex-col gap-7">
              {[
                { l: "Dirección", v: "Ureta Cox 1038, San Miguel, Santiago", href: "https://maps.google.com/?q=Ureta+Cox+1038+San+Miguel+Santiago" },
                { l: "WhatsApp", v: TELEFONO_VISIBLE, href: WA_URL },
                { l: "Email", v: EMAIL_CONTACTO, href: `mailto:${EMAIL_CONTACTO}` },
                { l: "Horario", v: "Lun–Vie 8:00–18:00 · Sáb 9:00–14:00", href: null },
                { l: "Medios de pago", v: "Débito · Crédito · Transferencia · Efectivo", href: null },
              ].map((item) => (
                <div key={item.l} className="pb-7" style={{ borderBottom: "1px solid #F0EEE9" }}>
                  <p className="font-display text-[12px] font-medium tracking-[2px] uppercase mb-2" style={{ color: "#D0021B" }}>{item.l}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="font-display font-semibold text-[18px] transition-opacity hover:opacity-60 block"
                      style={{ letterSpacing: "-0.3px" }}
                    >
                      {item.v}
                    </a>
                  ) : (
                    <p className="font-display font-semibold text-[18px]" style={{ letterSpacing: "-0.3px" }}>{item.v}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 mt-10">
              <a
                href={`${WA_URL}?text=Hola%2C%20quiero%20cotizar%20un%20servicio`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-semibold text-[15px] flex items-center justify-center gap-2.5 px-7 py-4 rounded-full transition-opacity hover:opacity-85"
                style={{ background: "#D0021B", color: "#fff" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Escribir por WhatsApp
              </a>
              <a
                href={`mailto:${EMAIL_CONTACTO}`}
                className="font-display font-medium text-[15px] flex items-center justify-center px-7 py-4 rounded-full transition-colors hover:border-black"
                style={{ border: "1px solid #D5D2CC", color: "#16181D" }}
              >
                Enviar email
              </a>
            </div>
          </div>

          {/* MAP */}
          <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid #E8E6E1", minHeight: 560 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.8!2d-70.6607!3d-33.4987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662d00e0b4a3f4f%3A0x0!2sUreta+Cox+1038%2C+San+Miguel%2C+Regi%C3%B3n+Metropolitana!5e0!3m2!1ses!2scl!4v1700000000000!5m2!1ses!2scl"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block", minHeight: 560 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Santiago Garage — Ureta Cox 1038, San Miguel"
              allowFullScreen
            />
            {/* Overlay clickeable que abre Google Maps */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Santiago+Garage+SPA+Desabolladura+Pintura+Automotriz+Ureta+Cox+1038+San+Miguel"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              aria-label="Abrir en Google Maps"
            />
            <div className="absolute top-5 left-5 pointer-events-none rounded-xl px-5 py-4" style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
              <p className="font-display text-[11px] font-medium tracking-[2px] uppercase mb-1" style={{ color: "#D0021B" }}>Ubicación</p>
              <p className="font-display font-semibold text-[16px]" style={{ letterSpacing: "-0.3px" }}>Ureta Cox 1038</p>
              <p className="text-[13px]" style={{ color: "#6B7280" }}>San Miguel, Santiago</p>
            </div>
            <div className="absolute bottom-5 right-5 pointer-events-none flex items-center gap-2 px-5 py-3 rounded-full font-display font-semibold text-[13px]" style={{ background: "#16181D", color: "#fff" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Abrir en Maps
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
