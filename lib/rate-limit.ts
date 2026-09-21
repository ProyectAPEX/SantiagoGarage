// Rate limiter en memoria, por clave (ventana fija). Mismo esquema que Ulloa.
// Corre en el proxy. En serverless cada instancia tiene su propia memoria:
// es "mejor esfuerzo", suficiente para frenar abuso casual y fuerza bruta.

interface Ventana {
  count: number;
  resetAt: number;
}

const ventanas = new Map<string, Ventana>();
const MAX_ENTRADAS = 5000; // tope de memoria: al llegar, se purga lo vencido

function purgar(ahora: number) {
  if (ventanas.size < MAX_ENTRADAS) return;
  for (const [k, v] of ventanas) if (v.resetAt <= ahora) ventanas.delete(k);
}

/**
 * true si la peticion esta DENTRO del limite.
 * @param clave     identificador unico, p. ej. `solicitud:${ip}`
 * @param limite    peticiones permitidas por ventana
 * @param ventanaMs duracion de la ventana
 */
export function permitir(clave: string, limite: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  purgar(ahora);
  const v = ventanas.get(clave);
  if (!v || v.resetAt <= ahora) {
    ventanas.set(clave, { count: 1, resetAt: ahora + ventanaMs });
    return true;
  }
  v.count += 1;
  return v.count <= limite;
}

/** IP del cliente detras del CDN (Vercel pone x-forwarded-for). */
export function ipDesde(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  return (xff ? xff.split(",")[0].trim() : "") || headers.get("x-real-ip") || "local";
}
