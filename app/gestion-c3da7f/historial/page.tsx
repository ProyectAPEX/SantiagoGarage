import Link from "next/link";
import { exigirAcceso } from "@/lib/acceso-panel";
import { listarPresupuestos } from "@/lib/presupuestos";
import { baseConfigurada } from "@/lib/supabase";
import { formatCLP } from "@/lib/presupuesto-pdf";
import { RUTA_PANEL } from "@/lib/panel";
import BotonSalir from "../BotonSalir";

export const dynamic = "force-dynamic";
export const metadata = { title: "Historial" };

const ZONA = "America/Santiago";

function cuando(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { timeZone: ZONA, day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function Historial({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await exigirAcceso();
  const { q = "" } = await searchParams;
  const presupuestos = baseConfigurada() ? await listarPresupuestos(q) : null;

  return (
    <div className="px-5 pb-16" style={{ paddingTop: 24, background: "#F1EFEA", minHeight: "100vh" }}>
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link href={`${RUTA_PANEL}/presupuesto`} className="font-display font-semibold text-[14px] py-1" style={{ color: "#16181D" }}>
            ← Nuevo presupuesto
          </Link>
          <BotonSalir />
        </div>

        <p className="font-display text-[12px] font-medium tracking-[2px] uppercase mb-1" style={{ color: "#D0021B" }}>
          Uso interno
        </p>
        <h1 className="font-display font-bold uppercase text-[30px] leading-none mb-5" style={{ letterSpacing: "-1px" }}>
          Historial
        </h1>

        {/* Formulario simple: el buscador viaja en la dirección, sin JavaScript */}
        <form className="flex gap-2 mb-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cliente, patente, RUT o N°"
            maxLength={40}
            className="flex-1 rounded-xl px-4 py-3 bg-white outline-none"
            style={{ fontSize: 16, border: "1px solid #D5D2CC", color: "#16181D" }}
          />
          <button type="submit" className="font-display font-semibold text-[14px] px-5 rounded-xl" style={{ background: "#16181D", color: "#fff" }}>
            Buscar
          </button>
        </form>

        {presupuestos === null ? (
          <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E8E6E1" }}>
            <p className="font-display font-bold text-[16px] mb-1" style={{ color: "#16181D" }}>
              {baseConfigurada() ? "No se pudo leer el historial" : "Falta conectar la base de datos"}
            </p>
            <p className="text-[14px]" style={{ color: "#6B7280" }}>
              {baseConfigurada()
                ? "La base no respondió. Si lleva días sin uso puede estar pausada: revisa el panel de Supabase."
                : "Los presupuestos se guardan recién cuando estén SUPABASE_URL y SUPABASE_SECRET_KEY. Mientras tanto se emiten igual, pero no quedan anotados."}
            </p>
          </div>
        ) : presupuestos.length === 0 ? (
          <p className="text-[15px]" style={{ color: "#6B7280" }}>
            {q ? `Sin resultados para “${q}”.` : "Todavía no hay presupuestos guardados. Los que emitas desde acá quedan anotados solos."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {presupuestos.map((p) => (
              <article key={p.id} className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E8E6E1" }}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h2 className="font-display font-bold text-[17px] leading-tight" style={{ color: "#16181D" }}>
                    {p.cliente_nombre}
                  </h2>
                  <span className="font-display font-bold text-[16px] shrink-0" style={{ color: "#16181D" }}>
                    {formatCLP(p.total)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] mb-3" style={{ color: "#6B7280" }}>
                  <span>N° {p.numero}</span>
                  <span>{cuando(p.creado)}</span>
                  {p.vehiculo_patente && <span className="uppercase">{p.vehiculo_patente}</span>}
                  {(p.vehiculo_marca || p.vehiculo_modelo) && <span>{[p.vehiculo_marca, p.vehiculo_modelo].filter(Boolean).join(" ")}</span>}
                  {p.enviado_por === "whatsapp" && <span>Enviado por WhatsApp</span>}
                </div>

                <ul className="text-[14px] mb-4 list-none flex flex-col gap-0.5" style={{ color: "#16181D" }}>
                  {p.items.slice(0, 4).map((i, n) => (
                    <li key={n} className="flex justify-between gap-3">
                      <span className="truncate">{i.descripcion}</span>
                      <span className="shrink-0" style={{ color: "#6B7280" }}>{formatCLP(i.precio)}</span>
                    </li>
                  ))}
                  {p.items.length > 4 && (
                    <li style={{ color: "#6B7280" }}>y {p.items.length - 4} más</li>
                  )}
                </ul>

                <Link
                  href={`${RUTA_PANEL}/presupuesto?copiar=${p.id}`}
                  className="inline-block font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg"
                  style={{ border: "1px solid #D5D2CC", color: "#16181D" }}
                >
                  Abrir de nuevo
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
