import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ATMAN - Herencia Digital para Criptoactivos",
  description:
    "Protege tu legado digital. Configura la transferencia segura de tus criptoactivos a tus seres queridos.",
  openGraph: {
    title: "ATMAN - Herencia Digital para Criptoactivos",
    description:
      "Protege tu legado digital. Configura la transferencia segura de tus criptoactivos a tus seres queridos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
