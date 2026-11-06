"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/components/Portfolio";

// Two photos in the process series aren't 2:3; they are shown whole inside the
// frame instead of being cropped.
const SHOW_WHOLE = new Set([
  "/images/portfolio/process/03.jpg",
  "/images/portfolio/process/04.jpg",
]);

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The photos of a series, one at a time, for the frozen side of a case study
 * page. Move through them with the arrow buttons, the arrow keys, a swipe, or
 * by tapping the photo.
 */
export default function CaseGallery({
  media,
  title,
}: {
  media: MediaItem[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const count = media.length;
  const touchX = useRef<number | null>(null);

  function go(step: number) {
    setIndex((i) => (i + step + count) % count);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  return (
    <div>
      <div
        className="relative aspect-[2/3] w-full cursor-pointer overflow-hidden bg-black/[0.04]"
        onClick={() => go(1)}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start === null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {media.map((m, i) => (
          <Image
            key={m.src}
            src={m.src}
            alt={`${title}, photo ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(max-width: 768px) 90vw, 40vw"
            className={`transition-opacity duration-700 ${
              SHOW_WHOLE.has(m.src) ? "object-contain" : "object-cover"
            } ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/60">
          {pad(index + 1)} / {pad(count)}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="h-11 w-11 border border-black font-mono text-base transition-colors hover:bg-black hover:text-white"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="h-11 w-11 border border-black font-mono text-base transition-colors hover:bg-black hover:text-white"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
