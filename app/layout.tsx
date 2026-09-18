import type { Metadata } from "next";
import { Archivo, Cormorant, Onest } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "@/lib/site-context";
import Grain from "@/components/Grain";
import Menu from "@/components/Menu";
import WorkWithUsButton from "@/components/WorkWithUsButton";

// Cormorant — a refined, high-contrast display serif (garamond-adjacent)
// for an elevated, editorial-fashion voice: the headline typeface.
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "variable",
});

// Onest — an ultra-thin geometric sans for labels, nav and body copy,
// replacing the typewriter-mono voice with something quieter and more premium.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: "variable",
});

// Archivo — a modern grotesk for the black-and-white minimal landing split
// (mapped to Tailwind's font-sans slot). Cormorant/Onest stay untouched for
// the rest of the site until those sections get the same treatment.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Yeh Media",
  description:
    "Yeh Media: concept, direction and content strategy for the hospitality industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${onest.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <SiteProvider>
          <Grain />
          <Menu />
          <WorkWithUsButton />
          {children}
        </SiteProvider>
      </body>
    </html>
  );
}
