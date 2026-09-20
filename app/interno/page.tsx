"use client";
import { useState, useEffect } from "react";
import {
  generarPresupuestoPDF,
  calcularTotales,
  formatCLP,
  type ItemTrabajo,
} from "@/lib/presupuesto-pdf";
import { limpiarTexto, esTelefonoValido } from "@/lib/sanitize";

const vacio = {
  nombre: "",
  rut: "",
  telefono: "",
  marca: "",
  modelo: "",
  anio: "",
  patente: "",
  color: "",
  descuento: "",
  plazoDias: "5",
  validezDias: "15",
  observaciones: "",
};

/** Correlativo guardado en el navegador (comodidad, no dato crítico). */
function siguienteNumero(): string {
  const anio = new Date().getFullYear();
  let n = 1;
  try {
    const guardado = localStorage.getItem("sg_presupuesto_n");
    if (guardado) {
      const [a, c] = guardado.split("-");
      n = Number(a) === anio ? Number(c) + 1 : 1;
    }
  } catch {
    /* modo privado o storage bloqueado: partimos de 1 */
  }
  return `${anio}-${String(n).padStart(4, "0")}`;
}

function guardarNumero(numero: string) {
  try {
    localStorage.setItem("sg_presupuesto_n", numero);
  } catch {
    /* sin storage: el correlativo simplemente no persiste */
  }
}

export default function Interno() {
  const [f, setF] = useState(vacio);
  const [items, setItems] = useState<ItemTrabajo[]>([{ descripcion: "", precio: 0 }]);
  const [numero, setNumero] = useState("—");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [listo, setListo] = useState("");

  useEffect(() => setNumero(siguienteNumero()), []);

  const set = (k: keyof typeof vacio) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const setItem = (i: number, campo: keyof ItemTrabajo, v: string) => {
    const copia = [...items];
    if (campo === "precio") copia[i].precio = Number(v.replace(/\D/g, "")) || 0;
    else copia[i].descripcion = v;
    setItems(copia);
  };

  const totales = calcularTotales(items, Number(f.descuento) || 0);

  function armarDatos() {
    return {
      numero,
      fecha: new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }),
      cliente: {
        nombre: limpiarTexto(f.nombre, 80),
        rut: limpiarTexto(f.rut, 12),
        telefono: limpiarTexto(f.telefono, 17),
      },
      vehiculo: {
        marca: limpiarTexto(f.marca, 40),
        modelo: limpiarTexto(f.modelo, 40),
        patente: limpiarTexto(f.patente, 10),
        anio: limpiarTexto(f.anio, 4),
        color: limpiarTexto(f.color, 25),
      },
      items: items
        .filter((i) => i.descripcion.trim() || i.precio)
        .map((i) => ({ descripcion: limpiarTexto(i.descripcion, 200), precio: i.precio })),
      descuento: Number(f.descuento) || 0,
      plazoDias: limpiarTexto(f.plazoDias, 3),
      validezDias: limpiarTexto(f.validezDias, 3),
      observaciones: limpiarTexto(f.observaciones, 400),
    };
  }

  function validar(): string {
    if (!f.nombre.trim()) return "Falta el nombre del cliente.";
    if (f.telefono && !esTelefonoValido(f.telefono)) return "El teléfono no parece válido.";
    if (!items.some((i) => i.descripcion.trim())) return "Agrega al menos un trabajo.";
    return "";
  }

  async function generar(compartir: boolean) {
    const err = validar();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setOcupado(true);
    setListo("");
    try {
      const datos = armarDatos();
      const blob = await generarPresupuestoPDF(datos);
      const nombreArchivo = `Presupuesto-${datos.numero}-${datos.cliente.nombre.split(" ")[0] || "cliente"}.pdf`;
      const file = new File([blob], nombreArchivo, { type: "application/pdf" });

      const texto = `Hola ${datos.cliente.nombre}, le enviamos el presupuesto N° ${datos.numero} de Santiago Garage por ${formatCLP(totales.total)}. Cualquier duda quedamos atentos.`;

      const puedeCompartir =
        compartir &&
        typeof navigator !== "undefined" &&
        !!navigator.canShare &&
        navigator.canShare({ files: [file] });

      if (puedeCompartir) {
        await navigator.share({ files: [file], title: `Presupuesto ${datos.numero}`, text: texto });
        setListo("Presupuesto compartido.");
      } else {
        // Descarga el PDF y, si hay teléfono, abre WhatsApp para adjuntarlo
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        URL.revokeObjectURL(url);
        if (compartir) {
          const tel = datos.cliente.telefono.replace(/\D/g, "");
          const destino = tel ? `https://wa.me/${tel.startsWith("56") ? tel : "56" + tel}` : "https://wa.me/";
          window.open(`${destino}?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
          setListo("PDF descargado. Adjúntalo en el chat de WhatsApp que se abrió.");
        } else {
          setListo("PDF descargado.");
        }
      }
      guardarNumero(datos.numero);
    } catch {
      setError("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  function nuevo() {
    setF(vacio);
    setItems([{ descripcion: "", precio: 0 }]);
    setNumero(siguienteNumero());
    setError("");
    setListo("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const input =
    "w-full rounded-xl px-4 py-3.5 text-[16px] outline-none border border-[#D5D2CC] bg-white text-[#16181D] focus:border-[#16181D] transition-colors";
  const label = "font-display font-semibold text-[13px] mb-1.5 block text-[#16181D]";

  return (
    <div className="px-5 pb-40" style={{ paddingTop: 32, background: "#F1EFEA", minHeight: "100vh" }}>
      <div className="max-w-[640px] mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <p className="font-display text-[12px] font-medium tracking-[2px] uppercase mb-1" style={{ color: "#D0021B" }}>
            Uso interno
          </p>
          <h1 className="font-display font-bold uppercase text-[30px] leading-none" style={{ letterSpacing: "-1px" }}>
            Nuevo presupuesto
          </h1>
          <p className="text-[14px] mt-2" style={{ color: "#6B7280" }}>
            N° {numero} · {new Date().toLocaleDateString("es-CL")}
          </p>
        </div>

        {/* CLIENTE */}
        <section className="rounded-2xl p-5 mb-4 bg-white border border-[#E8E6E1]">
          <p className="font-display font-bold text-[12px] tracking-[1.5px] uppercase mb-4" style={{ color: "#D0021B" }}>
            Cliente
          </p>
          <div className="mb-4">
            <label className={label} htmlFor="nombre">Nombre</label>
            <input id="nombre" className={input} value={f.nombre} onChange={set("nombre")} placeholder="Nombre del cliente" maxLength={80} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="rut">RUT</label>
              <input id="rut" className={input} value={f.rut} onChange={set("rut")} placeholder="12.345.678-9" maxLength={12} />
            </div>
            <div>
              <label className={label} htmlFor="telefono">WhatsApp</label>
              <input id="telefono" className={input} value={f.telefono} onChange={set("telefono")} placeholder="+56 9 ..." inputMode="tel" maxLength={17} />
            </div>
          </div>
        </section>

        {/* VEHÍCULO */}
        <section className="rounded-2xl p-5 mb-4 bg-white border border-[#E8E6E1]">
          <p className="font-display font-bold text-[12px] tracking-[1.5px] uppercase mb-4" style={{ color: "#D0021B" }}>
            Vehículo
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={label} htmlFor="marca">Marca</label>
              <input id="marca" className={input} value={f.marca} onChange={set("marca")} placeholder="Hyundai" maxLength={40} />
            </div>
            <div>
              <label className={label} htmlFor="modelo">Modelo</label>
              <input id="modelo" className={input} value={f.modelo} onChange={set("modelo")} placeholder="Grand i10" maxLength={40} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label} htmlFor="anio">Año</label>
              <input id="anio" className={input} value={f.anio} onChange={set("anio")} placeholder="2021" inputMode="numeric" maxLength={4} />
            </div>
            <div>
              <label className={label} htmlFor="patente">Patente</label>
              <input id="patente" className={input} value={f.patente} onChange={set("patente")} placeholder="ABCD12" maxLength={10} style={{ textTransform: "uppercase" }} />
            </div>
            <div>
              <label className={label} htmlFor="color">Color</label>
              <input id="color" className={input} value={f.color} onChange={set("color")} placeholder="Blanco" maxLength={25} />
            </div>
          </div>
        </section>

        {/* TRABAJOS */}
        <section className="rounded-2xl p-5 mb-4 bg-white border border-[#E8E6E1]">
          <p className="font-display font-bold text-[12px] tracking-[1.5px] uppercase mb-4" style={{ color: "#D0021B" }}>
            Trabajos a realizar
          </p>
          {items.map((item, i) => (
            <div key={i} className="mb-4 pb-4" style={{ borderBottom: i < items.length - 1 ? "1px solid #F0EEE9" : "none" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-display font-bold text-[13px]" style={{ color: "#D0021B" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    className="text-[13px] font-medium px-2 py-1"
                    style={{ color: "#9CA3AF" }}
                  >
                    Quitar
                  </button>
                )}
              </div>
              <textarea
                className={input + " mb-3"}
                rows={2}
                value={item.descripcion}
                onChange={(e) => setItem(i, "descripcion", e.target.value)}
                placeholder="Ej: Desabolladura y pintura de puerta trasera derecha"
                maxLength={200}
                style={{ resize: "vertical" }}
              />
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[17px]" style={{ color: "#6B7280" }}>$</span>
                <input
                  className={input}
                  value={item.precio ? item.precio.toLocaleString("es-CL") : ""}
                  onChange={(e) => setItem(i, "precio", e.target.value)}
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems([...items, { descripcion: "", precio: 0 }])}
            className="font-display font-semibold text-[14px] w-full py-3.5 rounded-xl border border-dashed"
            style={{ borderColor: "#D5D2CC", color: "#16181D" }}
          >
            + Agregar trabajo
          </button>
        </section>

        {/* CONDICIONES */}
        <section className="rounded-2xl p-5 mb-4 bg-white border border-[#E8E6E1]">
          <p className="font-display font-bold text-[12px] tracking-[1.5px] uppercase mb-4" style={{ color: "#D0021B" }}>
            Condiciones
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={label} htmlFor="descuento">Descuento</label>
              <input id="descuento" className={input} value={f.descuento} onChange={set("descuento")} placeholder="0" inputMode="numeric" />
            </div>
            <div>
              <label className={label} htmlFor="plazo">Plazo (días)</label>
              <input id="plazo" className={input} value={f.plazoDias} onChange={set("plazoDias")} inputMode="numeric" maxLength={3} />
            </div>
          </div>
          <div className="mb-4">
            <label className={label} htmlFor="validez">Validez del presupuesto (días)</label>
            <input id="validez" className={input} value={f.validezDias} onChange={set("validezDias")} inputMode="numeric" maxLength={3} />
          </div>
          <div>
            <label className={label} htmlFor="obs">Observaciones</label>
            <textarea id="obs" className={input} rows={3} value={f.observaciones} onChange={set("observaciones")} placeholder="Notas para el cliente (opcional)" maxLength={400} style={{ resize: "vertical" }} />
          </div>
        </section>

        {error && (
          <p role="alert" className="text-center text-[14px] font-semibold mb-3" style={{ color: "#D0021B" }}>
            {error}
          </p>
        )}
        {listo && (
          <p role="status" className="text-center text-[14px] font-semibold mb-3" style={{ color: "#16181D" }}>
            {listo} <button onClick={nuevo} className="underline ml-1">Nuevo presupuesto</button>
          </p>
        )}
      </div>

      {/* BARRA FIJA: total + acciones */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 py-4 z-40"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid #E8E6E1" }}
      >
        <div className="max-w-[640px] mx-auto">
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-display font-semibold text-[13px] uppercase tracking-[1px]" style={{ color: "#6B7280" }}>
              Total
            </span>
            <span className="font-display font-bold text-[26px] leading-none" style={{ color: "#16181D" }}>
              {formatCLP(totales.total)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => generar(false)}
              disabled={ocupado}
              className="font-display font-semibold text-[14px] px-4 py-3.5 rounded-full border disabled:opacity-50"
              style={{ borderColor: "#D5D2CC", color: "#16181D" }}
            >
              PDF
            </button>
            <button
              type="button"
              onClick={() => generar(true)}
              disabled={ocupado}
              className="font-display font-semibold text-[15px] flex-1 py-3.5 rounded-full disabled:opacity-60"
              style={{ background: "#D0021B", color: "#fff" }}
            >
              {ocupado ? "Generando..." : "Enviar por WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
