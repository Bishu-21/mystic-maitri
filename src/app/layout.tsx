import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-playfair" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Mystic Maitri - AI Coordination Layer",
  description: "Connecting voice, documents, and clinical workflows with high-fidelity, human-in-the-loop multimodal agents.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} min-h-screen bg-brand-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
