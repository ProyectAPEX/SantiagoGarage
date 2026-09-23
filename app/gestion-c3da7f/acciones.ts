"use server";
import { exigirAcceso } from "@/lib/acceso-panel";
import { cambiarEstado } from "@/lib/solicitudes";
import { guardarPresupuesto, type EntradaPresupuesto } from "@/lib/presupuestos";
import { enviarPresupuestoPorCorreo, type CorreoPresupuesto } from "@/lib/correo";
import { esEmailValido } from "@/lib/sanitize";

// Acciones del panel. Next las expone como endpoints que se pueden llamar
// desde cualquier ruta del sitio, no solo desde el panel: por eso cada una
// vuelve a exigir la clave por su cuenta. El id se valida en cambiarEstado.

export async function marcarCotizada(id: string): Promise<boolean> {
  await exigirAcceso();
  return typeof id === "string" && cambiarEstado(id, "cotizada");
}

export async function descartarSolicitud(id: string): Promise<boolean> {
  await exigirAcceso();
  return typeof id === "string" && cambiarEstado(id, "descartada");
}

/**
 * Guarda en el historial el presupuesto recien emitido. Si no hay base
 * conectada devuelve null y el panel sigue funcionando igual.
 */
export async function anotarPresupuesto(entrada: EntradaPresupuesto): Promise<string | null> {
  await exigirAcceso();
  if (!entrada || typeof entrada !== "object") return null;
  return guardarPresupuesto(entrada);
}

/**
 * Manda el presupuesto al correo del cliente, con el PDF adjunto. Devuelve ""
 * si salio bien, o el motivo para mostrarlo en el panel.
 */
export async function enviarPorCorreo(datos: CorreoPresupuesto): Promise<string> {
  await exigirAcceso();
  if (!datos || typeof datos !== "object") return "Faltan los datos del presupuesto.";
  if (!esEmailValido(datos.para ?? "")) return "El correo del cliente no es válido.";
  if (typeof datos.pdfBase64 !== "string" || !datos.pdfBase64) return "El PDF llegó vacío.";
  return enviarPresupuestoPorCorreo(datos);
}

export async function reabrirSolicitud(id: string): Promise<boolean> {
  await exigirAcceso();
  return typeof id === "string" && cambiarEstado(id, "nueva");
}
