"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { projects, type Project } from "@/components/Portfolio";
import { PORTFOLIO_SLIDE_INDEX } from "@/components/HomeDeck";
import Lightbox from "@/components/Lightbox";
import KpiRow from "@/components/KpiRow";
import ScrollReveal from "@/components/ScrollReveal";
import { useVideoErrorRetry } from "@/lib/use-video-retry";

/**
 * One grid card: media + caption, revealed with a short fade-and-rise the
 * moment it scrolls into view (see ScrollReveal) rather than all at once
 * on load — a lighter-weight echo of the deck's own slide transitions. A
 * small stagger by column keeps a row from popping in as one flat block.
 */
function WorkCard({
  item,
  onOpen,
  staggerMs,
}: {
  item: Project;
  onOpen: () => void;
  staggerMs: number;
}) {
  const multi = (item.media?.length ?? 0) > 1;
  // Videos need an explicit box (a <video> has no size until it loads);
  // photo-only pieces are left to their own real size.
  const boxStyle = item.video ? { aspectRatio: item.aspect } : undefined;
  const videoRef = useRef<HTMLVideoElement>(null);
  // See lib/use-video-retry.ts — local file loads have shown intermittent
  // failures even on files verified correct; a silent reload usually
  // clears it up.
  useVideoErrorRetry(videoRef);

  return (
    <ScrollReveal delayMs={staggerMs} className="flex flex-col gap-4">
      {multi ? (
        <button
          type="button"
          onClick={onOpen}
          className="group relative block w-full overflow-hidden text-left cursor-pointer"
          style={item.aspect ? { aspectRatio: item.aspect } : undefined}
        >
          {item.src && (
            <Image
              src={item.src}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
          <span className="absolute bottom-3 right-3 bg-black/70 text-white font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-1">
            {item.media!.length} {item.type === "video" ? "clips" : "photos"} · view →
          </span>
        </button>
      ) : item.video ? (
        <div className="relative w-full overflow-hidden" style={boxStyle}>
          {/* Not muted — this only plays on a deliberate click (native
              controls), so it can carry real sound. */}
          <video
            ref={videoRef}
            src={item.video}
            poster={item.src ?? undefined}
            controls
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : item.src ? (
        <img src={item.src} alt="" className="w-full h-auto block" />
      ) : (
        <div className="relative aspect-[4/5] w-full border border-black/10 flex items-center justify-center">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-black/30">
            {item.type === "video" ? "Video" : "Photo"}
          </span>
        </div>
      )}

      <div>
        <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-black/50 mb-1">
          {item.tag} · {item.format}
        </p>
        <h3 className="font-sans font-semibold text-xl tracking-tight mb-2">
          {item.project}
        </h3>
        <p className="font-mono text-sm text-black/60 leading-relaxed">
          {item.description}
        </p>
        {item.kpis && <KpiRow kpis={item.kpis} />}
      </div>
    </ScrollReveal>
  );
}

/**
 * The full portfolio — everything the deck's "Content We've Shaped."
 * filmstrip only teases a handful of (see FEATURED_COUNT in Portfolio.tsx).
 * A normal scrolling grid rather than the deck's one-at-a-time viewport,
 * since browsing a full archive wants overview, not pacing.
 *
 * Unlike the deck's uniform filmstrip thumbnails, each card here shows its
 * media in its own native shape — a vertical Instagram clip stays vertical,
 * the horizontal interview stays horizontal — via each project's `aspect`.
 * Pieces with more than one item (a photo series, or more than one clip)
 * show their cover with a count badge; clicking opens the Lightbox to page
 * through the rest with the arrow keys or the on-screen arrows.
 */
export default function WorkPage() {
  const [lightbox, setLightbox] = useState<{
    project: Project;
    index: number;
  } | null>(null);

  return (
    <div className="min-h-screen bg-white text-black px-6 md:px-16 py-28 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Lands back on the portfolio slide, not the hero — see the
            "?slide=" handling in HomeDeck.tsx. */}
        <Link
          href={`/?slide=${PORTFOLIO_SLIDE_INDEX}`}
          className="inline-block font-mono text-[11px] tracking-[0.2em] uppercase text-black/50 hover:text-black underline underline-offset-4 decoration-black/30 transition-colors mb-12"
        >
          ← Back to Yeh Media
        </Link>

        <h1 className="font-sans font-semibold text-4xl md:text-5xl tracking-tight uppercase mb-4">
          Our Work.
        </h1>
        <p className="font-mono font-normal text-sm md:text-base text-black/60 leading-relaxed max-w-lg mb-16">
          From concept to campaign, we turn an eye for interiors into content
          that performs, whatever the property. The full archive, not the
          highlight reel.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {projects.map((item, i) => (
            <WorkCard
              key={item.project}
              item={item}
              onOpen={() => setLightbox({ project: item, index: 0 })}
              staggerMs={(i % 3) * 90}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          media={lightbox.project.media!}
          startIndex={lightbox.index}
          title={lightbox.project.project}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
