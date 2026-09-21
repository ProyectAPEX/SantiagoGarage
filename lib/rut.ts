// RUT chileno: formato y digito verificador (modulo 11).

/** Deja solo numeros y K: "16.126.083-5" -> "161260835" */
export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

/** Digito verificador de un cuerpo de RUT. */
export function digitoVerificador(cuerpo: string): string {
  let suma = 0;
  let mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const r = 11 - (suma % 11);
  return r === 11 ? "0" : r === 10 ? "K" : String(r);
}

/** Formatea mientras se escribe: "161260835" -> "16.126.083-5" */
export function formatearRut(rut: string): string {
  const c = limpiarRut(rut).slice(0, 9);
  if (c.length < 2) return c;
  const cuerpo = c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpo}-${c.slice(-1)}`;
}

export function rutValido(rut: string): boolean {
  const c = limpiarRut(rut);
  if (c.length < 8 || !/^\d+[\dK]$/.test(c)) return false;
  return digitoVerificador(c.slice(0, -1)) === c.slice(-1);
}
