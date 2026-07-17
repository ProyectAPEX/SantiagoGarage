"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{ background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E6E1" }}
      className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-10 h-[76px]"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-between h-full relative">
        {/* Logo */}
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="Santiago Garage"
            width={108}
            height={72}
            className="object-contain"
            style={{ transform: "scale(1.4)" }}
            priority
          />
        </Link>

        {/* Links desktop — centrados absolutos */}
        <ul className="hidden md:flex items-center gap-9 list-none absolute left-1/2 -translate-x-1/2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-display text-[15px] font-medium transition-colors duration-200 pb-1"
                  style={{
                    color: active ? "#16181D" : "#9CA3AF",
                    borderBottom: active ? "2px solid #D0021B" : "2px solid transparent",
                  }}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA desktop */}
        <Link
          href="/contacto"
          className="hidden md:inline-block font-display font-semibold text-[14px] px-6 py-2.5 rounded-full transition-all duration-200 hover:opacity-85"
          style={{ background: "#16181D", color: "#fff" }}
        >
          Cotizar
        </Link>

        {/* Botón hamburguesa — solo móvil */}
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-[5px]"
        >
          <span className="block w-6 h-[2px] transition-transform duration-300" style={{ background: "#16181D", transform: open ? "translateY(7px) rotate(45deg)" : "none" }} />
          <span className="block w-6 h-[2px] transition-opacity duration-200" style={{ background: "#16181D", opacity: open ? 0 : 1 }} />
          <span className="block w-6 h-[2px] transition-transform duration-300" style={{ background: "#16181D", transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

      {/* Menú desplegable móvil */}
      <div
        className="md:hidden absolute left-0 right-0 top-[76px] overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? 320 : 0,
          background: "rgba(250,250,248,0.98)",
          borderBottom: open ? "1px solid #E8E6E1" : "none",
        }}
      >
        <ul className="flex flex-col list-none px-6 py-4 gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-[17px] font-medium block py-3"
                  style={{ color: active ? "#D0021B" : "#16181D" }}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          <li className="mt-2">
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="font-display font-semibold text-[15px] px-6 py-3 rounded-full inline-block"
              style={{ background: "#16181D", color: "#fff" }}
            >
              Cotizar
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
