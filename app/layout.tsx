import type { Metadata, Viewport } from "next";
import { Archivo, Cormorant, Onest } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "@/lib/site-context";
import Grain from "@/components/Grain";
import Menu from "@/components/Menu";
import WorkWithUsButton from "@/components/WorkWithUsButton";
import Footer from "@/components/Footer";

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

// White browser chrome on phones, to match the page — otherwise Safari
// tints the status-bar area with whatever content is behind it.
export const viewport: Viewport = {
  themeColor: "#ffffff",
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
          {/* Phones: a SOLID white bar across the very top, always there, so
              scrolling content never shows through behind the logo, the
              Menu, or the browser's own status bar. It has to be a plain
              opaque background-color on a fixed element touching the top
              edge — that's what newer Safari samples to colour its status
              bar, and it ignores gradients (a gradient-only strip is why the
              first attempt changed nothing). The short fade below it is a
              separate element so it can't be mistaken for the bar. */}
          <div
            aria-hidden="true"
            className="md:hidden fixed top-0 inset-x-0 z-30 h-16 bg-white"
          />
          <div
            aria-hidden="true"
            className="md:hidden fixed top-16 inset-x-0 z-30 h-6 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, #fff, rgba(255,255,255,0))",
            }}
          />
          <Menu />
          <WorkWithUsButton />
          {children}
          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
