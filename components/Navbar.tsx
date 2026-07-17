"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{ background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E6E1" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[76px]"
      aria-label="Navegación principal"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt="Santiago Garage"
          width={108}
          height={72}
          className="object-contain"
          style={{ transform: "scale(1.55)" }}
          priority
        />
      </Link>

      {/* Links — centrados absolutos respecto al nav */}
      <ul className="flex items-center gap-9 list-none absolute left-1/2 -translate-x-1/2">
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

      {/* CTA */}
      <Link
        href="/contacto"
        className="font-display font-semibold text-[14px] px-6 py-2.5 rounded-full transition-all duration-200 hover:opacity-85"
        style={{ background: "#16181D", color: "#fff" }}
      >
        Cotizar
      </Link>
    </nav>
  );
}
