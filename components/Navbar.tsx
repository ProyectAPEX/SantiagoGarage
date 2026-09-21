"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TELEFONO_VISIBLE, TEL_URL, WA_COTIZAR_URL } from "@/lib/site";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
];

function IconoWhatsApp({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z" />
    </svg>
  );
}

function IconoTelefono() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{ background: "rgba(250,250,248,0.94)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E6E1" }}
      className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-10 h-[76px]"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-between h-full max-w-[1280px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0" onClick={() => setOpen(false)} aria-label="Santiago Garage, inicio">
          <Image src="/logo-nav.png" alt="Santiago Garage" width={172} height={52} className="object-contain h-[46px] w-auto" priority />
        </Link>

        {/* Escritorio: links + telefono + WhatsApp */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-7 list-none">
            {links.map((l) => {
              const activo = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-display text-[14px] font-medium transition-colors duration-200 pb-1"
                    style={{ color: activo ? "#16181D" : "#6B7280", borderBottom: activo ? "2px solid #D0021B" : "2px solid transparent" }}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <span className="h-6 w-px" style={{ background: "#D5D2CC" }} aria-hidden="true" />

          <a href={TEL_URL} className="flex items-center gap-2 font-display font-semibold text-[14px] text-[#16181D] hover:text-[#D0021B] transition-colors">
            <IconoTelefono />
            {TELEFONO_VISIBLE}
          </a>

          <a
            href={WA_COTIZAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-display font-semibold text-[14px] px-5 py-3 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "#D0021B", color: "#fff" }}
          >
            <IconoWhatsApp />
            Escríbenos por WhatsApp
          </a>
        </div>

        {/* Movil y tablet: hamburguesa */}
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden flex flex-col items-center justify-center w-10 h-10 gap-[5px]"
        >
          <span className="block w-6 h-[2px] transition-transform duration-300" style={{ background: "#16181D", transform: open ? "translateY(7px) rotate(45deg)" : "none" }} />
          <span className="block w-6 h-[2px] transition-opacity duration-200" style={{ background: "#16181D", opacity: open ? 0 : 1 }} />
          <span className="block w-6 h-[2px] transition-transform duration-300" style={{ background: "#16181D", transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

      {/* Menu desplegable */}
      <div
        className="lg:hidden absolute left-0 right-0 top-[76px] overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 420 : 0, background: "rgba(250,250,248,0.99)", borderBottom: open ? "1px solid #E8E6E1" : "none" }}
      >
        <ul className="flex flex-col list-none px-6 py-4 gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-[17px] font-medium block py-3"
                style={{ color: pathname === l.href ? "#D0021B" : "#16181D" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="pt-3 mt-1 border-t border-[#E8E6E1]">
            <a href={TEL_URL} className="flex items-center gap-2 font-display font-semibold text-[16px] py-3 text-[#16181D]">
              <IconoTelefono />
              {TELEFONO_VISIBLE}
            </a>
          </li>
          <li className="pt-1">
            <a
              href={WA_COTIZAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 font-display font-semibold text-[15px] px-6 py-3.5 rounded-lg"
              style={{ background: "#D0021B", color: "#fff" }}
            >
              <IconoWhatsApp size={16} />
              Escríbenos por WhatsApp
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
