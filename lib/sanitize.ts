// Utilidades de sanitización y validación de inputs del usuario

// Caracteres de control e invisibles que no deben viajar en un mensaje:
// C0 (0-31), DEL + C1 (127-159), zero-width y marcas de dirección (8203-8207),
// separadores de línea/párrafo Unicode (8232, 8233) y BOM (65279).
function esCaracterInvisible(codigo: number): boolean {
  return (
    codigo < 32 ||
    (codigo >= 127 && codigo <= 159) ||
    (codigo >= 8203 && codigo <= 8207) ||
    codigo === 8232 ||
    codigo === 8233 ||
    codigo === 65279
  );
}

/**
 * Limpia texto libre: elimina caracteres de control e invisibles,
 * colapsa espacios repetidos y limita la longitud.
 */
export function limpiarTexto(texto: string, max = 500): string {
  return Array.from(texto)
    .filter((ch) => !esCaracterInvisible(ch.codePointAt(0) ?? 0))
    .join("")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);
}

/** Teléfono chileno o internacional: dígitos, +, espacios, paréntesis y guiones. */
export function esTelefonoValido(telefono: string): boolean {
  return /^\+?[\d\s().-]{8,16}$/.test(telefono.trim());
}

/** Validación de email razonable (no exhaustiva, pero bloquea basura obvia). */
export function esEmailValido(email: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,190}\.[A-Za-z]{2,}$/.test(email.trim());
}
