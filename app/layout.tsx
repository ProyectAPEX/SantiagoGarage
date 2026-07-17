import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    images: [{ url: "/logo-oficial.png", width: 120, height: 120, alt: "Santiago Garage" }],
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
  image: `${SITE_URL}/logo-oficial.png`,
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
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "14:00" },
  ],
  sameAs: [
    "https://www.instagram.com/santiagogarage.cl/",
    "https://www.tiktok.com/@santiagogarage.cl",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
