"use server";
import { exigirAcceso } from "@/lib/acceso-panel";
import { cambiarEstado } from "@/lib/solicitudes";

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

export async function reabrirSolicitud(id: string): Promise<boolean> {
  await exigirAcceso();
  return typeof id === "string" && cambiarEstado(id, "nueva");
}
