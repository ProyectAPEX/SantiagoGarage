/**
 * Servicios del taller. Encabezan la descripcion de cada trabajo para no
 * escribirla entera; el detalle sigue siendo texto libre.
 */

/** Para lo que no está en la lista: el detalle se escribe entero a mano. */
export const OTRO = "Otro";

export const SERVICIOS = [
  "Desabolladura y pintura",
  "Desabolladura sin pintura",
  "Pintura",
  "Pulido y detailing",
  "Reparación de plásticos",
  "Cambio de pieza",
  "Pintura de llantas",
  "Diagnóstico digital",
  "Gestión de siniestro",
  OTRO,
] as const;
