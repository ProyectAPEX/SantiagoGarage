import "server-only";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { COOKIE_PANEL, accesoLibre, sesionValida } from "@/lib/panel";

/**
 * Segunda barrera del panel, dentro del servidor.
 *
 * El proxy ya exige la sesion para entrar a la ruta secreta. Pero las acciones
 * del servidor son endpoints publicos que se pueden llamar desde cualquier
 * ruta del sitio, asi que cada una vuelve a verificar aqui. Sin sesion valida
 * responde 404, igual que una pagina que no existe.
 */
export async function exigirAcceso(): Promise<void> {
  if (accesoLibre()) return;
  const galletas = await cookies();
  if (!(await sesionValida(galletas.get(COOKIE_PANEL)?.value))) notFound();
}
