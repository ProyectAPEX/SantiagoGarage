/**
 * Ruta secreta del panel interno. Debe coincidir con el nombre de la carpeta
 * en app/.
 *
 * Vive aparte de lib/site.ts a proposito: site.ts lo importan componentes que
 * se mandan al navegador, y la ruta no debe llegar nunca al JavaScript publico.
 * Solo se importa desde codigo de servidor (proxy, paginas, acciones y la API
 * de acceso, que la entrega recien despues de la clave). Tampoco se nombra en
 * robots.txt.
 */
export const RUTA_PANEL = "/gestion-c3da7f";
export const RUTA_ENTRAR = `${RUTA_PANEL}/entrar`;

// ——— Sesion del panel: cookie firmada, mismo esquema que Ulloa SNKR ———
// El token es `<expira>.<firma>` y no lleva la clave adentro. Usa Web Crypto
// para funcionar igual en el proxy y en el servidor.

export const COOKIE_PANEL = "panel_sesion";
export const DURACION_SESION = 60 * 60 * 24 * 7; // 7 dias, en segundos

const enc = new TextEncoder();

/** Sin clave ni secreto configurados, nadie entra (nunca se abre por defecto). */
export function panelConfigurado(): boolean {
  return Boolean(process.env.PANEL_CLAVE && process.env.PANEL_SECRETO);
}

/**
 * En el local (`npm run dev`) el panel se abre sin clave, para probar rapido.
 *
 * NODE_ENV vale "development" SOLO con el servidor de desarrollo: en Vercel y
 * en cualquier build de produccion vale "production", asi que el sitio
 * publicado siempre pide la clave. No hay variable que lo desactive: no se
 * puede dejar abierto en produccion por error.
 */
export function accesoLibre(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * La llave mezcla PANEL_SECRETO con PANEL_CLAVE: si se cambia la clave, todas
 * las sesiones abiertas dejan de valer solas.
 */
async function firmar(dato: string): Promise<string> {
  const llave = await crypto.subtle.importKey(
    "raw",
    enc.encode(`${process.env.PANEL_SECRETO}:${process.env.PANEL_CLAVE}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firma = new Uint8Array(await crypto.subtle.sign("HMAC", llave, enc.encode(dato)));
  return Array.from(firma, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparacion en tiempo constante: no filtra por cuanto tarda en fallar. */
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Se comparan las firmas y no los textos: asi tampoco se filtra el largo de la clave. */
export async function claveCorrecta(clave: string): Promise<boolean> {
  const real = process.env.PANEL_CLAVE;
  if (!panelConfigurado() || !real) return false;
  return iguales(await firmar(`clave:${clave}`), await firmar(`clave:${real}`));
}

export async function crearSesion(): Promise<string> {
  const expira = String(Date.now() + DURACION_SESION * 1000);
  return `${expira}.${await firmar(expira)}`;
}

export async function sesionValida(token: string | null | undefined): Promise<boolean> {
  if (!token || !panelConfigurado()) return false;
  const punto = token.indexOf(".");
  const expira = token.slice(0, punto);
  if (punto < 1 || !/^\d+$/.test(expira) || Date.now() > Number(expira)) return false;
  return iguales(await firmar(expira), token.slice(punto + 1));
}
