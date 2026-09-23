import { redirect } from "next/navigation";
import { exigirAcceso } from "@/lib/acceso-panel";
import { RUTA_PANEL } from "@/lib/panel";

export const dynamic = "force-dynamic";

// El panel abre siempre en el formulario: es lo que el dueño usa al lado del
// auto. El historial y las solicitudes quedan a un toque, desde el encabezado.
export default async function Panel() {
  await exigirAcceso();
  redirect(`${RUTA_PANEL}/presupuesto`);
}
