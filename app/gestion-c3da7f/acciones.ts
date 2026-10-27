"use server";
import { exigirAcceso } from "@/lib/acceso-panel";
import { cambiarEstado } from "@/lib/solicitudes";
import { guardarPresupuesto, eliminarPresupuesto, type EntradaPresupuesto } from "@/lib/presupuestos";
import { enviarPresupuestoPorCorreo, type CorreoPresupuesto } from "@/lib/correo";
import { esEmailValido } from "@/lib/sanitize";
import { cancelarCita, bloquearDia, desbloquearDia } from "@/lib/citas";
import { avisarCancelacion } from "@/lib/correo-agenda";

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

/** Borra un presupuesto del historial. El panel pide confirmacion antes. */
export async function borrarPresupuesto(id: string): Promise<boolean> {
  await exigirAcceso();
  return typeof id === "string" && eliminarPresupuesto(id);
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
  return enviarPresupuestoPorCorreo({ ...datos, conIva: datos.conIva !== false });
}

export async function reabrirSolicitud(id: string): Promise<boolean> {
  await exigirAcceso();
  return typeof id === "string" && cambiarEstado(id, "nueva");
}

/**
 * Cancela una hora de la agenda: queda libre en la web y al cliente le llega
 * el aviso, que tambien la saca de su calendario.
 */
export async function cancelarHora(id: string): Promise<{ ok: boolean; correo: boolean }> {
  await exigirAcceso();
  if (typeof id !== "string") return { ok: false, correo: false };
  const cita = await cancelarCita(id);
  if (!cita) return { ok: false, correo: false };
  const aviso = await avisarCancelacion(cita);
  return { ok: true, correo: aviso.cliente };
}

/** Cierra un dia completo en la agenda publica (vacaciones, un imprevisto). */
export async function cerrarDia(fecha: string, motivo: string): Promise<boolean> {
  await exigirAcceso();
  return typeof fecha === "string" && bloquearDia(fecha, typeof motivo === "string" ? motivo : "");
}

export async function abrirDia(fecha: string): Promise<boolean> {
  await exigirAcceso();
  return typeof fecha === "string" && desbloquearDia(fecha);
}
