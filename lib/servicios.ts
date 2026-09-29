/**
 * Servicios del taller, en un solo lugar: los usa la pagina de servicios (con
 * foto) y la portada (solo texto). Si se agrega uno, aparece en las dos.
 */

export type Servicio = {
  n: string;
  slug: string;
  name: string;
  tag: string;
  desc: string;
  img: string;
};

export const SERVICIOS: Servicio[] = [
  {
    n: "01",
    slug: "desabolladura",
    name: "Desabolladura de Precisión",
    tag: "Estándar de fábrica",
    desc: "Restauración estructural de paneles preservando las líneas originales del fabricante. Mínimo uso de rellenos, máxima fidelidad estructural. Herramientas de última generación para resultados de fábrica.",
    img: "/desabolladura.jpg",
  },
  {
    n: "02",
    slug: "pintura",
    name: "Pintura de Alta Gama",
    tag: "PPG & Glasurit",
    desc: "Pintura al horno con secado a temperatura controlada — equipamiento que muy pocos talleres tienen. Laboratorio computarizado de color y aplicación en cabina presurizada con pinturas PPG y Glasurit.",
    img: "https://plus.unsplash.com/premium_photo-1661750334379-2f2b4b1f6ef4?w=800&q=80",
  },
  {
    n: "03",
    slug: "plasticos",
    name: "Reparación de Plásticos",
    tag: "Recuperación técnica",
    desc: "Soldadura estructural en parachoques y molduras. Evitamos reemplazos costosos recuperando la geometría y resistencia original de cada pieza plástica.",
    img: "https://images.unsplash.com/photo-1632823639409-ce060d5a54cc?w=800&q=80",
  },
  {
    n: "04",
    slug: "pulido",
    name: "Pulido Espejo & Detailing",
    tag: "Acabado showroom",
    desc: "Corrección multietapa del barniz. Eliminamos microrayaduras, marcas de pulidor y oxidación superficial. Brillo profundo y nítido con resultado nivel showroom.",
    img: "https://images.unsplash.com/photo-1708805282706-f44730b7e527?w=800&q=80",
  },
  {
    n: "05",
    slug: "diagnostico",
    name: "Diagnóstico Digital",
    tag: "Seguridad activa",
    desc: "Scanner multimarca post-reparación. Verificamos sensores de proximidad, sistemas ADAS y cámaras. Tu vehículo sale con todos los sistemas electrónicos activos y calibrados.",
    img: "https://images.unsplash.com/photo-1727893380169-4dda123e19f7?w=800&q=80",
  },
  {
    n: "06",
    slug: "siniestros",
    name: "Gestión de Siniestros",
    tag: "Asesoría integral",
    desc: "Asesoría completa para particulares y asegurados. Facilitamos presupuestos, peritajes y coordinación directa con todas las aseguradoras del mercado.",
    img: "https://images.unsplash.com/photo-1687867451910-28941a460f35?w=800&q=80",
  },
];
