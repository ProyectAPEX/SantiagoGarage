import "server-only";
import { citasSinRecordatorio, anotarRecordatorio, obtenerCita, confirmarAsistencia, cancelarCita } from "@/lib/citas";
import { avisarCancelacion } from "@/lib/correo-agenda";
import { whatsappConfigurado, enviarRecordatorio, enviarTexto } from "@/lib/whatsapp";
import { fechaLarga, hoyEnChile, sumarDias } from "@/lib/agenda";
import { telefonoWhatsApp, SITE_URL } from "@/lib/site";

/**
 * Recordatorio por WhatsApp el dia antes de cada hora, con botones Confirmo y
 * Cancelar, y lo que pasa cuando el cliente toca uno.
 */

export type ResultadoRecordatorios = { enviados: number; fallidos: number; sinCelular: number };

/**
 * Le manda el recordatorio a cada hora confirmada de mañana que todavia no lo
 * tiene. Lo llama la tarea diaria (/api/latido); llamarla dos veces no manda
 * dos veces, porque cada hora queda anotada al salir su mensaje.
 */
export async function enviarRecordatorios(): Promise<ResultadoRecordatorios> {
  const resultado = { enviados: 0, fallidos: 0, sinCelular: 0 };
  if (!whatsappConfigurado()) return resultado;

  const manana = sumarDias(hoyEnChile(), 1);
  for (const c of await citasSinRecordatorio(manana)) {
    const para = telefonoWhatsApp(c.telefono);
    if (!para) {
      resultado.sinCelular++;
      continue;
    }
    const idMeta = await enviarRecordatorio({ para, nombre: c.nombre, dia: fechaLarga(c.fecha), hora: c.hora, citaId: c.id });
    if (idMeta) {
      await anotarRecordatorio(c.id, idMeta);
      resultado.enviados++;
    } else {
      resultado.fallidos++;
    }
  }
  if (resultado.enviados || resultado.fallidos || resultado.sinCelular) {
    console.log(`[whatsapp] recordatorios de ${manana}:`, JSON.stringify(resultado));
  }
  return resultado;
}

const primerNombre = (nombre: string) => nombre.split(" ")[0] || nombre;

/**
 * El cliente toco un boton del recordatorio. `desde` es su numero segun
 * WhatsApp y `boton` lo que lleva escondido el boton (confirmar:<id> o
 * cancelar:<id>). Devuelve lo que se hizo, para el registro.
 */
export async function responderBoton(desde: string, boton: string): Promise<string> {
  const [accion, id] = boton.split(":");
  if ((accion !== "confirmar" && accion !== "cancelar") || !id) return "botón desconocido";

  const cita = await obtenerCita(id);
  // Solo responde la persona a la que se le mando el recordatorio
  if (!cita || telefonoWhatsApp(cita.telefono) !== desde) return "la hora no corresponde a ese número";

  const nombre = primerNombre(cita.nombre);
  const cuando = `${fechaLarga(cita.fecha)} a las ${cita.hora}`;

  if (cita.estado !== "confirmada") {
    await enviarTexto(desde, `Hola ${nombre}. Tu hora del ${cuando} ya estaba cancelada. Si quieres otra, puedes agendar en ${SITE_URL}/agendar`);
    return "ya estaba cancelada";
  }

  if (accion === "confirmar") {
    await confirmarAsistencia(cita.id);
    await enviarTexto(desde, `¡Perfecto, ${nombre}! Tu asistencia quedó confirmada. Te esperamos el ${cuando}.`);
    return "confirmada";
  }

  const cancelada = await cancelarCita(cita.id);
  if (!cancelada) return "no se pudo cancelar";
  await Promise.all([
    avisarCancelacion(cancelada, true), // correo al cliente y al taller, y la saca de los calendarios
    enviarTexto(
      desde,
      `Listo, ${nombre}. Cancelamos tu hora del ${cuando}. Si quieres otra, puedes agendar en ${SITE_URL}/agendar`
    ),
  ]);
  return "cancelada";
}
