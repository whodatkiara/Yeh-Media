"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { useSite } from "@/lib/site-context";
import siteData from "@/data/site.json";

export default function Menu() {
  const [open, setOpen] = useState(false);
  const { deckIndex, setDeckIndex } = useSite();

  function handleHomeClick(e: MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    // Already on the deck — jump to its first slide instead of relying on
    // Link's same-URL no-op navigation.
    if (deckIndex !== null) {
      e.preventDefault();
      setDeckIndex(0);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-6 right-6 z-40 font-mono text-[11px] tracking-[0.25em] uppercase text-black/50 hover:text-black transition-colors cursor-pointer"
      >
        Menu
      </button>

      <div
        className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-6 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-6 right-6 font-mono text-[11px] tracking-[0.25em] uppercase text-black/50 hover:text-black transition-colors cursor-pointer"
        >
          Close
        </button>

        {siteData.menu.items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={item.href === "/" ? handleHomeClick : () => setOpen(false)}
            className="font-sans font-semibold text-4xl md:text-5xl tracking-tight uppercase text-black/40 hover:text-black transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
