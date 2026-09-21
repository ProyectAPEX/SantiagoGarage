import Link from "next/link";
import { exigirAcceso } from "@/lib/acceso-panel";
import { listarSolicitudes, type Solicitud } from "@/lib/solicitudes";
import { RUTA_PANEL } from "@/lib/panel";
import BotonesSolicitud from "./BotonesSolicitud";

export const dynamic = "force-dynamic";

/** Vercel corre en UTC: sin esto, lo de las 22:00 en Chile saldria como del dia siguiente. */
const ZONA = "America/Santiago";

function hace(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return `hace ${d} día${d === 1 ? "" : "s"}`;
  return new Date(iso).toLocaleDateString("es-CL", { timeZone: ZONA, day: "2-digit", month: "2-digit", year: "numeric" });
}

/** WhatsApp del cliente: numeros chilenos sin 56 se completan. */
function waDe(telefono: string): string {
  const d = telefono.replace(/\D/g, "");
  return `https://wa.me/${d.startsWith("56") ? d : "56" + d}`;
}

const ETIQUETA = {
  cotizada: { texto: "Cotizada", fondo: "#E8F5EC", color: "#1B7A3E" },
  descartada: { texto: "Descartada", fondo: "#F0EEE9", color: "#6B7280" },
} as const;

function Tarjeta({ s }: { s: Solicitud }) {
  const nueva = s.estado === "nueva";
  const etiqueta = s.estado === "nueva" ? null : ETIQUETA[s.estado];
  return (
    <article className="rounded-2xl p-5 bg-white" style={{ border: nueva ? "1px solid #E8E6E1" : "1px solid #EFEDE8", opacity: nueva ? 1 : 0.85 }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-bold text-[18px] leading-tight" style={{ color: "#16181D" }}>{s.nombre}</h3>
        <span className="text-[12px] shrink-0 pt-1" style={{ color: "#9CA3AF" }}>{hace(s.creada)}</span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] mb-3" style={{ color: "#4B5058" }}>
        <a href={`tel:${s.telefono.replace(/[^\d+]/g, "")}`} className="underline underline-offset-2">{s.telefono}</a>
        {s.vehiculo && <span>{s.vehiculo}</span>}
        {s.email && <span className="break-all">{s.email}</span>}
      </div>

      <p className="text-[15px] leading-relaxed mb-4 line-clamp-4" style={{ color: "#16181D" }}>{s.mensaje}</p>

      <div className="flex flex-wrap items-center gap-2">
        {etiqueta && (
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full mr-1" style={{ background: etiqueta.fondo, color: etiqueta.color }}>
            {etiqueta.texto}
          </span>
        )}
        <Link
          href={`${RUTA_PANEL}/presupuesto?id=${s.id}`}
          className="font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg"
          style={nueva ? { background: "#D0021B", color: "#fff" } : { color: "#16181D", border: "1px solid #D5D2CC" }}
        >
          {nueva ? "Cotizar" : "Cotizar de nuevo"}
        </Link>
        <a
          href={waDe(s.telefono)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display font-semibold text-[14px] px-4 py-2.5 rounded-lg"
          style={{ color: "#16181D", border: "1px solid #D5D2CC" }}
        >
          WhatsApp
        </a>
        <BotonesSolicitud id={s.id} estado={s.estado} />
      </div>
    </article>
  );
}

export default async function Bandeja() {
  await exigirAcceso();
  const solicitudes = await listarSolicitudes();
  const nuevas = solicitudes?.filter((s) => s.estado === "nueva") ?? [];
  const atendidas = solicitudes?.filter((s) => s.estado !== "nueva") ?? [];
  const sinBase = !process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY;

  return (
    <div className="px-5 pb-16" style={{ paddingTop: 32, background: "#F1EFEA", minHeight: "100vh" }}>
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <p className="font-display text-[12px] font-medium tracking-[2px] uppercase mb-1" style={{ color: "#D0021B" }}>
              Uso interno
            </p>
            <h1 className="font-display font-bold uppercase text-[30px] leading-none" style={{ letterSpacing: "-1px" }}>
              Solicitudes
            </h1>
          </div>
          <Link
            href={`${RUTA_PANEL}/presupuesto`}
            className="font-display font-semibold text-[14px] px-4 py-3 rounded-lg shrink-0"
            style={{ background: "#16181D", color: "#fff" }}
          >
            + Presupuesto
          </Link>
        </div>

        {solicitudes === null ? (
          <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E8E6E1" }}>
            <p className="font-display font-bold text-[16px] mb-1" style={{ color: "#16181D" }}>
              {sinBase ? "Falta conectar la base de datos" : "No se pudieron cargar las solicitudes"}
            </p>
            <p className="text-[14px]" style={{ color: "#6B7280" }}>
              {sinBase
                ? "Faltan SUPABASE_URL y SUPABASE_SECRET_KEY. Mientras tanto puedes armar presupuestos igual con “+ Presupuesto”."
                : "La base no respondió. Si lleva días sin uso puede estar pausada: revisa el panel de Supabase."}
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-display font-bold text-[13px] tracking-[1.5px] uppercase mb-3" style={{ color: "#16181D" }}>
              Nuevas <span style={{ color: "#D0021B" }}>({nuevas.length})</span>
            </h2>
            {nuevas.length === 0 ? (
              <p className="text-[15px] mb-8" style={{ color: "#6B7280" }}>No hay solicitudes nuevas. Las que lleguen por la web aparecen acá.</p>
            ) : (
              <div className="flex flex-col gap-3 mb-8">{nuevas.map((s) => <Tarjeta key={s.id} s={s} />)}</div>
            )}

            {atendidas.length > 0 && (
              <>
                <h2 className="font-display font-bold text-[13px] tracking-[1.5px] uppercase mb-3" style={{ color: "#6B7280" }}>
                  Atendidas ({atendidas.length})
                </h2>
                <div className="flex flex-col gap-3">{atendidas.map((s) => <Tarjeta key={s.id} s={s} />)}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
