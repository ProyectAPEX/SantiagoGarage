import "server-only";

/**
 * Lee una variable de entorno limpiando espacios y comillas de los extremos.
 *
 * Pasa seguido: se pega una clave en Vercel con las comillas que llevaba en el
 * .env, o con un espacio que se arrastró al copiar, y despues nadie entiende
 * por que "la clave correcta" no funciona. Ya nos pasó con la del panel y con
 * la del correo.
 *
 * Solo se limpian los extremos: si el valor lleva comillas o espacios adentro,
 * quedan intactos.
 */
export function variable(nombre: string): string {
  return (process.env[nombre] ?? "").trim().replace(/^(['"])([\s\S]*)\1$/, "$2");
}
