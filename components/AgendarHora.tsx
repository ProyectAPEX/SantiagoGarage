"use client";
import { useEffect, useRef, useState } from "react";
import CampoSugerido from "@/components/CampoSugerido";
import { buscarMarcas, buscarModelos } from "@/lib/vehiculos";
import { limpiarTexto, esTelefonoValido, esEmailValido } from "@/lib/sanitize";
import {
  TIPOS,
  regla,
  fechaLarga,
  horaFin,
  diaSemana,
  sumarDias,
  nombreMes,
  MAX_FOTOS,
  LADO_FOTO,
  MAX_BYTES_FOTO,
  type TipoCita,
  type DiaAgenda,
} from "@/lib/agenda";
import { WA_URL, TELEFONO_VISIBLE, GOOGLE_MAPS_URL, DIRECCION } from "@/lib/site";

const ROJO = "#D0021B";
const TINTA = "#16181D";
const GRIS = "#6B7280";
const BORDE = "#E8E6E1";

type NumeroPaso = 1 | 2 | 3;

type Confirmada = {
  tipo: string;
  dia: string;
  hora: string;
  hasta: string;
  email: string;
  correo: boolean;
};

const formVacio = {
  nombre: "",
  telefono: "",
  email: "",
  marca: "",
  modelo: "",
  patente: "",
  aseguradora: "",
  siniestro: "",
  comentario: "",
  empresa: "", // campo trampa
};

const campo =
  "w-full rounded-xl px-[18px] py-4 text-[16px] outline-none border border-[#D5D2CC] bg-white text-[#16181D] focus:border-[#16181D] transition-colors";
const etiqueta = "font-display font-semibold text-[14px] mb-2 block";

const duracionLegible = (min: number) => (min >= 60 ? `${min / 60} hora${min > 60 ? "s" : ""}` : `${min} min`);
const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// ——— Iconos (trazo, heredan el color) ———
function Icono({ d, size = 26 }: { d: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}
const ICONOS: Record<TipoCita | "calendario" | "camara", React.ReactNode> = {
  particular: (
    <>
      <path d="M3 16v-3.5L5.2 7.6A2 2 0 0 1 7 6.5h10a2 2 0 0 1 1.8 1.1L21 12.5V16" />
      <path d="M3 12.5h18" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17" cy="16.5" r="2" />
      <path d="M9 16.5h6" />
    </>
  ),
  aseguradora: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  presupuesto: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  camara: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
};

/** Un paso de la agenda: numero en circulo, linea que baja al siguiente y su contenido. */
function Paso({
  numero,
  titulo,
  estado,
  resumen,
  alCambiar,
  ultimo,
  children,
  refPaso,
}: {
  numero: number;
  titulo: string;
  estado: "activo" | "hecho" | "pendiente";
  resumen?: React.ReactNode;
  alCambiar?: () => void;
  ultimo?: boolean;
  children?: React.ReactNode;
  refPaso?: React.Ref<HTMLDivElement>;
}) {
  const encendido = estado !== "pendiente";
  return (
    <div ref={refPaso} className="relative pl-14 sm:pl-[72px] scroll-mt-28" style={{ borderTop: numero === 1 ? "none" : `1px solid ${BORDE}` }}>
      {/* Linea que une los circulos, como en la agenda de la PRT */}
      {!ultimo && (
        <span aria-hidden="true" className="absolute left-[19px] sm:left-[23px] top-9 bottom-0 w-[2px]" style={{ background: "#F0B9BF" }} />
      )}
      {numero !== 1 && (
        <span aria-hidden="true" className="absolute left-[19px] sm:left-[23px] top-0 h-6 w-[2px]" style={{ background: "#F0B9BF" }} />
      )}
      <span
        aria-hidden="true"
        className="absolute left-0 top-5 sm:top-6 flex items-center justify-center rounded-full font-display font-bold text-[16px] w-10 h-10 sm:w-12 sm:h-12"
        style={{ background: encendido ? ROJO : "#F0B9BF", color: "#fff" }}
      >
        {numero}
      </span>

      <div className="py-6 sm:py-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-2 min-h-10 sm:min-h-12">
          <h2
            className="font-display text-[17px] sm:text-[18px] shrink-0 sm:w-[190px]"
            style={{ color: estado === "pendiente" ? "#C0A3A6" : estado === "activo" ? ROJO : TINTA, fontWeight: estado === "activo" ? 700 : 600 }}
          >
            {titulo}
          </h2>
          {resumen && (
            <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
              <div className="min-w-0">{resumen}</div>
              {alCambiar && (
                <button type="button" onClick={alCambiar} className="font-display font-semibold text-[14px] shrink-0 underline underline-offset-4" style={{ color: TINTA }}>
                  Cambiar
                </button>
              )}
            </div>
          )}
        </div>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}

function Resumen({ icono, texto, detalle }: { icono: React.ReactNode; texto: string; detalle?: string }) {
  return (
    <span className="flex items-center gap-3 min-w-0">
      <span className="shrink-0" style={{ color: ROJO }}>
        <Icono d={icono} size={30} />
      </span>
      <span className="min-w-0">
        <span className="block font-display font-bold text-[15px] sm:text-[16px] truncate" style={{ color: TINTA }}>{texto}</span>
        {detalle && <span className="block text-[13px] truncate" style={{ color: GRIS }}>{detalle}</span>}
      </span>
    </span>
  );
}

/** Los dias de lunes a sabado de un mes, con huecos al inicio para que calcen bajo L M M J V S. */
function celdasDelMes(mes: string): (string | null)[] {
  const primero = `${mes}-01`;
  const celdas: (string | null)[] = [];
  for (let f = primero; f.startsWith(mes); f = sumarDias(f, 1)) {
    const d = diaSemana(f);
    if (d === 0) continue;
    if (celdas.length === 0) for (let i = 1; i < d; i++) celdas.push(null);
    celdas.push(f);
  }
  return celdas;
}

function cambiarMes(mes: string, paso: number): string {
  const [a, m] = mes.split("-").map(Number);
  const total = a * 12 + (m - 1) + paso;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

type Foto = { blob: Blob; vista: string };

/**
 * Achica una foto a JPEG de LADO_FOTO px por lado como maximo. Ademas le saca
 * los metadatos (entre ellos la ubicacion GPS que guarda el celular).
 *
 * La rotacion del celular (EXIF) la aplica el navegador solo al leer la
 * imagen: no se rota a mano, o queda girada dos veces (ver Trampas conocidas).
 */
async function achicarFoto(archivo: File): Promise<Blob> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const escala = Math.min(1, LADO_FOTO / Math.max(img.naturalWidth, img.naturalHeight));
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(img.naturalWidth * escala);
    lienzo.height = Math.round(img.naturalHeight * escala);
    lienzo.getContext("2d")?.drawImage(img, 0, 0, lienzo.width, lienzo.height);
    for (const calidad of [0.82, 0.7, 0.55]) {
      const blob = await new Promise<Blob | null>((listo) => lienzo.toBlob(listo, "image/jpeg", calidad));
      if (blob && blob.size <= MAX_BYTES_FOTO) return blob;
    }
    throw new Error("La foto sigue pesando demasiado");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function AgendarHora() {
  const [paso, setPaso] = useState<NumeroPaso>(1);
  const [tipo, setTipo] = useState<TipoCita | null>(null);
  const [dias, setDias] = useState<DiaAgenda[] | null>(null);
  // Si el taller tiene conectado WhatsApp, llega un recordatorio el dia antes
  const [conRecordatorio, setConRecordatorio] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorAgenda, setErrorAgenda] = useState("");
  const [mes, setMes] = useState("");
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [form, setForm] = useState(formVacio);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState<Confirmada | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [procesando, setProcesando] = useState(false);

  // Las vistas previas ocupan memoria hasta que se liberan
  const fotosVivas = useRef<Foto[]>([]);
  useEffect(() => {
    fotosVivas.current = fotos;
  }, [fotos]);
  useEffect(() => () => fotosVivas.current.forEach((f) => URL.revokeObjectURL(f.vista)), []);

  async function agregarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const elegidas = Array.from(e.target.files ?? []);
    e.target.value = ""; // asi se puede volver a elegir la misma foto
    const espacio = MAX_FOTOS - fotos.length;
    if (!elegidas.length || espacio <= 0) return;

    setProcesando(true);
    setError("");
    const nuevas: Foto[] = [];
    let fallidas = 0;
    for (const archivo of elegidas.slice(0, espacio)) {
      try {
        const blob = await achicarFoto(archivo);
        nuevas.push({ blob, vista: URL.createObjectURL(blob) });
      } catch {
        fallidas++;
      }
    }
    setFotos((antes) => [...antes, ...nuevas]);
    setProcesando(false);
    if (fallidas) setError(`No pudimos leer ${fallidas === 1 ? "una de las fotos" : `${fallidas} fotos`}. Prueba con otra.`);
    else if (elegidas.length > espacio) setError(`Puedes adjuntar hasta ${MAX_FOTOS} fotos.`);
  }

  function quitarFoto(i: number) {
    URL.revokeObjectURL(fotos[i].vista);
    setFotos(fotos.filter((_, j) => j !== i));
  }

  const refTipo = useRef<HTMLDivElement>(null);
  const refDia = useRef<HTMLDivElement>(null);
  const refDatos = useRef<HTMLDivElement>(null);
  const refRaiz = useRef<HTMLDivElement>(null);
  const consulta = useRef(0); // si cambian de tipo rapido, la respuesta vieja se ignora
  const pasoAnterior = useRef(paso);

  // Al avanzar, el paso nuevo queda a la vista (en el celular queda abajo).
  // Solo cuando el paso cambia de verdad: al cargar la pagina no se mueve nada
  // (React en desarrollo corre los efectos dos veces, y con una simple marca
  // de "primera vez" el inicio saltaba solo hasta la agenda)
  useEffect(() => {
    if (pasoAnterior.current === paso) return;
    pasoAnterior.current = paso;
    const destino = paso === 1 ? refTipo : paso === 2 ? refDia : refDatos;
    destino.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [paso]);

  // En el celular las horas quedan debajo del calendario: al tocar un dia, que se vean
  const refHoras = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (fecha) refHoras.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [fecha]);

  async function cargarDias(t: TipoCita) {
    const n = ++consulta.current;
    setCargando(true);
    setErrorAgenda("");
    try {
      const res = await fetch(`/api/agenda?tipo=${t}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (n !== consulta.current) return;
      if (!res.ok || !json?.ok) {
        setDias(null);
        setErrorAgenda(json?.error || "No pudimos cargar las horas. Intenta de nuevo.");
        return;
      }
      const lista = json.dias as DiaAgenda[];
      setDias(lista);
      setConRecordatorio(json.recordatorio === true);
      const primero = lista.find((d) => d.horas.length) ?? lista[0];
      if (primero) setMes(primero.fecha.slice(0, 7));
    } catch {
      if (n === consulta.current) {
        setDias(null);
        setErrorAgenda("No pudimos cargar las horas. Revisa tu conexión e intenta de nuevo.");
      }
    } finally {
      if (n === consulta.current) setCargando(false);
    }
  }

  function elegirTipo(t: TipoCita) {
    if (t !== tipo) {
      setFecha(null);
      setHora(null);
      setDias(null);
    }
    setTipo(t);
    setError("");
    setPaso(2);
    cargarDias(t);
  }

  function elegirHora(h: string) {
    setHora(h);
    setError("");
    setPaso(3);
  }

  const cambiar = (k: keyof typeof formVacio) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!tipo || !fecha || !hora || enviando) return;

    const nombre = limpiarTexto(form.nombre, 80);
    const telefono = limpiarTexto(form.telefono, 20);
    const email = limpiarTexto(form.email, 120);
    if (!nombre || !telefono || !email) return setError("Completa tu nombre, teléfono y correo.");
    if (!esTelefonoValido(telefono)) return setError("El teléfono no parece válido. Ej: +56 9 1234 5678");
    if (!esEmailValido(email)) return setError("El correo no parece válido: ahí te llega la confirmación.");

    setError("");
    setEnviando(true);
    try {
      // Formulario y no JSON: asi viajan las fotos
      const datos = new FormData();
      for (const [clave, valor] of Object.entries({ ...form, nombre, telefono, email, tipo, fecha, hora })) {
        datos.append(clave, valor);
      }
      fotos.forEach((f, i) => datos.append("fotos", f.blob, `foto-${i + 1}.jpg`));

      const res = await fetch("/api/agenda", { method: "POST", body: datos });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.ok) {
        // Con el campo trampa lleno la API responde ok sin cita: no hay nada que mostrar
        if (json.cita) setListo({ ...json.cita, correo: Boolean(json.correo) });
        // En el inicio la agenda esta abajo: se sube hasta la confirmacion, no al tope de la pagina
        requestAnimationFrame(() => refRaiz.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        return;
      }
      if (res.status === 409) {
        // Se la ganaron: de vuelta al calendario, con las horas al dia
        setHora(null);
        if (json?.motivo === "no-disponible") setFecha(null);
        setPaso(2);
        cargarDias(tipo);
        setErrorAgenda(json?.error || "Esa hora ya no está disponible. Elige otra.");
        return;
      }
      setError(json?.error || "No pudimos guardar tu hora. Intenta de nuevo.");
    } catch {
      setError("No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function otraHora() {
    setListo(null);
    setPaso(1);
    setTipo(null);
    setFecha(null);
    setHora(null);
    setDias(null);
    setForm(formVacio);
    fotos.forEach((f) => URL.revokeObjectURL(f.vista));
    setFotos([]);
  }

  // ——— Confirmacion ———
  if (listo) {
    return (
      <div ref={refRaiz} className="rounded-2xl bg-white p-7 sm:p-12 text-center scroll-mt-28" style={{ border: `1px solid ${BORDE}` }}>
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: ROJO, color: "#fff" }}>
          <Icono d={<path d="M5 12.5l4.5 4.5L19 7.5" />} size={32} />
        </span>
        <h2 className="font-display font-bold uppercase mb-3" style={{ fontSize: "clamp(26px,3.4vw,38px)", letterSpacing: "-1px", lineHeight: 1.1 }}>
          ¡Listo, te esperamos!
        </h2>
        <p className="text-[16px] mb-8" style={{ color: GRIS }}>
          {listo.correo
            ? <>Te enviamos la confirmación a <strong style={{ color: TINTA }}>{listo.email}</strong>, con la hora lista para guardar en tu calendario.</>
            : <>Tu hora quedó reservada, pero no pudimos enviarte el correo. Guarda estos datos o escríbenos por WhatsApp.</>}
        </p>

        <div className="max-w-[440px] mx-auto rounded-xl text-left mb-8" style={{ background: "#F1EFEA" }}>
          {[
            ["Atención", listo.tipo],
            ["Día", mayuscula(listo.dia)],
            ["Hora", `${listo.hora} a ${listo.hasta}`],
            ["Dónde", DIRECCION],
          ].map(([k, v], i) => (
            <div key={k} className="flex gap-4 px-5 py-3.5" style={{ borderTop: i === 0 ? "none" : "1px solid #E4E1DB" }}>
              <span className="text-[13px] w-[70px] shrink-0 pt-0.5" style={{ color: GRIS }}>{k}</span>
              <span className="font-display font-semibold text-[15px]" style={{ color: TINTA }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="font-display font-semibold text-[15px] px-8 py-4 rounded-full" style={{ background: ROJO, color: "#fff" }}>
            Cómo llegar
          </a>
          <button type="button" onClick={otraHora} className="font-display font-semibold text-[15px] px-8 py-4 rounded-full" style={{ border: "1px solid #D5D2CC", color: TINTA }}>
            Agendar otra hora
          </button>
        </div>
      </div>
    );
  }

  const r = tipo ? regla(tipo) : null;
  const porFecha = new Map((dias ?? []).map((d) => [d.fecha, d.horas]));
  const mesesConDias = dias?.length ? [dias[0].fecha.slice(0, 7), dias[dias.length - 1].fecha.slice(0, 7)] : null;
  const horasDelDia = fecha ? porFecha.get(fecha) ?? [] : [];
  const sinHoras = dias !== null && dias.every((d) => d.horas.length === 0);

  return (
    <div ref={refRaiz} className="rounded-2xl bg-white px-5 sm:px-10 scroll-mt-28" style={{ border: `1px solid ${BORDE}` }}>
      {/* ——— 1. Tipo de atención ——— */}
      <Paso
        numero={1}
        titulo="Tipo de atención"
        estado={paso === 1 ? "activo" : "hecho"}
        refPaso={refTipo}
        resumen={r && paso !== 1 ? <Resumen icono={ICONOS[r.id]} texto={r.nombre} detalle={duracionLegible(r.duracion)} /> : paso === 1 ? (
          <span className="text-[15px]" style={{ color: GRIS }}>Elige qué necesita tu auto</span>
        ) : undefined}
        alCambiar={paso !== 1 ? () => setPaso(1) : undefined}
      >
        {paso === 1 && (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
            {TIPOS.map((t) => {
              const elegido = tipo === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => elegirTipo(t.id)}
                  aria-pressed={elegido}
                  className="text-left rounded-2xl p-5 flex md:flex-col gap-4 transition-colors hover:border-[#16181D]"
                  style={{ border: `1.5px solid ${elegido ? ROJO : "#D5D2CC"}`, background: elegido ? "#FDF0F1" : "#fff" }}
                >
                  <span className="shrink-0" style={{ color: ROJO }}>
                    <Icono d={ICONOS[t.id]} size={34} />
                  </span>
                  <span>
                    <span className="block font-display font-bold text-[16px] mb-1" style={{ color: TINTA }}>{t.nombre}</span>
                    <span className="block text-[14px] leading-snug mb-2" style={{ color: GRIS }}>{t.bajada}</span>
                    <span className="inline-block font-display text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F1EFEA", color: TINTA }}>
                      {duracionLegible(t.duracion)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Paso>

      {/* ——— 2. Día y hora ——— */}
      <Paso
        numero={2}
        titulo="Día y hora"
        estado={paso === 2 ? "activo" : paso === 3 ? "hecho" : "pendiente"}
        refPaso={refDia}
        resumen={
          paso === 3 && fecha && hora ? (
            <Resumen icono={ICONOS.calendario} texto={`${mayuscula(fechaLarga(fecha))}`} detalle={tipo ? `${hora} a ${horaFin(tipo, hora)}` : hora} />
          ) : paso === 2 ? (
            <span className="text-[15px]" style={{ color: GRIS }}>Elige el día y la hora de lunes a sábado</span>
          ) : undefined
        }
        alCambiar={paso === 3 ? () => setPaso(2) : undefined}
      >
        {paso === 2 && (
          <div>
            {errorAgenda && (
              <p role="alert" className="text-[14px] font-medium mb-4" style={{ color: ROJO }}>
                {errorAgenda}
              </p>
            )}

            {cargando && !dias && (
              <p className="flex items-center gap-3 text-[15px] py-4" style={{ color: TINTA }}>
                <span className="inline-block w-7 h-7 rounded-full border-[3px] animate-spin" style={{ borderColor: "#F0B9BF", borderTopColor: ROJO }} />
                Buscando horas disponibles...
              </p>
            )}

            {!cargando && !dias && (
              <div className="flex flex-wrap gap-3 items-center">
                <button type="button" onClick={() => tipo && cargarDias(tipo)} className="font-display font-semibold text-[14px] px-5 py-3 rounded-full" style={{ border: "1px solid #D5D2CC", color: TINTA }}>
                  Intentar de nuevo
                </button>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="font-display font-semibold text-[14px] underline underline-offset-4" style={{ color: TINTA }}>
                  O escríbenos por WhatsApp
                </a>
              </div>
            )}

            {dias && sinHoras && (
              <p className="text-[15px]" style={{ color: TINTA }}>
                No quedan horas de {r?.nombre.toLowerCase()} en los próximos días.{" "}
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 font-semibold">
                  Escríbenos por WhatsApp al {TELEFONO_VISIBLE}
                </a>{" "}
                y te buscamos una.
              </p>
            )}

            {dias && !sinHoras && mes && mesesConDias && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-10">
                {/* Calendario */}
                <div style={{ opacity: cargando ? 0.5 : 1 }}>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      aria-label="Mes anterior"
                      disabled={mes <= mesesConDias[0]}
                      onClick={() => setMes(cambiarMes(mes, -1))}
                      className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-25"
                      style={{ border: "1px solid #D5D2CC" }}
                    >
                      <Icono d={<path d="M15 6l-6 6 6 6" />} size={18} />
                    </button>
                    <p className="font-display font-bold text-[16px] capitalize" style={{ color: TINTA }}>
                      {nombreMes(Number(mes.slice(5)))} {mes.slice(0, 4)}
                    </p>
                    <button
                      type="button"
                      aria-label="Mes siguiente"
                      disabled={mes >= mesesConDias[1]}
                      onClick={() => setMes(cambiarMes(mes, 1))}
                      className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-25"
                      style={{ border: "1px solid #D5D2CC" }}
                    >
                      <Icono d={<path d="M9 6l6 6-6 6" />} size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 text-center">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
                      <span key={d} className="font-display text-[12px] font-semibold uppercase py-1" style={{ color: GRIS }}>{d}</span>
                    ))}
                    {celdasDelMes(mes).map((f, i) => {
                      if (!f) return <span key={`h${i}`} />;
                      const libres = porFecha.get(f)?.length ?? 0;
                      // Tachado solo lo que se podria agendar y esta lleno; lo pasado o muy lejano, solo tenue
                      const enRango = porFecha.has(f);
                      const elegido = f === fecha;
                      return (
                        <button
                          key={f}
                          type="button"
                          disabled={!libres}
                          aria-pressed={elegido}
                          aria-label={`${fechaLarga(f)}${libres ? "" : ", sin horas"}`}
                          onClick={() => {
                            setFecha(f);
                            setHora(null);
                            setErrorAgenda("");
                          }}
                          className="h-11 rounded-lg font-display font-semibold text-[15px] transition-colors disabled:cursor-not-allowed"
                          style={
                            elegido
                              ? { background: ROJO, color: "#fff" }
                              : libres
                                ? { background: "#F1EFEA", color: TINTA }
                                : enRango
                                  ? { background: "transparent", color: "#C9C5BE", textDecoration: "line-through" }
                                  : { background: "transparent", color: "#D9D5CE" }
                          }
                        >
                          {Number(f.slice(8))}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Horas del dia elegido */}
                <div ref={refHoras} className="scroll-mt-28">
                  {fecha ? (
                    <>
                      <p className="font-display font-semibold text-[15px] mb-3" style={{ color: TINTA }}>
                        Horas libres el {fechaLarga(fecha)}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {horasDelDia.map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => elegirHora(h)}
                            aria-pressed={h === hora}
                            className="h-12 rounded-xl font-display font-semibold text-[15px] transition-colors hover:border-[#16181D]"
                            style={{ border: `1.5px solid ${h === hora ? ROJO : "#D5D2CC"}`, background: h === hora ? "#FDF0F1" : "#fff", color: TINTA }}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                      {r && (
                        <p className="text-[13px] mt-3" style={{ color: GRIS }}>
                          La atención dura {duracionLegible(r.duracion)}.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[15px] lg:pt-14" style={{ color: GRIS }}>
                      Toca un día marcado para ver sus horas.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Paso>

      {/* ——— 3. Tus datos ——— */}
      <Paso
        numero={3}
        titulo="Tus datos"
        estado={paso === 3 ? "activo" : "pendiente"}
        refPaso={refDatos}
        ultimo
        resumen={paso === 3 ? <span className="text-[15px]" style={{ color: GRIS }}>Para confirmarte la hora</span> : undefined}
      >
        {paso === 3 && tipo && fecha && hora && (
          <form onSubmit={confirmar} className="flex flex-col gap-5" noValidate>
            {/* Campo trampa: invisible para personas, lo llenan los bots */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
              <label htmlFor="agenda-empresa">Empresa</label>
              <input id="agenda-empresa" type="text" tabIndex={-1} autoComplete="off" value={form.empresa} onChange={cambiar("empresa")} />
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="agenda-nombre" className={etiqueta}>Nombre</label>
                <input id="agenda-nombre" className={campo} value={form.nombre} onChange={cambiar("nombre")} placeholder="Tu nombre y apellido" maxLength={80} autoComplete="name" required />
              </div>
              <div>
                <label htmlFor="agenda-telefono" className={etiqueta}>Teléfono</label>
                <input id="agenda-telefono" type="tel" className={campo} value={form.telefono} onChange={cambiar("telefono")} placeholder="+56 9 ..." maxLength={20} autoComplete="tel" required />
                {conRecordatorio && (
                  <span className="block text-[13px] mt-1.5" style={{ color: GRIS }}>El día antes te llega un recordatorio por WhatsApp.</span>
                )}
              </div>
              <div>
                <label htmlFor="agenda-email" className={etiqueta}>Correo</label>
                <input id="agenda-email" type="email" className={campo} value={form.email} onChange={cambiar("email")} placeholder="tu@correo.cl" maxLength={120} autoComplete="email" required />
                <span className="block text-[13px] mt-1.5" style={{ color: GRIS }}>Aquí te llega la confirmación.</span>
              </div>
              <div>
                <label htmlFor="agenda-marca" className={etiqueta}>Marca</label>
                <CampoSugerido id="agenda-marca" className={campo} valor={form.marca} buscar={buscarMarcas} alEscribir={(v) => setForm({ ...form, marca: v })} placeholder="Ej: Toyota" maxLength={40} />
              </div>
              <div>
                <label htmlFor="agenda-modelo" className={etiqueta}>Modelo</label>
                {/* Sin marca escrita busca en todas y, al elegir, completa las dos */}
                <CampoSugerido
                  id="agenda-modelo"
                  className={campo}
                  valor={form.modelo}
                  buscar={(t) => buscarModelos(form.marca, t)}
                  alEscribir={(v) => setForm({ ...form, modelo: v })}
                  alElegir={(s) => setForm({ ...form, modelo: s.texto, marca: s.detalle ?? form.marca })}
                  placeholder="Ej: Yaris"
                  maxLength={40}
                />
              </div>
              <div>
                <label htmlFor="agenda-patente" className={etiqueta}>Patente <span className="font-normal" style={{ color: GRIS }}>(opcional)</span></label>
                <input id="agenda-patente" className={campo + " uppercase"} value={form.patente} onChange={cambiar("patente")} placeholder="ABCD12" maxLength={10} autoComplete="off" />
              </div>
              {tipo === "aseguradora" && (
                <>
                  <div>
                    <label htmlFor="agenda-aseguradora" className={etiqueta}>Compañía de seguros</label>
                    <input id="agenda-aseguradora" className={campo} value={form.aseguradora} onChange={cambiar("aseguradora")} placeholder="Ej: BCI, Mapfre, HDI" maxLength={40} />
                  </div>
                  <div>
                    <label htmlFor="agenda-siniestro" className={etiqueta}>N° de siniestro <span className="font-normal" style={{ color: GRIS }}>(si ya lo tienes)</span></label>
                    <input id="agenda-siniestro" className={campo} value={form.siniestro} onChange={cambiar("siniestro")} maxLength={30} autoComplete="off" />
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <label htmlFor="agenda-comentario" className={etiqueta}>Observaciones <span className="font-normal" style={{ color: GRIS }}>(opcional)</span></label>
                <textarea id="agenda-comentario" className={campo} rows={3} value={form.comentario} onChange={cambiar("comentario")} placeholder="Cuéntanos qué le pasó al auto o lo que quieras que sepamos" maxLength={400} style={{ resize: "vertical" }} />
              </div>

              {/* Fotos del daño: se achican aca mismo antes de subir */}
              <div className="sm:col-span-2">
                <span className={etiqueta}>
                  Fotos del daño <span className="font-normal" style={{ color: GRIS }}>(opcional, hasta {MAX_FOTOS})</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {fotos.map((f, i) => (
                    <div key={f.vista} className="relative w-[84px] h-[84px] rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDE}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:), no pasa por next/image */}
                      <img src={f.vista} alt={`Foto ${i + 1} del daño`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => quitarFoto(i)}
                        aria-label={`Quitar la foto ${i + 1}`}
                        className="absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(22,24,29,0.78)", color: "#fff" }}
                      >
                        <Icono d={<path d="M7 7l10 10M17 7L7 17" />} size={14} />
                      </button>
                    </div>
                  ))}
                  {fotos.length < MAX_FOTOS && (
                    <label
                      className="w-[84px] h-[84px] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:border-[#16181D]"
                      style={{ border: "1.5px dashed #D5D2CC", color: procesando ? GRIS : TINTA, opacity: procesando ? 0.6 : 1 }}
                    >
                      {procesando ? (
                        <span className="inline-block w-6 h-6 rounded-full border-[3px] animate-spin" style={{ borderColor: "#F0B9BF", borderTopColor: ROJO }} />
                      ) : (
                        <Icono d={ICONOS.camara} size={24} />
                      )}
                      <span className="font-display font-semibold text-[12px]">{procesando ? "Cargando" : "Agregar"}</span>
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={agregarFotos} disabled={procesando} />
                    </label>
                  )}
                </div>
                <span className="block text-[13px] mt-2" style={{ color: GRIS }}>
                  Con fotos te podemos orientar antes de que vengas.
                </span>
              </div>
            </div>

            <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ background: "#F1EFEA" }}>
              <span className="shrink-0" style={{ color: ROJO }}>
                <Icono d={ICONOS.calendario} size={24} />
              </span>
              <p className="text-[14px] sm:text-[15px]" style={{ color: TINTA }}>
                <strong className="font-display">{regla(tipo).nombre}</strong> · {fechaLarga(fecha)}, {hora} a {horaFin(tipo, hora)}
              </p>
            </div>

            {error && (
              <p role="alert" className="text-[14px] font-medium" style={{ color: ROJO }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando || procesando}
              className="self-start font-display font-semibold text-[15px] px-12 py-4 rounded-full transition-opacity hover:opacity-85 disabled:opacity-60"
              style={{ background: ROJO, color: "#fff" }}
            >
              {enviando ? "Reservando..." : "Confirmar hora"}
            </button>
            <p className="text-[12px]" style={{ color: "#9CA3AF" }}>
              {conRecordatorio
                ? "Usamos tus datos solo para agendar, confirmar y recordarte tu hora por correo y WhatsApp."
                : "Usamos tus datos solo para agendar y confirmar tu hora."}
            </p>
          </form>
        )}
      </Paso>
    </div>
  );
}
