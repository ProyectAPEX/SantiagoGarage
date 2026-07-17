import Link from "next/link";
import Image from "next/image";
import { WA_URL, TELEFONO_VISIBLE, EMAIL_CONTACTO } from "@/lib/site";

export default function Footer() {
  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #E8E6E1" }}>

      {/* MAIN GRID */}
      <div className="px-10 py-16">
        <div className="max-w-[1100px] mx-auto grid gap-14 text-center items-start" style={{ gridTemplateColumns: "1fr 1fr 1fr", justifyItems: "center" }}>

          {/* BRAND */}
          <div className="flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="Santiago Garage"
              width={210}
              height={140}
              className="object-contain"
            />
            <p className="text-[14px] leading-relaxed mb-7" style={{ color: "#6B7280", maxWidth: 280 }}>
              Taller especializado en carrocería y pintura de alta gama. Más de 20 años restaurando vehículos en Santiago con estándar de fábrica.
            </p>
            {/* Socials */}
            <div className="flex items-center justify-center gap-4">
              <a href="https://www.instagram.com/santiagogarage.cl/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black hover:text-white"
                style={{ border: "1px solid #E8E6E1", color: "#16181D" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@santiagogarage.cl" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black hover:text-white"
                style={{ border: "1px solid #E8E6E1", color: "#16181D" }}>
                <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                </svg>
              </a>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black hover:text-white"
                style={{ border: "1px solid #E8E6E1", color: "#16181D" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* SERVICIOS */}
          <div>
            <p className="font-display font-semibold text-[15px] mb-5">Servicios</p>
            <ul className="flex flex-col gap-3">
              {[
                "Desabolladura de Precisión",
                "Pintura de Alta Gama",
                "Reparación de Plásticos",
                "Pulido & Detailing",
                "Diagnóstico Digital",
                "Gestión de Siniestros",
              ].map((s) => (
                <li key={s}>
                  <Link href="/servicios" className="text-[14px] transition-colors hover:text-black" style={{ color: "#6B7280" }}>
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACTO */}
          <div>
            <p className="font-display font-semibold text-[15px] mb-5">Contacto</p>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="https://maps.google.com/?q=Ureta+Cox+1038+San+Miguel" target="_blank" rel="noopener noreferrer"
                  className="text-[14px] transition-colors hover:text-black" style={{ color: "#6B7280" }}>
                  Ureta Cox 1038, San Miguel
                </a>
              </li>
              <li>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                  className="text-[14px] transition-colors hover:text-black" style={{ color: "#6B7280" }}>
                  {TELEFONO_VISIBLE}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL_CONTACTO}`}
                  className="text-[14px] transition-colors hover:text-black" style={{ color: "#6B7280" }}>
                  {EMAIL_CONTACTO}
                </a>
              </li>
              <li>
                <span className="text-[14px]" style={{ color: "#6B7280" }}>
                  Lun–Vie 8:00–18:00 · Sáb 9:00–14:00
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM */}
      <div className="px-10 py-5" style={{ borderTop: "1px solid #F0EEE9" }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <span className="text-[13px]" style={{ color: "#9CA3AF" }}>
            © 2026 Santiago Garage SPA · Todos los derechos reservados
          </span>
          <span className="text-[13px]" style={{ color: "#9CA3AF" }}>
            Desabolladura & Pintura Automotriz
          </span>
        </div>
      </div>

    </footer>
  );
}
