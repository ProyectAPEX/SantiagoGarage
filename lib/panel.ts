/**
 * Ruta secreta del panel interno. Debe coincidir con el nombre de la carpeta
 * en app/.
 *
 * Vive aparte de lib/site.ts a proposito: site.ts lo importan componentes que
 * se mandan al navegador, y la ruta no debe llegar nunca al JavaScript publico.
 * Solo se importa desde codigo de servidor (proxy, paginas y acciones del
 * panel). Tampoco se nombra en robots.txt.
 */
export const RUTA_PANEL = "/gestion-c3da7f";

/** Comparacion en tiempo constante: no filtra por cuanto tarda en fallar. */
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Valida la cabecera Authorization (HTTP Basic) contra PANEL_USUARIO y
 * PANEL_CLAVE. Sin credenciales configuradas, nadie entra.
 */
export function credencialesValidas(authorization: string | null): boolean {
  const usuario = process.env.PANEL_USUARIO;
  const clave = process.env.PANEL_CLAVE;
  if (!usuario || !clave || !authorization) return false;

  const [tipo, valor] = authorization.split(" ");
  if (tipo !== "Basic" || !valor) return false;
  try {
    const decodificado = atob(valor);
    const i = decodificado.indexOf(":");
    if (i < 1) return false;
    // ambas comparaciones siempre, para que el tiempo no delate cual fallo
    const okUsuario = iguales(decodificado.slice(0, i), usuario);
    const okClave = iguales(decodificado.slice(i + 1), clave);
    return okUsuario && okClave;
  } catch {
    return false;
  }
}
