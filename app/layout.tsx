import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventest - Invitación Digital",
  description: "Te invitamos a compartir una noche inolvidable",
  openGraph: {
    title: "Eventest - Invitación Digital",
    description: "Te invitamos a compartir una noche inolvidable",
    url: "https://invitacion-v2.eventechy.com/",
    siteName: "Eventest",
    images: [
      {
        url: "/banner.webp",
        width: 1200,
        height: 630,
        alt: "Eventest Preview",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventest - Invitación Digital",
    description: "Te invitamos a compartir una noche inolvidable",
    images: ["/banner.webp"],
    creator: "@eventest",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
