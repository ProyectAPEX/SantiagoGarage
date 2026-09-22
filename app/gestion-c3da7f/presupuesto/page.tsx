import { exigirAcceso } from "@/lib/acceso-panel";
import { obtenerSolicitud } from "@/lib/solicitudes";
import { baseConfigurada } from "@/lib/supabase";
import { RUTA_PANEL } from "@/lib/panel";
import FormularioPresupuesto from "./FormularioPresupuesto";
import type { DatosIniciales } from "./FormularioPresupuesto";

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
  searchParams: Promise<{ id?: string }>;
}) {
  await exigirAcceso();
  const { id } = await searchParams;

  let inicial: DatosIniciales | null = null;
  if (id) {
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
  return <FormularioPresupuesto inicial={inicial} rutaBandeja={baseConfigurada() ? RUTA_PANEL : null} />;
}
