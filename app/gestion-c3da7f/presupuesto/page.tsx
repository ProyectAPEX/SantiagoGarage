import { exigirAcceso } from "@/lib/acceso-panel";
import { obtenerSolicitud } from "@/lib/solicitudes";
import { obtenerPresupuesto } from "@/lib/presupuestos";
import { baseConfigurada } from "@/lib/supabase";
import { RUTA_PANEL } from "@/lib/panel";
import FormularioPresupuesto from "./FormularioPresupuesto";
import type { DatosIniciales, Copia } from "./FormularioPresupuesto";

export const dynamic = "force-dynamic";

/**
 * "Hyundai Grand i10 2019" -> marca, modelo y año, para no tipearlos de nuevo.
 * El cliente lo escribe en un solo campo; queda editable en el formulario.
 */
function separarVehiculo(texto: string | null) {
  const t = (texto ?? "").trim();
  const anio = t.match(/\b(19[5-9]\d|20\d{2})\b/)?.[0] ?? "";
  const sinAnio = t.replace(anio, "").replace(/\s{2,}/g, " ").trim();
  const [marca = "", ...resto] = sinAnio.split(" ");
  return { marca, modelo: resto.join(" "), anio };
}

export default async function PaginaPresupuesto({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; copiar?: string }>;
}) {
  await exigirAcceso();
  const { id, copiar } = await searchParams;

  // Del historial: se abre con todo cargado, pero con número nuevo
  let copia: Copia | null = null;
  if (copiar) {
    const p = await obtenerPresupuesto(copiar);
    if (p) {
      copia = {
        nombre: p.cliente_nombre,
        rut: p.cliente_rut ?? "",
        telefono: p.cliente_telefono ?? "",
        email: p.cliente_email ?? "",
        domicilio: p.cliente_domicilio ?? "",
        comuna: p.cliente_comuna ?? "",
        marca: p.vehiculo_marca ?? "",
        modelo: p.vehiculo_modelo ?? "",
        anio: p.vehiculo_anio ?? "",
        patente: p.vehiculo_patente ?? "",
        color: p.vehiculo_color ?? "",
        descuento: p.descuento ? String(p.descuento) : "",
        plazoDias: p.plazo_dias || "5",
        validezDias: p.validez_dias || "15",
        observaciones: p.observaciones ?? "",
        items: (p.items ?? []).map((i) => ({ descripcion: i.descripcion, precio: i.precio })),
      };
    }
  }

  // De una solicitud de la web
  let inicial: DatosIniciales | null = null;
  if (!copia && id) {
    const s = await obtenerSolicitud(id);
    if (s) {
      inicial = {
        solicitudId: s.id,
        nombre: s.nombre,
        telefono: s.telefono,
        ...separarVehiculo(s.vehiculo),
        mensaje: s.mensaje,
      };
    }
  }

  // La ruta del panel se pasa desde el servidor: si el componente del
  // navegador la importara, quedaria escrita en el JavaScript publico.
  return (
    <FormularioPresupuesto
      inicial={inicial}
      copia={copia}
      rutaBandeja={baseConfigurada() ? `${RUTA_PANEL}/solicitudes` : null}
      rutaHistorial={`${RUTA_PANEL}/historial`}
    />
  );
}
