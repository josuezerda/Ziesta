import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ziesta — La Red de Fidelización Inteligente",
  description:
    "Ziesta conecta comercios, clientes, municipios y entidades en un único ecosistema de beneficios que impulsa el consumo local mediante un programa de fidelización inteligente impulsado por IA.",
  keywords: [
    "fidelización",
    "puntos",
    "comercios",
    "Santiago del Estero",
    "beneficios",
    "IA",
    "lealtad",
    "consumo local",
  ],
  openGraph: {
    title: "Ziesta — La Red de Fidelización Inteligente",
    description:
      "Ecosistema de beneficios que impulsa el consumo local con IA.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
