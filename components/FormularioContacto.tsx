"use client";
import { useRef, useState } from "react";
import Reveal from "@/components/anim/Reveal";
import { limpiarTexto, esTelefonoValido, esEmailValido } from "@/lib/sanitize";
import { WA_URL } from "@/lib/site";

// Evita reenvíos en ráfaga desde el mismo navegador
const COOLDOWN_MS = 20_000;

export default function FormularioContacto() {
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", auto: "", mensaje: "", empresa: "" });
  const [error, setError] = useState("");
  const ultimoEnvio = useRef(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot: campo invisible que solo los bots rellenan
    if (form.empresa) return;

    const ahora = Date.now();
    if (ahora - ultimoEnvio.current < COOLDOWN_MS) {
      setError("Espera unos segundos antes de enviar de nuevo.");
      return;
    }

    const nombre = limpiarTexto(form.nombre, 80);
    const telefono = limpiarTexto(form.telefono, 17);
    const email = limpiarTexto(form.email, 100);
    const auto = limpiarTexto(form.auto, 60);
    const mensaje = limpiarTexto(form.mensaje, 600);

    if (!nombre || !telefono || !mensaje) {
      setError("Completa nombre, teléfono y mensaje.");
      return;
    }
    if (!esTelefonoValido(telefono)) {
      setError("El teléfono no parece válido. Ej: +56 9 1234 5678");
      return;
    }
    if (email && !esEmailValido(email)) {
      setError("El email no parece válido.");
      return;
    }

    setError("");
    ultimoEnvio.current = ahora;
    const texto = encodeURIComponent(
      `Hola, quiero cotizar un servicio.\n\nNombre: ${nombre}\nTeléfono: ${telefono}\nEmail: ${email || "—"}\nAuto: ${auto || "—"}\nMensaje: ${mensaje}`
    );
    window.open(`${WA_URL}?text=${texto}`, "_blank", "noopener,noreferrer");
  };

  const inputStyle = {
    border: "1px solid #D5D2CC",
    background: "#fff",
    borderRadius: 12,
    padding: "16px 18px",
    fontSize: 15,
    color: "#16181D",
    outline: "none",
    width: "100%",
  } as const;

  const labelStyle = "font-display font-semibold text-[14px] mb-2 block";

  return (
    <section className="px-5 sm:px-10 py-16 sm:py-24">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <p className="font-display text-[13px] font-medium tracking-[3px] uppercase mb-4" style={{ color: "#D0021B" }}>
              Estamos para resolver tus dudas
            </p>
            <h2 className="font-display font-bold uppercase" style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
              Escríbenos
            </h2>
          </div>
        </Reveal>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Honeypot anti-bots: invisible para personas, los bots lo rellenan */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
            <label htmlFor="empresa">Empresa</label>
            <input id="empresa" name="empresa" type="text" tabIndex={-1} autoComplete="off" value={form.empresa} onChange={handleChange} />
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre" className={labelStyle}>Nombre</label>
              <input id="nombre" name="nombre" type="text" placeholder="Tu nombre" required maxLength={80} value={form.nombre} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="telefono" className={labelStyle}>Teléfono</label>
              <input id="telefono" name="telefono" type="tel" placeholder="+56 9 ..." required maxLength={17} value={form.telefono} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="email" className={labelStyle}>Email</label>
              <input id="email" name="email" type="email" placeholder="tu@email.cl" maxLength={100} value={form.email} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="auto" className={labelStyle}>Marca y modelo de tu auto</label>
              <input id="auto" name="auto" type="text" placeholder="Ej: Toyota Yaris 2021" maxLength={60} value={form.auto} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div>
            <label htmlFor="mensaje" className={labelStyle}>Mensaje</label>
            <textarea id="mensaje" name="mensaje" placeholder="Cuéntanos qué necesita tu vehículo..." rows={5} required maxLength={600} value={form.mensaje} onChange={handleChange} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {error && (
            <p role="alert" className="text-center text-[14px] font-medium" style={{ color: "#D0021B" }}>
              {error}
            </p>
          )}

          <div className="flex justify-center mt-2">
            <button
              type="submit"
              className="font-display font-semibold text-[15px] px-12 py-4 rounded-full cursor-pointer transition-opacity hover:opacity-85"
              style={{ background: "#D0021B", color: "#fff", border: "none" }}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
