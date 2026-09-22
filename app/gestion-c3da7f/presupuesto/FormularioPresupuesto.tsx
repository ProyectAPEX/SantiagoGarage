"use client";
import { useState, useEffect, useRef } from "react";
import {
  generarPresupuestoPDF,
  calcularTotales,
  formatCLP,
  type ItemTrabajo,
} from "@/lib/presupuesto-pdf";
import { limpiarTexto, esTelefonoValido } from "@/lib/sanitize";
import { formatearRut, rutValido, limpiarRut } from "@/lib/rut";
import { marcarCotizada } from "../acciones";
import BotonSalir from "../BotonSalir";
import CampoSugerido from "./CampoSugerido";
import { buscarMarcas, buscarModelos, buscarColores } from "@/lib/vehiculos";
import { SERVICIOS } from "@/lib/trabajos";

/** Datos que llegan de una solicitud de la web, para precargar el formulario. */
export type DatosIniciales = {
  solicitudId: string;
  nombre: string;
  telefono: string;
  marca: string;
  modelo: string;
  anio: string;
  mensaje: string;
};

const vacio = {
  fecha: "",
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

/** Una línea de trabajo. `servicio` es solo del formulario: al PDF va la descripción. */
type Linea = ItemTrabajo & { servicio: string };
const lineaVacia: Linea = { servicio: "", descripcion: "", precio: 0 };

/** Hoy en formato AAAA-MM-DD, en hora local (no UTC). */
function hoyISO(): string {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

/** "2026-09-21" -> "21-09-2026" */
function isoAFecha(iso: string): string {
  const [a, m, d] = iso.split("-");
  return a && m && d ? `${d}-${m}-${a}` : "";
}

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

export default function FormularioPresupuesto({
  inicial,
  rutaBandeja,
}: {
  inicial: DatosIniciales | null;
  /** null mientras no haya base de datos: no hay bandeja a la que volver */
  rutaBandeja: string | null;
}) {
  const [f, setF] = useState(() =>
    inicial
      ? { ...vacio, nombre: inicial.nombre, telefono: inicial.telefono, marca: inicial.marca, modelo: inicial.modelo, anio: inicial.anio }
      : vacio
  );
  const [solicitud, setSolicitud] = useState<DatosIniciales | null>(inicial);
  const [items, setItems] = useState<Linea[]>([{ ...lineaVacia }]);
  const [numero, setNumero] = useState("—");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [listo, setListo] = useState("");
  /** Ultimo PDF generado, para abrirlo a mano si el telefono no lo descargó. */
  const [pdfAMano, setPdfAMano] = useState("");
  const urlPdf = useRef<string | null>(null);

  useEffect(() => {
    setNumero(siguienteNumero());
    setF((prev) => ({ ...prev, fecha: hoyISO() }));
  }, []);

  const set = (k: keyof typeof vacio) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const setItem = (i: number, campo: keyof ItemTrabajo, v: string) => {
    const copia = [...items];
    if (campo === "precio") copia[i].precio = Number(v.replace(/\D/g, "")) || 0;
    else copia[i].descripcion = v;
    setItems(copia);
  };

  /**
   * El servicio elegido encabeza la descripción: "Desabolladura y pintura de ".
   * Si ya había texto escrito a mano, solo se cambia el servicio del principio;
   * nunca se pisa lo que escribió el usuario.
   */
  function elegirServicio(i: number, servicio: string) {
    const copia = [...items];
    const { servicio: antes, descripcion } = copia[i];
    let nueva = descripcion;
    if (!descripcion.trim()) nueva = servicio ? `${servicio} de ` : "";
    else if (antes && descripcion.startsWith(antes)) {
      const resto = descripcion.slice(antes.length);
      nueva = servicio ? servicio + resto : resto.replace(/^\s*de\s+/i, "");
    }
    copia[i] = { ...copia[i], servicio, descripcion: nueva.slice(0, 200) };
    setItems(copia);
  }

  const totales = calcularTotales(items, Number(f.descuento) || 0);

  function armarDatos() {
    return {
      numero,
      fecha: isoAFecha(f.fecha || hoyISO()),
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
    if (f.rut && !rutValido(f.rut)) return "El RUT no es válido: revisa el dígito verificador.";
    if (f.telefono && !esTelefonoValido(f.telefono)) return "El teléfono no parece válido.";
    if (!items.some((i) => i.descripcion.trim())) return "Agrega al menos un trabajo.";
    return "";
  }

  /** WhatsApp del cliente en formato internacional: 9 1234 5678 -> 56912345678 */
  function numeroWhatsApp(telefono: string): string {
    const d = telefono.replace(/\D/g, "");
    if (!d) return "";
    return d.startsWith("56") ? d : "56" + d.replace(/^0+/, "");
  }

  /**
   * Mensaje corto que acompaña al PDF. El detalle va en el PDF, no escrito
   * en el chat.
   */
  function mensajeWhatsApp(datos: ReturnType<typeof armarDatos>): string {
    const nombre = datos.cliente.nombre.split(" ")[0] || "";
    return `Hola ${nombre}, le adjuntamos la cotización N° ${datos.numero} de Santiago Garage. Cualquier duda quedamos atentos.`;
  }

  /**
   * Deja el PDF en el celular o computador del dueño, para adjuntarlo.
   *
   * Dos cosas que en el celular no perdonan:
   * - el enlace tiene que estar DENTRO de la pagina, o Safari en iPhone
   *   ignora el clic;
   * - liberar la memoria del archivo apenas se dispara corta la descarga a
   *   medias, asi que se libera un rato despues.
   */
  function descargar(blob: Blob, nombreArchivo: string) {
    if (urlPdf.current) URL.revokeObjectURL(urlPdf.current);
    const url = URL.createObjectURL(blob);
    urlPdf.current = url;
    setPdfAMano(url); // queda el enlace por si el telefono no descargo solo

    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function generar(modo: "pdf" | "whatsapp" | "compartir") {
    const err =
      validar() ||
      (modo === "whatsapp" && !numeroWhatsApp(f.telefono) ? "Escribe el WhatsApp del cliente para poder enviárselo." : "");
    if (err) {
      setListo("");
      setError(err);
      return;
    }
    setError("");
    setOcupado(true);
    setListo("");

    // La ventana se abre en el toque mismo, todavia en blanco: si se abriera
    // despues de generar el PDF, el navegador del celular la bloquearia por
    // emergente. Al final se le pone la direccion del chat.
    const ventana = modo === "whatsapp" ? window.open("", "_blank") : null;
    if (ventana) {
      try {
        ventana.opener = null;
      } catch {
        /* algunos navegadores no dejan tocarlo: no pasa nada */
      }
    }

    try {
      const datos = armarDatos();
      const blob = await generarPresupuestoPDF(datos);
      const nombreArchivo = `Presupuesto-${datos.numero}-${datos.cliente.nombre.split(" ")[0] || "cliente"}.pdf`;
      const file = new File([blob], nombreArchivo, { type: "application/pdf" });

      const texto = mensajeWhatsApp(datos);

      if (modo === "compartir") {
        // Menu de compartir del telefono: manda el archivo, pero el chat lo
        // elige el dueño a mano. Por eso no es el boton principal.
        const puedeCompartir = typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [file] });
        if (!puedeCompartir) {
          descargar(blob, nombreArchivo);
          setListo("Este navegador no permite compartir archivos. El PDF quedó descargado.");
        } else {
          try {
            await navigator.share({ files: [file], title: `Presupuesto ${datos.numero}`, text: texto });
          } catch (e) {
            // Cerro el menu sin mandar: no es error
            if (e instanceof DOMException && e.name === "AbortError") return;
            throw e;
          }
          setListo("Presupuesto compartido.");
        }
      } else if (modo === "whatsapp") {
        // El chat se abre con el numero escrito en el formulario, con el
        // detalle ya escrito. El PDF queda descargado para adjuntarlo con el
        // clip: WhatsApp no deja que una pagina web lo adjunte sola.
        descargar(blob, nombreArchivo);
        const chat = `https://wa.me/${numeroWhatsApp(f.telefono)}?text=${encodeURIComponent(texto)}`;
        // Medio segundo antes de saltar a WhatsApp: si el telefono cambia de
        // aplicacion en el mismo instante, la descarga se queda a medias.
        if (ventana) setTimeout(() => (ventana.location.href = chat), 600);
        else window.open(chat, "_blank", "noopener,noreferrer");
        setListo("PDF descargado y chat del cliente abierto. Adjúntalo con el clip 📎 → Documentos: es el primero de la lista.");
      } else {
        descargar(blob, nombreArchivo);
        setListo("PDF descargado.");
      }
      guardarNumero(datos.numero);
      if (solicitud) {
        const ok = await marcarCotizada(solicitud.solicitudId).catch(() => false);
        if (ok) setSolicitud(null);
      }
    } catch {
      ventana?.close(); // no dejar la pestaña en blanco dando vueltas
      setError("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  function nuevo() {
    setSolicitud(null);
    setF({ ...vacio, fecha: hoyISO() });
    setItems([{ ...lineaVacia }]);
    setNumero(siguienteNumero());
    setError("");
    setListo("");
    setPdfAMano("");
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
          <div className="flex items-center justify-between gap-3 mb-4">
            {rutaBandeja ? (
              <a href={rutaBandeja} className="inline-flex items-center gap-1 font-display font-semibold text-[14px] py-1" style={{ color: "#16181D" }}>
                ← Solicitudes
              </a>
            ) : (
              <span />
            )}
            <BotonSalir />
          </div>
          <p className="font-display text-[12px] font-medium tracking-[2px] uppercase mb-1" style={{ color: "#D0021B" }}>
            Uso interno
          </p>
          <h1 className="font-display font-bold uppercase text-[30px] leading-none" style={{ letterSpacing: "-1px" }}>
            Nuevo presupuesto
          </h1>
          <div className="flex items-center justify-between gap-3 mt-3">
            <p className="text-[14px]" style={{ color: "#6B7280" }}>N° {numero}</p>
            <label htmlFor="fecha" className="flex items-center gap-2">
              <span className="font-display font-semibold text-[13px] text-[#16181D]">Fecha</span>
              <input
                id="fecha"
                type="date"
                value={f.fecha}
                onChange={set("fecha")}
                className="rounded-xl px-3 py-2 text-[16px] border border-[#D5D2CC] bg-white text-[#16181D] outline-none focus:border-[#16181D]"
              />
            </label>
          </div>
        </div>

        {solicitud && (
          <section className="rounded-2xl p-5 mb-4 border-l-4" style={{ background: "#fff", borderColor: "#D0021B" }}>
            <p className="font-display font-bold text-[12px] tracking-[1.5px] uppercase mb-2" style={{ color: "#D0021B" }}>
              Lo que pidió el cliente
            </p>
            <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "#16181D" }}>{solicitud.mensaje}</p>
            <p className="text-[12px] mt-3" style={{ color: "#6B7280" }}>Solo de referencia: no aparece en el PDF.</p>
          </section>
        )}

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
              <input
                id="rut"
                className={input}
                value={f.rut}
                onChange={(e) => setF({ ...f, rut: formatearRut(e.target.value) })}
                placeholder="12.345.678-9"
                maxLength={12}
                inputMode="text"
                aria-invalid={limpiarRut(f.rut).length >= 8 && !rutValido(f.rut)}
              />
              {limpiarRut(f.rut).length >= 8 && !rutValido(f.rut) && (
                <p className="text-[12px] mt-1 font-medium" style={{ color: "#D0021B" }}>RUT inválido</p>
              )}
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
              <CampoSugerido
                id="marca"
                className={input}
                valor={f.marca}
                buscar={buscarMarcas}
                alEscribir={(v) => setF({ ...f, marca: v })}
                placeholder="Hyundai"
                maxLength={40}
              />
            </div>
            <div>
              <label className={label} htmlFor="modelo">Modelo</label>
              {/* Sin marca escrita busca en todas y, al elegir, completa las dos */}
              <CampoSugerido
                id="modelo"
                className={input}
                valor={f.modelo}
                buscar={(t) => buscarModelos(f.marca, t)}
                alEscribir={(v) => setF({ ...f, modelo: v })}
                alElegir={(s) => setF({ ...f, modelo: s.texto, marca: s.detalle ?? f.marca })}
                placeholder="Grand i10"
                maxLength={40}
              />
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
              <CampoSugerido
                id="color"
                className={input}
                valor={f.color}
                buscar={buscarColores}
                alEscribir={(v) => setF({ ...f, color: v })}
                placeholder="Blanco"
                maxLength={25}
              />
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
              <label className={label} htmlFor={`servicio-${i}`}>Servicio</label>
              <select
                id={`servicio-${i}`}
                className={input + " mb-3"}
                value={item.servicio}
                onChange={(e) => elegirServicio(i, e.target.value)}
              >
                <option value="">Elegir servicio…</option>
                {SERVICIOS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <label className={label} htmlFor={`detalle-${i}`}>Detalle</label>
              <textarea
                id={`detalle-${i}`}
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
            onClick={() => setItems([...items, { ...lineaVacia }])}
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
        {pdfAMano && (
          <p className="text-center text-[13px] mb-3" style={{ color: "#6B7280" }}>
            ¿No se descargó?{" "}
            <a href={pdfAMano} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#16181D" }}>
              Abrir el PDF
            </a>
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
              Total c/IVA
            </span>
            <span className="font-display font-bold text-[26px] leading-none" style={{ color: "#16181D" }}>
              {formatCLP(totales.total)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => generar("pdf")}
              disabled={ocupado}
              className="font-display font-semibold text-[14px] px-4 py-3.5 rounded-full border disabled:opacity-50"
              style={{ borderColor: "#D5D2CC", color: "#16181D" }}
            >
              PDF
            </button>
            <button
              type="button"
              onClick={() => generar("whatsapp")}
              disabled={ocupado}
              className="font-display font-semibold text-[15px] flex-1 py-3.5 rounded-full disabled:opacity-60"
              style={{ background: "#D0021B", color: "#fff" }}
            >
              {ocupado ? "Generando..." : "Enviar cotización"}
            </button>
          </div>
          {/* Unico camino en que el PDF viaja como archivo: el chat se elige a mano */}
          <button
            type="button"
            onClick={() => generar("compartir")}
            disabled={ocupado}
            className="w-full mt-2 py-2 font-display font-semibold text-[13px] disabled:opacity-50"
            style={{ color: "#6B7280" }}
          >
            Mandar el PDF eligiendo el chat
          </button>
        </div>
      </div>
    </div>
  );
}
