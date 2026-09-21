import type { Metadata, Viewport } from "next";
import { Archivo, Manrope } from "next/font/google";
import "./globals.css";
import { HORARIO } from "@/lib/site";

// Autoalojadas: next/font las descarga al compilar y las sirve desde el propio
// sitio. Antes venian por @import de Google Fonts en el CSS, y desde Next 16.3
// el compilador descarta ese @import: el sitio quedaba con la fuente del sistema.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://santiagogarage.cl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Santiago Garage — Desabolladura y Pintura Automotriz en San Miguel",
    template: "%s | Santiago Garage",
  },
  description:
    "Taller de desabolladura y pintura automotriz en San Miguel, Santiago. Horno de pintura profesional, materiales PPG y Glasurit, gestión con aseguradoras y todos los medios de pago. Más de 20 años de experiencia.",
  keywords: [
    "desabolladura", "pintura automotriz", "taller automotriz San Miguel",
    "horno de pintura", "carrocería Santiago", "pintura de autos",
    "gestión de siniestros", "Santiago Garage",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: "Santiago Garage",
    title: "Santiago Garage — Desabolladura y Pintura Automotriz",
    description:
      "Horno de pintura profesional, materiales de primer nivel y más de 20 años de experiencia en San Miguel, Santiago.",
    images: [{ url: "/logo.png", width: 1536, height: 1024, alt: "Santiago Garage" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Datos estructurados para Google (negocio local) — muestra dirección, horario y logo en los resultados
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoBodyShop",
  name: "Santiago Garage",
  image: `${SITE_URL}/logo.png`,
  "@id": SITE_URL,
  url: SITE_URL,
  telephone: "+56986111234",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ureta Cox 1038",
    addressLocality: "San Miguel",
    addressRegion: "Región Metropolitana",
    addressCountry: "CL",
  },
  geo: { "@type": "GeoCoordinates", latitude: -33.4987, longitude: -70.6607 },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: HORARIO.semana.abre, closes: HORARIO.semana.cierra },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: HORARIO.sabado.abre, closes: HORARIO.sabado.cierra },
  ],
  sameAs: [
    "https://www.instagram.com/santiagogarage.cl/",
    "https://www.tiktok.com/@santiagogarage.cl",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
