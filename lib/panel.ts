/**
 * Ruta secreta del panel interno. Debe coincidir con el nombre de la carpeta
 * en app/.
 *
 * Vive aparte de lib/site.ts a proposito: site.ts lo importan componentes que
 * se mandan al navegador, y la ruta no debe llegar nunca al JavaScript publico.
 * Solo la importa proxy.ts (servidor). Tampoco se nombra en robots.txt.
 */
export const RUTA_PANEL = "/gestion-c3da7f";
