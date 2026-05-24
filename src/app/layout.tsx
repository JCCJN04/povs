import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: '--font-instrument'
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: '--font-instrument-serif'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: "Povs — Captura el día a través de todos",
  description: "Álbum privado de fotos para eventos. Los invitados se unen con un código QR. El álbum se revela al terminar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
