"use client";

import { useRef } from "react";
import { projects, type Project } from "@/components/Portfolio";
import PinnedRail from "@/components/PinnedRail";
import RailPageHeader from "@/components/RailPageHeader";
import { useVideoErrorRetry } from "@/lib/use-video-retry";

// Row height: kept modest on phones so the neighbouring clips still peek in
// from the sides.
const RAIL_H = "h-[46svh] md:h-[62svh] max-h-[700px]";

// A <video> has no size until it loads, so each clip gets a box in its real
// proportions. Landscape clips (the interview) are capped by width so they
// never run wider than the screen.
function sizeFor(aspect: string) {
  const [w, h] = aspect.split("/").map(Number);
  const landscape = w > h;
  return {
    style: { aspectRatio: aspect },
    className: landscape
      ? "h-[min(32svh,58vw)] md:h-[min(44svh,40vw)]"
      : RAIL_H,
  };
}

// The rail (PinnedRail) plays the clip nearest the centre and pauses the
// rest, so nothing here autoplays on its own.
function RailVideo({ project }: { project: Project }) {
  const ref = useRef<HTMLVideoElement>(null);
  useVideoErrorRetry(ref);
  const size = sizeFor(project.aspect ?? "9/16");
  return (
    <figure>
      <div className={`relative overflow-hidden bg-black/[0.04] ${size.className}`} style={size.style}>
        <video
          ref={ref}
          src={project.video}
          poster={project.src ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">
        {project.tag} · {project.project}
      </figcaption>
    </figure>
  );
}

/**
 * /work/videos — an unlisted page, meant only to be linked to. Every clip
 * in the archive in one pinned horizontal row (see PinnedRail).
 */
export default function WorkVideosView() {
  const videos = projects.filter((p) => p.video);
  return (
    <div className="bg-white text-black">
      <RailPageHeader
        title="In Motion."
        intro="This part of the site shows the films only. Scroll to move through them, one at a time."
      />
      <PinnedRail>
        {videos.map((project) => (
          <RailVideo key={project.project} project={project} />
        ))}
      </PinnedRail>
    </div>
  );
}
