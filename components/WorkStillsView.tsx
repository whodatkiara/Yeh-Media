"use client";

import Image from "next/image";
import { projects } from "@/components/Portfolio";
import PinnedRail from "@/components/PinnedRail";
import RailPageHeader from "@/components/RailPageHeader";

const RAIL_H = "h-[46svh] md:h-[62svh] max-h-[700px]";

// Nearly every photo is 2:3; these two aren't, and are shown in their true
// proportions rather than being cropped into a 2:3 box.
const ASPECT_OVERRIDES: Record<string, number> = {
  "/images/portfolio/process/03.jpg": 1257 / 1760,
  "/images/portfolio/process/04.jpg": 2639 / 1759,
};

function Still({ src, alt }: { src: string; alt: string }) {
  const aspect = ASPECT_OVERRIDES[src] ?? 2 / 3;
  const landscape = aspect > 1;
  return (
    <div
      className={`relative overflow-hidden bg-black/[0.04] ${
        landscape ? "h-[min(33svh,58vw)] md:h-[min(45svh,42vw)]" : RAIL_H
      }`}
      style={{ aspectRatio: String(aspect) }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={landscape ? "(max-width: 767px) 90vw, 600px" : "(max-width: 767px) 60vw, 420px"}
        className="object-cover"
      />
    </div>
  );
}

/**
 * /work/stills — an unlisted page, meant only to be linked to. One pinned
 * horizontal row per photo series; once a series has scrolled through, the
 * page moves on to the next title (see PinnedRail).
 */
export default function WorkStillsView() {
  const series = projects.filter((p) => p.media && p.media.length > 1);
  return (
    <div className="bg-white text-black">
      <RailPageHeader
        title="In Stills."
        intro={
          <>
            This part of the site shows the photographs only, grouped by shoot.{" "}
            <span className="md:hidden">Swipe sideways</span>
            <span className="hidden md:inline">Scroll</span> to move through each series.
          </>
        }
      />
      {series.map((project, index) => {
        const photos = project.media!.filter((m) => m.type === "image");
        return (
          <PinnedRail
            key={project.project}
            nudge={index === 0}
            title={project.project}
            caption={`${project.tag} · ${photos.length} photos`}
          >
            {photos.map((m, i) => (
              <Still key={m.src} src={m.src} alt={`${project.project}, photo ${i + 1}`} />
            ))}
          </PinnedRail>
        );
      })}
    </div>
  );
}
