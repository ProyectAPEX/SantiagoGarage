import "server-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { credencialesValidas } from "@/lib/panel";

/**
 * Segunda barrera del panel, dentro del servidor.
 *
 * El proxy ya exige la clave para entrar a la ruta secreta. Pero las acciones
 * del servidor son endpoints publicos que se pueden llamar desde cualquier
 * ruta del sitio, asi que cada una vuelve a verificar aqui. Sin clave valida
 * responde 404, igual que una pagina que no existe.
 */
export async function exigirAcceso(): Promise<void> {
  const h = await headers();
  if (!credencialesValidas(h.get("authorization"))) notFound();
}
