import { TELEFONO_VISIBLE, INSTAGRAM } from "@/lib/site";

export type ItemTrabajo = { descripcion: string; precio: number };

export type Presupuesto = {
  numero: string;
  fecha: string;
  cliente: { nombre: string; rut: string; telefono: string; domicilio: string; comuna: string };
  vehiculo: { marca: string; modelo: string; patente: string; anio: string; color: string };
  items: ItemTrabajo[];
  descuento: number;
  plazoDias: string;
  validezDias: string;
  observaciones: string;
};

const ROJO: [number, number, number] = [208, 2, 27];
const TINTA: [number, number, number] = [22, 24, 29];
const GRIS: [number, number, number] = [110, 110, 112];
const LINEA: [number, number, number] = [170, 170, 172];

const SERVICIOS_CABECERA = [
  "PINTURA AL HORNO",
  "PINTURA DE LLANTAS",
  "PULIDO 3M",
  "RECUPERACIÓN DE PARACHOQUES",
  "DESABOLLADURA DE ALUMINIO Y SOLDADURAS",
];

/** Formato de moneda chilena: $1.234.567 */
export function formatCLP(n: number): string {
  return "$" + Math.round(n || 0).toLocaleString("es-CL");
}

/** IVA en Chile. Se aplica sobre el neto, despues del descuento. */
export const TASA_IVA = 0.19;

export function calcularTotales(items: ItemTrabajo[], descuento: number) {
  const subtotal = items.reduce((acc, i) => acc + (Number(i.precio) || 0), 0);
  const desc = Number(descuento) || 0;
  const neto = Math.max(0, subtotal - desc);
  const iva = Math.round(neto * TASA_IVA);
  return { subtotal, descuento: desc, neto, iva, total: neto + iva };
}

async function cargarLogo(): Promise<string | null> {
  try {
    const res = await fetch("/logo-pdf.jpg");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = () => resolve(null as unknown as string);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generarPresupuestoPDF(p: Presupuesto): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const M = 12;
  const W = 210;
  const ANCHO = W - M * 2;
  let y = M;

  // ——— Helpers ———
  const banda = (titulo: string, yy: number, alto = 6.5) => {
    doc.setFillColor(...TINTA);
    doc.rect(M, yy, ANCHO, alto, "F");
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(255, 255, 255);
    doc.text(titulo.toUpperCase(), M + 3, yy + alto - 2);
    return yy + alto;
  };

  /** Campo estilo talonario: ETIQUETA: valor sobre linea punteada */
  const campo = (etiqueta: string, valor: string, x: number, yy: number, ancho: number) => {
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...TINTA);
    doc.text(etiqueta.toUpperCase() + ":", x, yy);
    const dx = doc.getTextWidth(etiqueta.toUpperCase() + ":") + 2;
    doc.setFont("helvetica", "normal").setFontSize(9.5);
    doc.text(valor || "", x + dx, yy);
    doc.setDrawColor(...LINEA).setLineWidth(0.2);
    doc.line(x + dx - 1, yy + 1.2, x + ancho, yy + 1.2);
  };

  // ——— CABECERA ———
  const logo = await cargarLogo();
  if (logo) {
    // proporcion real del recorte: 900x272
    const anchoLogo = 86;
    doc.addImage(logo, "JPEG", M, y, anchoLogo, anchoLogo * (272 / 900));
  } else {
    doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...TINTA);
    doc.text("SANTIAGO GARAGE", M, y + 10);
  }

  // Datos de contacto a la derecha
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...TINTA);
  doc.text("URETA COX 1038, SAN MIGUEL", W - M, y + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(TELEFONO_VISIBLE, W - M, y + 11, { align: "right" });
  doc.text("santiagogarage.cl", W - M, y + 16, { align: "right" });
  doc.text(`Instagram: ${INSTAGRAM}`, W - M, y + 21, { align: "right" });

  y += 31;

  // Lista de servicios en una linea, como el encabezado del talonario
  doc.setFont("helvetica", "bold").setFontSize(7).setTextColor(...GRIS);
  doc.text(SERVICIOS_CABECERA.join("   ·   "), M, y);
  y += 3.5;

  doc.setDrawColor(...ROJO).setLineWidth(1);
  doc.line(M, y, W - M, y);
  y += 6;

  // ——— TÍTULO + N° + FECHA ———
  doc.setFont("helvetica", "bold").setFontSize(15).setTextColor(...TINTA);
  doc.text("PRESUPUESTO", M, y + 1);
  doc.setFontSize(9).setTextColor(...GRIS);
  doc.text(`N° ${p.numero}`, W - M, y - 2.5, { align: "right" });
  doc.setFont("helvetica", "bold").setTextColor(...TINTA);
  doc.text(`FECHA: ${p.fecha}`, W - M, y + 2, { align: "right" });
  y += 7;

  // ——— DATOS DEL CLIENTE Y VEHÍCULO ———
  y = banda("Datos del cliente y vehículo", y) + 7;

  const mitad = ANCHO / 2;
  campo("Cliente", p.cliente.nombre, M, y, mitad - 4);
  campo("RUT", p.cliente.rut, M + mitad, y, mitad);
  y += 8;
  campo("Domicilio", p.cliente.domicilio, M, y, mitad - 4);
  campo("Comuna", p.cliente.comuna, M + mitad, y, mitad);
  y += 8;
  campo("Marca", p.vehiculo.marca, M, y, mitad - 4);
  campo("Modelo", p.vehiculo.modelo, M + mitad, y, mitad);
  y += 8;
  campo("Color", p.vehiculo.color, M, y, 40);
  campo("Patente", p.vehiculo.patente.toUpperCase(), M + 46, y, 34);
  campo("Año", p.vehiculo.anio, M + 86, y, 22);
  campo("Teléfono", p.cliente.telefono, M + 114, y, ANCHO - 114);
  y += 9;

  // ——— TABLA DE TRABAJOS ———
  y = banda("Detalle de trabajos", y);

  const xPrecio = W - M - 34; // inicio columna precio
  const altoFila = 7.2;

  // Encabezado de columnas
  doc.setFillColor(238, 236, 232);
  doc.rect(M, y, ANCHO, 6, "F");
  doc.setFont("helvetica", "bold").setFontSize(7.5).setTextColor(...TINTA);
  doc.text("DESCRIPCIÓN", M + 3, y + 4);
  doc.text("VALOR", W - M - 3, y + 4, { align: "right" });
  y += 6;

  const yInicioTabla = y;
  const yMaxTabla = 212; // deja espacio para totales, observaciones y pie

  const visibles = p.items.filter((i) => i.descripcion.trim() || i.precio);
  const filasDisponibles = Math.floor((yMaxTabla - yInicioTabla) / altoFila);

  doc.setDrawColor(...LINEA).setLineWidth(0.2);

  for (let f = 0; f < filasDisponibles; f++) {
    const item = visibles[f];
    const yFila = yInicioTabla + f * altoFila;

    if (item) {
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...TINTA);
      const lineas = doc.splitTextToSize(item.descripcion, ANCHO - 42) as string[];
      doc.text(lineas.slice(0, 1), M + 3, yFila + 4.8);
      doc.setFont("helvetica", "bold");
      doc.text(formatCLP(item.precio), W - M - 3, yFila + 4.8, { align: "right" });
    }
    // grilla
    doc.line(M, yFila + altoFila, W - M, yFila + altoFila);
  }

  const yFinTabla = yInicioTabla + filasDisponibles * altoFila;
  // bordes exteriores + separador de columna
  doc.setLineWidth(0.35).setDrawColor(...TINTA);
  doc.rect(M, yInicioTabla - 6, ANCHO, filasDisponibles * altoFila + 6, "S");
  doc.setLineWidth(0.2).setDrawColor(...LINEA);
  doc.line(xPrecio, yInicioTabla - 6, xPrecio, yFinTabla);

  if (visibles.length > filasDisponibles) {
    doc.setFont("helvetica", "italic").setFontSize(7).setTextColor(...ROJO);
    doc.text(`+ ${visibles.length - filasDisponibles} trabajo(s) adicionales`, M + 3, yFinTabla + 4);
  }

  y = yFinTabla + 2;

  // ——— TOTALES ———
  const { subtotal, descuento, iva, total } = calcularTotales(p.items, p.descuento);
  const xEtiq = xPrecio - 34;

  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...GRIS);
  doc.text("SUBTOTAL", xEtiq, y + 5);
  doc.setTextColor(...TINTA);
  doc.text(formatCLP(subtotal), W - M - 3, y + 5, { align: "right" });
  y += 5.5;

  if (descuento > 0) {
    doc.setTextColor(...GRIS);
    doc.text("DESCUENTO", xEtiq, y + 5);
    doc.setTextColor(...ROJO);
    doc.text("-" + formatCLP(descuento), W - M - 3, y + 5, { align: "right" });
    y += 5.5;
  }

  doc.setTextColor(...GRIS);
  doc.text(`IVA (${Math.round(TASA_IVA * 100)}%)`, xEtiq, y + 5);
  doc.setTextColor(...TINTA);
  doc.text(formatCLP(iva), W - M - 3, y + 5, { align: "right" });
  y += 5.5;

  y += 1.5;
  doc.setFillColor(...TINTA);
  doc.rect(xEtiq - 4, y, W - M - (xEtiq - 4), 10, "F");
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(255, 255, 255);
  doc.text("TOTAL", xEtiq, y + 6.8);
  doc.text(formatCLP(total), W - M - 3, y + 6.8, { align: "right" });
  y += 14;

  // ——— OBSERVACIONES ———
  y = banda("Observaciones", y) + 1;
  doc.setDrawColor(...LINEA).setLineWidth(0.2);
  const obs = doc.splitTextToSize(p.observaciones || "", ANCHO - 6) as string[];
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...TINTA);
  for (let i = 0; i < 3; i++) {
    const yl = y + 5 + i * 5.5;
    if (obs[i]) doc.text(obs[i], M + 3, yl - 1.2);
    doc.line(M, yl, W - M, yl);
  }
  y += 19;

  // ——— CONDICIONES ———
  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...TINTA);
  const cond: string[] = [];
  if (p.plazoDias) cond.push(`Plazo estimado: ${p.plazoDias} días hábiles`);
  if (p.validezDias) cond.push(`Validez del presupuesto: ${p.validezDias} días`);
  if (cond.length) doc.text(cond.join("   ·   "), M, y);

  // ——— PIE ———
  const yPie = 285;
  doc.setDrawColor(...LINEA).setLineWidth(0.3);
  doc.line(M, yPie - 6, W - M, yPie - 6);
  doc.setFont("helvetica", "bold").setFontSize(7.5).setTextColor(...TINTA);
  doc.text("MEDIOS DE PAGO: DÉBITO · CRÉDITO · TRANSFERENCIA · EFECTIVO", M, yPie - 2);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...GRIS);
  doc.text("Santiago Garage SPA", W - M, yPie + 2, { align: "right" });

  return doc.output("blob");
}
