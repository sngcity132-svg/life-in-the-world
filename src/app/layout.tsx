import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "LIFE IN THE WORLD — Open World Life Simulator",
  description:
    "Un simulateur de vie en monde ouvert. Première région : Sénégal. Explore, travaille, construis ta vie et sauvegarde ta progression hors connexion.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0e8a4a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <body className="bg-night-950 font-body text-white antialiased"><PWARegister />{children}</body>
    </html>
  );
}
