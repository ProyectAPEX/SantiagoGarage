import Link from "next/link";
import { exigirAcceso } from "@/lib/acceso-panel";
import { resumenPanel } from "@/lib/presupuestos";
import { contarSolicitudesNuevas } from "@/lib/solicitudes";
import { baseConfigurada } from "@/lib/supabase";
import { formatCLP } from "@/lib/presupuesto-pdf";
import { RUTA_PANEL } from "@/lib/panel";
import BotonSalir from "./BotonSalir";

export const dynamic = "force-dynamic";

const ZONA = "America/Santiago";

function cuando(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { timeZone: ZONA, day: "2-digit", month: "2-digit" });
}

const MES = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, month: "long" });

/** Tablero del taller: lo del mes, los últimos presupuestos y los accesos. */
export default async function Panel() {
  await exigirAcceso();
  const resumen = baseConfigurada() ? await resumenPanel() : null;
  const nuevas = baseConfigurada() ? await contarSolicitudesNuevas() : null;
  const mes = MES.format(new Date());

  const tarjeta = "rounded-2xl p-4 bg-white";
  const borde = { border: "1px solid #E8E6E1" } as const;

  return (
    <div className="px-5 pb-16" style={{ paddingTop: 24, background: "#F1EFEA", minHeight: "100vh" }}>
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="font-display text-[12px] font-medium tracking-[2px] uppercase mb-1" style={{ color: "#D0021B" }}>
              Uso interno
            </p>
            <h1 className="font-display font-bold uppercase text-[30px] leading-none" style={{ letterSpacing: "-1px" }}>
              Santiago Garage
            </h1>
          </div>
          <BotonSalir />
        </div>

        <Link
          href={`${RUTA_PANEL}/presupuesto`}
          className="flex items-center justify-center font-display font-semibold text-[17px] py-5 rounded-2xl mb-4"
          style={{ background: "#D0021B", color: "#fff" }}
        >
          + Nuevo presupuesto
        </Link>

        {/* Números del mes */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={tarjeta} style={borde}>
            <p className="font-display text-[11px] font-bold tracking-[1.5px] uppercase mb-2" style={{ color: "#6B7280" }}>
              Presupuestos de {mes}
            </p>
            <p className="font-display font-bold text-[28px] leading-none" style={{ color: "#16181D" }}>
              {resumen ? resumen.mesCantidad : "—"}
            </p>
          </div>
          <div className={tarjeta} style={borde}>
            <p className="font-display text-[11px] font-bold tracking-[1.5px] uppercase mb-2" style={{ color: "#6B7280" }}>
              Cotizado en {mes}
            </p>
            <p className="font-display font-bold text-[28px] leading-none" style={{ color: "#16181D" }}>
              {resumen ? formatCLP(resumen.mesTotal) : "—"}
            </p>
          </div>
        </div>

        {!resumen && (
          <div className={tarjeta + " mb-4"} style={borde}>
            <p className="font-display font-bold text-[15px] mb-1" style={{ color: "#16181D" }}>
              {baseConfigurada() ? "La base no respondió" : "Falta conectar la base de datos"}
            </p>
            <p className="text-[14px]" style={{ color: "#6B7280" }}>
              {baseConfigurada()
                ? "Si lleva días sin uso puede estar pausada: revisa el panel de Supabase. Los presupuestos se emiten igual."
                : "Sin SUPABASE_URL y SUPABASE_SECRET_KEY no se guarda el historial. Los presupuestos se emiten igual."}
            </p>
          </div>
        )}

        {/* Últimos presupuestos */}
        {resumen && resumen.ultimos.length > 0 && (
          <div className={tarjeta + " mb-4"} style={borde}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="font-display text-[11px] font-bold tracking-[1.5px] uppercase" style={{ color: "#6B7280" }}>
                Últimos presupuestos
              </p>
              <Link href={`${RUTA_PANEL}/historial`} className="font-display font-semibold text-[13px]" style={{ color: "#D0021B" }}>
                Ver todos
              </Link>
            </div>
            <ul className="list-none flex flex-col">
              {resumen.ultimos.map((p, i) => (
                <li key={p.id} style={{ borderTop: i === 0 ? "none" : "1px solid #F0EEE9" }}>
                  <Link href={`${RUTA_PANEL}/presupuesto?copiar=${p.id}`} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block font-display font-semibold text-[15px] truncate" style={{ color: "#16181D" }}>
                        {p.cliente_nombre}
                      </span>
                      <span className="block text-[13px] truncate" style={{ color: "#6B7280" }}>
                        {[p.vehiculo_marca, p.vehiculo_modelo].filter(Boolean).join(" ") || `N° ${p.numero}`} · {cuando(p.creado)}
                      </span>
                    </span>
                    <span className="font-display font-semibold text-[15px] shrink-0" style={{ color: "#16181D" }}>
                      {formatCLP(p.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Accesos */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`${RUTA_PANEL}/historial`} className={tarjeta + " text-center font-display font-semibold text-[15px]"} style={{ ...borde, color: "#16181D" }}>
            Historial
          </Link>
          <Link href={`${RUTA_PANEL}/solicitudes`} className={tarjeta + " text-center font-display font-semibold text-[15px] relative"} style={{ ...borde, color: "#16181D" }}>
            Solicitudes
            {!!nuevas && (
              <span
                className="absolute top-2 right-3 font-display font-bold text-[12px] px-2 py-0.5 rounded-full"
                style={{ background: "#D0021B", color: "#fff" }}
              >
                {nuevas}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
