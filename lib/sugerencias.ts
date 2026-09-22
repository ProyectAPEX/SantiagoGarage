/**
 * Buscador de las listas que ayudan a llenar el presupuesto (marcas, modelos,
 * colores, comunas). Sin texto no sugiere nada: la lista aparece al escribir.
 */

export type Sugerencia = { texto: string; detalle?: string };

/** Sin tildes ni mayusculas: "Ñuñoa" y "nunoa" se buscan igual. */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/**
 * Ordena por que tan al principio calza lo escrito: primero lo que empieza
 * igual, despues lo que tiene una palabra que empieza igual, al final lo que
 * solo lo contiene.
 */
export function filtrar(opciones: Sugerencia[], texto: string, tope = 8): Sugerencia[] {
  const q = normalizar(texto);
  if (!q) return [];
  const puntaje = (s: Sugerencia) => {
    const n = normalizar(s.texto);
    if (n.startsWith(q)) return 0;
    if (n.split(/[\s-]+/).some((p) => p.startsWith(q))) return 1;
    if (n.includes(q)) return 2;
    return -1;
  };
  return opciones
    .map((s) => ({ s, p: puntaje(s) }))
    .filter((x) => x.p >= 0)
    .sort((a, b) => a.p - b.p || a.s.texto.localeCompare(b.s.texto))
    .slice(0, tope)
    .map((x) => x.s);
}
