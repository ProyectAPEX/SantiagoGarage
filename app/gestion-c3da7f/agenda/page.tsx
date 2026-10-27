import Link from "next/link";
import { exigirAcceso } from "@/lib/acceso-panel";
import { listarAgenda, listarBloqueos, type Cita } from "@/lib/citas";
import { baseConfigurada } from "@/lib/supabase";
import { regla, fechaLarga, horaFin, hoyEnChile, sumarDias, type TipoCita } from "@/lib/agenda";
import { enlaceWhatsApp } from "@/lib/site";
import { RUTA_PANEL } from "@/lib/panel";
import BotonSalir from "../BotonSalir";
import BotonCancelarHora from "./BotonCancelarHora";
import CerrarDia from "./CerrarDia";

export const dynamic = "force-dynamic";

/** Cada tipo con su color, para distinguirlos de un vistazo. */
const COLOR: Record<TipoCita, { fondo: string; texto: string }> = {
  particular: { fondo: "#FDF0F1", texto: "#D0021B" },
  aseguradora: { fondo: "#EAF1FB", texto: "#1D4E89" },
  presupuesto: { fondo: "#F1EFEA", texto: "#4B5058" },
};

function tituloDia(fecha: string, hoy: string): string {
  const largo = fechaLarga(fecha);
  if (fecha === hoy) return `Hoy · ${largo}`;
  if (fecha === sumarDias(hoy, 1)) return `Mañana · ${largo}`;
  return largo.charAt(0).toUpperCase() + largo.slice(1);
}

/** La agenda del taller: las horas tomadas desde la web, de hoy en adelante. */
export default async function Agenda() {
  await exigirAcceso();
  const conBase = baseConfigurada();
  const [citas, bloqueos] = conBase ? await Promise.all([listarAgenda(), listarBloqueos()]) : [null, null];
  const hoy = hoyEnChile();

  const porDia = new Map<string, Cita[]>();
  for (const c of citas ?? []) porDia.set(c.fecha, [...(porDia.get(c.fecha) ?? []), c]);
  const cerrados = new Set((bloqueos ?? []).map((b) => b.fecha));
  const confirmadas = (citas ?? []).filter((c) => c.estado === "confirmada").length;

  const tarjeta = "rounded-2xl p-4 bg-white";
  const borde = { border: "1px solid #E8E6E1" } as const;

  return (
    <div className="px-5 pb-16" style={{ paddingTop: 24, background: "#F1EFEA", minHeight: "100vh" }}>
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-5">
          <Link href={RUTA_PANEL} className="font-display font-semibold text-[15px]" style={{ color: "#16181D" }}>
            ← Panel
          </Link>
          <BotonSalir />
        </div>

        <p className="font-display text-[12px] font-medium tracking-[2px] uppercase mb-1" style={{ color: "#D0021B" }}>
          Uso interno
        </p>
        <h1 className="font-display font-bold uppercase text-[30px] leading-none mb-2" style={{ letterSpacing: "-1px" }}>
          Agenda
        </h1>
        <p className="text-[14px] mb-6" style={{ color: "#6B7280" }}>
          Las horas que se toman en santiagogarage.cl/agendar. {citas ? `${confirmadas} confirmada${confirmadas === 1 ? "" : "s"} desde hoy.` : ""}
        </p>

        {!citas && (
          <div className={tarjeta + " mb-4"} style={borde}>
            <p className="font-display font-bold text-[15px] mb-1" style={{ color: "#16181D" }}>
              {conBase ? "La agenda no respondió" : "Falta conectar la base de datos"}
            </p>
            <p className="text-[14px]" style={{ color: "#6B7280" }}>
              {conBase
                ? "Puede estar pausada (revisa el panel de Supabase) o falta correr supabase/003_agenda.sql."
                : "Sin SUPABASE_URL y SUPABASE_SECRET_KEY la agenda no funciona."}
            </p>
          </div>
        )}

        {citas && citas.length === 0 && (
          <div className={tarjeta + " mb-4 text-center py-8"} style={borde}>
            <p className="font-display font-semibold text-[15px]" style={{ color: "#16181D" }}>
              No hay horas tomadas desde hoy.
            </p>
          </div>
        )}

        {[...porDia.entries()].map(([fecha, delDia]) => (
          <section key={fecha} className="mb-5">
            <h2 className="font-display font-bold text-[13px] tracking-[1.2px] uppercase mb-2 px-1" style={{ color: fecha === hoy ? "#D0021B" : "#6B7280" }}>
              {tituloDia(fecha, hoy)}
              {cerrados.has(fecha) && <span style={{ color: "#D0021B" }}> · día cerrado</span>}
            </h2>
            <ul className="list-none flex flex-col gap-2">
              {delDia.map((c) => {
                const r = regla(c.tipo);
                const cancelada = c.estado === "cancelada";
                const wa = enlaceWhatsApp(c.telefono);
                const auto = [c.marca, c.modelo].filter(Boolean).join(" ");
                return (
                  <li key={c.id} className={tarjeta} style={{ ...borde, opacity: cancelada ? 0.55 : 1 }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-display font-bold text-[20px] leading-none" style={{ color: "#16181D", textDecoration: cancelada ? "line-through" : "none" }}>
                        {c.hora}
                        <span className="font-semibold text-[14px]" style={{ color: "#6B7280" }}> a {horaFin(c.tipo, c.hora)}</span>
                      </p>
                      <span className="font-display font-semibold text-[12px] px-2.5 py-1 rounded-full shrink-0" style={{ background: COLOR[c.tipo].fondo, color: COLOR[c.tipo].texto }}>
                        {cancelada ? "Cancelada" : r.nombre}
                      </span>
                    </div>
                    <p className="font-display font-semibold text-[16px]" style={{ color: "#16181D" }}>
                      {c.nombre}
                    </p>
                    {(auto || c.patente) && (
                      <p className="text-[14px]" style={{ color: "#4B5058" }}>
                        {[auto, c.patente].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {(c.aseguradora || c.siniestro) && (
                      <p className="text-[14px]" style={{ color: "#4B5058" }}>
                        {[c.aseguradora, c.siniestro && `Siniestro ${c.siniestro}`].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {c.comentario && (
                      <p className="text-[14px] mt-1.5" style={{ color: "#6B7280" }}>
                        “{c.comentario}”
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                      <a href={`tel:${c.telefono.replace(/[^\d+]/g, "")}`} className="font-display font-semibold text-[14px]" style={{ color: "#16181D" }}>
                        {c.telefono}
                      </a>
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="font-display font-semibold text-[14px]" style={{ color: "#1F8F4E" }}>
                          WhatsApp
                        </a>
                      )}
                      <a href={`mailto:${c.email}`} className="text-[14px] truncate max-w-full" style={{ color: "#6B7280" }}>
                        {c.email}
                      </a>
                    </div>
                    {!cancelada && (
                      <div className="mt-3">
                        <BotonCancelarHora id={c.id} cliente={c.nombre} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {conBase && bloqueos && (
          <div className={tarjeta + " mt-6"} style={borde}>
            <p className="font-display text-[11px] font-bold tracking-[1.5px] uppercase mb-1" style={{ color: "#6B7280" }}>
              Cerrar un día
            </p>
            <p className="text-[14px] mb-3" style={{ color: "#6B7280" }}>
              Ese día deja de aparecer en la web. Las horas ya tomadas se mantienen: cancélalas arriba si corresponde.
            </p>
            <CerrarDia bloqueos={bloqueos} minimo={hoy} />
          </div>
        )}
      </div>
    </div>
  );
}
