import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "CFE Geolocalizador | Comisión Federal de Electricidad",
  description:
    "Sistema de geolocalización de componentes eléctricos y bitácora vehicular para CFE",
  keywords:
    "CFE, geolocalización, componentes eléctricos, restauradores, seccionadores, Puente de Ixtla",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--cfe-gray-100)]">
        <Navbar />
        <main className="h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
