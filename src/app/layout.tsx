import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edesaventas.ec";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} | Distribución Mayorista Ecuador`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Distribución mayorista de sanitarios, griferías, lavamanos y acabados de construcción en Ecuador. Precios exclusivos para ferreterías y sub-distribuidores.",
  keywords: [
    "sanitarios Ecuador",
    "griferías Ecuador",
    "lavamanos Ecuador",
    "acabados construcción",
    "distribuidora ferreterías Ecuador",
    "productos sanitarios Quito",
    "mayorista construcción Ecuador",
    "EDESA",
    "BRIGGS Ecuador",
    "ferretería mayorista Ecuador",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: BASE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Distribución Mayorista Ecuador`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Distribución Mayorista Ecuador`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-EC">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
