import { TELEFONO_VISIBLE, EMAIL_CONTACTO } from "@/lib/site";

export type ItemTrabajo = { descripcion: string; precio: number };

export type Presupuesto = {
  numero: string;
  fecha: string;
  cliente: { nombre: string; telefono: string };
  vehiculo: { marca: string; patente: string; anio: string; color: string };
  items: ItemTrabajo[];
  descuento: number;
  plazoDias: string;
  validezDias: string;
  observaciones: string;
};

const ROJO: [number, number, number] = [208, 2, 27];
const TINTA: [number, number, number] = [22, 24, 29];
const GRIS: [number, number, number] = [107, 114, 128];
const LINEA: [number, number, number] = [225, 222, 217];

/** Formato de moneda chilena: $1.234.567 */
export function formatCLP(n: number): string {
  return "$" + Math.round(n || 0).toLocaleString("es-CL");
}

export function calcularTotales(items: ItemTrabajo[], descuento: number) {
  const subtotal = items.reduce((acc, i) => acc + (Number(i.precio) || 0), 0);
  const desc = Number(descuento) || 0;
  return { subtotal, descuento: desc, total: Math.max(0, subtotal - desc) };
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

  const M = 15; // margen
  const W = 210; // ancho A4
  const ANCHO = W - M * 2;
  let y = M;

  // ——— ENCABEZADO ———
  const logo = await cargarLogo();
  if (logo) {
    // proporción original 700x467
    doc.addImage(logo, "JPEG", M, y, 52, 34.7);
  } else {
    doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...TINTA);
    doc.text("SANTIAGO GARAGE", M, y + 10);
  }

  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...TINTA);
  doc.text("PRESUPUESTO", W - M, y + 8, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...GRIS);
  doc.text(`N° ${p.numero}`, W - M, y + 15, { align: "right" });
  doc.text(p.fecha, W - M, y + 20, { align: "right" });

  y += 40;

  // Datos del taller
  doc.setFontSize(8.5).setTextColor(...GRIS);
  doc.text(
    `Santiago Garage SPA · Ureta Cox 1038, San Miguel, Santiago · ${TELEFONO_VISIBLE} · ${EMAIL_CONTACTO}`,
    M,
    y
  );
  y += 5;
  doc.setDrawColor(...ROJO).setLineWidth(0.8);
  doc.line(M, y, W - M, y);
  y += 9;

  // ——— CLIENTE Y VEHÍCULO ———
  const colW = ANCHO / 2;
  const etiqueta = (txt: string, x: number, yy: number) => {
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...ROJO);
    doc.text(txt.toUpperCase(), x, yy);
  };
  const valor = (txt: string, x: number, yy: number) => {
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...TINTA);
    doc.text(txt || "—", x, yy);
  };

  etiqueta("Cliente", M, y);
  etiqueta("Vehículo", M + colW, y);
  y += 5.5;
  valor(p.cliente.nombre, M, y);
  valor(p.vehiculo.marca, M + colW, y);
  y += 5.5;
  valor(p.cliente.telefono, M, y);
  const detalleVeh = [p.vehiculo.anio, p.vehiculo.color].filter(Boolean).join(" · ");
  valor(detalleVeh, M + colW, y);
  y += 5.5;
  if (p.vehiculo.patente) {
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...TINTA);
    doc.text(`Patente: ${p.vehiculo.patente.toUpperCase()}`, M + colW, y);
    y += 5.5;
  }

  y += 5;

  // ——— DETALLE DE TRABAJOS ———
  etiqueta("Detalle de trabajos", M, y);
  y += 4;
  doc.setDrawColor(...LINEA).setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  const colPrecio = W - M;
  const anchoDesc = ANCHO - 35;

  p.items.forEach((item, i) => {
    if (!item.descripcion && !item.precio) return;
    // salto de página si no cabe
    if (y > 250) {
      doc.addPage();
      y = M;
    }
    const lineas = doc.splitTextToSize(item.descripcion || "—", anchoDesc) as string[];
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...TINTA);
    doc.text(lineas, M, y);
    doc.setFont("helvetica", "bold");
    doc.text(formatCLP(item.precio), colPrecio, y, { align: "right" });
    y += lineas.length * 5 + 3;
    if (i < p.items.length - 1) {
      doc.setDrawColor(...LINEA).setLineWidth(0.2);
      doc.line(M, y - 1.5, W - M, y - 1.5);
    }
  });

  y += 4;
  doc.setDrawColor(...LINEA).setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 7;

  // ——— TOTALES ———
  const { subtotal, descuento, total } = calcularTotales(p.items, p.descuento);
  const xEtiqueta = W - M - 45;

  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...GRIS);
  doc.text("Subtotal", xEtiqueta, y);
  doc.setTextColor(...TINTA);
  doc.text(formatCLP(subtotal), colPrecio, y, { align: "right" });
  y += 6;

  if (descuento > 0) {
    doc.setTextColor(...GRIS);
    doc.text("Descuento", xEtiqueta, y);
    doc.setTextColor(...ROJO);
    doc.text("-" + formatCLP(descuento), colPrecio, y, { align: "right" });
    y += 6;
  }

  doc.setFillColor(...TINTA);
  doc.rect(xEtiqueta - 5, y - 4.5, W - M - xEtiqueta + 5, 11, "F");
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(255, 255, 255);
  doc.text("TOTAL", xEtiqueta, y + 2.5);
  doc.text(formatCLP(total), colPrecio - 2, y + 2.5, { align: "right" });
  y += 16;

  // ——— CONDICIONES ———
  if (p.plazoDias || p.validezDias || p.observaciones) {
    etiqueta("Condiciones", M, y);
    y += 6;
    doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...TINTA);
    if (p.plazoDias) {
      doc.text(`Plazo estimado de entrega: ${p.plazoDias} días hábiles`, M, y);
      y += 5;
    }
    if (p.validezDias) {
      doc.text(`Presupuesto válido por ${p.validezDias} días desde su emisión.`, M, y);
      y += 5;
    }
    if (p.observaciones) {
      const obs = doc.splitTextToSize(p.observaciones, ANCHO) as string[];
      doc.text(obs, M, y);
      y += obs.length * 5;
    }
    y += 4;
  }

  // ——— PIE ———
  const yPie = 275;
  doc.setDrawColor(...LINEA).setLineWidth(0.3);
  doc.line(M, yPie, W - M, yPie);
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...TINTA);
  doc.text("Medios de pago: Débito · Crédito · Transferencia · Efectivo", M, yPie + 5);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...GRIS);
  doc.text(
    "Trabajos con garantía escrita · Pintura al horno · Materiales PPG y Glasurit",
    M,
    yPie + 10
  );
  doc.text("santiagogarage.cl", W - M, yPie + 10, { align: "right" });

  return doc.output("blob");
}
