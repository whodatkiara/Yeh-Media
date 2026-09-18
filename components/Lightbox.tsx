"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/components/Portfolio";
import { useVideoErrorRetry } from "@/lib/use-video-retry";

/**
 * Full-screen viewer for a project's multi-item media (a photo series, or
 * more than one clip) — opened by clicking a card's cover on /work. Left/
 * right arrows (and arrow keys) page through `media`; Escape or clicking
 * the backdrop closes it. Videos autoplay with sound on arrival since
 * opening the lightbox is itself the deliberate "play" action.
 */
export default function Lightbox({
  media,
  startIndex,
  title,
  onClose,
}: {
  media: MediaItem[];
  startIndex: number;
  title: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const item = media[index];
  const hasMultiple = media.length > 1;
  const videoRef = useRef<HTMLVideoElement>(null);
  // See lib/use-video-retry.ts — local file loads have shown intermittent
  // failures even on files verified correct; a silent reload usually
  // clears it up.
  useVideoErrorRetry(videoRef);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && hasMultiple) {
        setIndex((i) => (i + 1) % media.length);
      } else if (e.key === "ArrowLeft" && hasMultiple) {
        setIndex((i) => (i - 1 + media.length) % media.length);
      }
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [hasMultiple, media.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center px-4 py-10"
      onClick={onClose}
    >
      <p className="fixed top-6 left-6 font-mono text-[11px] tracking-[0.2em] uppercase text-white/60">
        {title} {hasMultiple && `· 0${index + 1} / 0${media.length}`}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="fixed top-6 right-6 font-mono text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors"
      >
        Close
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + media.length) % media.length);
            }}
            aria-label="Previous"
            className="fixed left-1 sm:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-4xl leading-none px-3 py-5"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % media.length);
            }}
            aria-label="Next"
            className="fixed right-1 sm:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-4xl leading-none px-3 py-5"
          >
            ›
          </button>
        </>
      )}

      <div
        className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video" ? (
          <video
            key={item.src}
            ref={videoRef}
            src={item.src}
            controls
            playsInline
            autoPlay
            className="max-h-[85vh] max-w-full"
          />
        ) : (
          // Plain <img>, not next/image — the lightbox needs to size to
          // whatever the photo's real aspect is, at up to 85vh.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.src}
            src={item.src}
            alt=""
            className="max-h-[85vh] max-w-full object-contain"
          />
        )}
      </div>
    </div>
  );
}
