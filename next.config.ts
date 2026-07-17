import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content Security Policy — solo permite los orígenes que el sitio realmente usa
const csp = [
  "default-src 'self'",
  // Next.js inyecta scripts inline; en dev necesita eval para HMR
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Estilos inline (Tailwind/styles) + Google Fonts CSS
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Imágenes propias, Unsplash y data URIs
  "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com",
  // Mapa embebido de Google
  "frame-src https://www.google.com",
  "connect-src 'self'" + (isDev ? " ws: wss:" : ""),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://wa.me",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Evita que el sitio sea embebido en iframes de terceros (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Bloquea la detección de tipo MIME (sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No filtra la URL de origen a sitios externos
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva APIs del navegador que el sitio no usa
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Fuerza HTTPS por 2 años una vez desplegado (los navegadores lo ignoran en localhost)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Aislamiento de origen
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  // Oculta el header X-Powered-By: Next.js (menos información para atacantes)
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
