"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import siteData from "@/data/site.json";
import { useVideoErrorRetry } from "@/lib/use-video-retry";

export type MediaItem = { type: "image" | "video"; src: string };

export type Project = {
  tag: string;
  project: string;
  format: string;
  type: "video" | "image";
  // Poster/cover image. Null until a real file is in place — see Thumb
  // below for how an empty slot renders in the meantime.
  src: string | null;
  // The clip, for a single-video piece. When set, Thumb / the /work grid
  // render a <video> instead of the poster <img>.
  video?: string;
  // Native aspect ratio for the /work grid, e.g. "9/16", "16/9" — videos
  // need this (a <video> has no intrinsic size until it loads); photo-only
  // pieces are left unset and just size to their real image.
  aspect?: string;
  // For multi-item pieces (a photo series, or more than one clip): the full
  // ordered set. src is normally media[0]'s own src. On the homepage
  // filmstrip, multiple *images* cross-fade on their own; on /work the
  // cover is clickable and opens the lightbox to page through all of them.
  media?: MediaItem[];
  description: string;
  // Small stat row shown under a /work card's description, counting up
  // into view — see KpiRow. Placeholder numbers for now (marked below);
  // swap in the real figures once they're in hand.
  kpis?: { label: string; value: number; suffix?: string }[];
};

// Order matters: the first FEATURED_COUNT entries are what the homepage
// deck's filmstrip teases, in this order. The rest show only on /work.
// Descriptions read like an agency talking about its own case studies —
// confident and specific about the creative choice behind each piece,
// not a plain caption — while still staying concrete rather than
// generic, and not calling out whose project or space each one is.
export const projects: Project[] = [
  {
    tag: "Rotterdam",
    project: "Rotterdam, in Motion",
    format: "Cinematic Film",
    type: "video",
    src: "/images/portfolio/rotterdam-in-motion.jpg",
    video: "/video/portfolio/rotterdam-in-motion.mp4",
    aspect: "9/16",
    description:
      "A voiceover-led film that treats the space as the lead, not the backdrop, cut like a story rather than a walkthrough.",
  },
  {
    tag: "Paris",
    project: "Paris, by Design",
    format: "Instagram · 88.3K views",
    type: "video",
    src: "/images/portfolio/paris-by-design.jpg",
    video: "/video/portfolio/paris-by-design.mp4",
    aspect: "9/16",
    description:
      "An ongoing edit of Paris interiors, each pick chosen for atmosphere and material, never for a star rating.",
    kpis: [
      { label: "Views", value: 88300 },
      { label: "Saves", value: 3700 },
      { label: "Follows", value: 180 },
    ],
  },
  {
    tag: "Rotterdam",
    project: "BTS Content",
    format: "Photo Series",
    type: "image",
    src: "/images/portfolio/bts-content/01.jpg",
    aspect: "2/3",
    media: [
      { type: "image", src: "/images/portfolio/bts-content/01.jpg" },
      { type: "image", src: "/images/portfolio/bts-content/02.jpg" },
      { type: "image", src: "/images/portfolio/bts-content/03.jpg" },
      { type: "image", src: "/images/portfolio/bts-content/04.jpg" },
      { type: "image", src: "/images/portfolio/bts-content/05.jpg" },
      { type: "image", src: "/images/portfolio/bts-content/06.jpg" },
    ],
    description:
      "The set, the light, the moments between takes: a behind-the-scenes look at how one Rotterdam shoot came together.",
  },
  {
    tag: "Paris",
    project: "Where to Stay, by Design",
    format: "Instagram · 45.7K views",
    type: "video",
    src: "/images/portfolio/where-to-stay.jpg",
    video: "/video/portfolio/where-to-stay.mp4",
    aspect: "9/16",
    description:
      "A recurring edit of hotel picks, framed on atmosphere first and amenities second: a format, not a one-off post.",
    kpis: [
      { label: "Views", value: 45700 },
      { label: "Follows", value: 270 },
      { label: "Saves", value: 1300 },
    ],
  },
  {
    tag: "Rotterdam",
    project: "The Rotterdam Interview",
    format: "Interview · Website Feature",
    type: "video",
    src: "/images/portfolio/rotterdam-interview.jpg",
    video: "/video/portfolio/rotterdam-interview.mp4",
    aspect: "16/9",
    description:
      "A longer, unhurried conversation, built to live on the website rather than compete for attention in the feed.",
  },
  {
    tag: "Studio",
    project: "A Morning, Slowed Down",
    format: "Cinematic Film",
    type: "video",
    src: "/images/portfolio/at-home-studio-1.jpg",
    video: "/video/portfolio/at-home-studio-1.mp4",
    aspect: "9/16",
    description:
      "A quieter film, paced around light and stillness, where the space carries the story without a single line of dialogue.",
  },
  {
    tag: "Paris",
    project: "Fashion Interiors",
    format: "Instagram · 15.9K views",
    type: "video",
    src: "/images/portfolio/saint-martin-walk.jpg",
    video: "/video/portfolio/saint-martin-walk.mp4",
    aspect: "9/16",
    description:
      "Paris' retail interiors, read with the same eye for form and detail as the fashion inside them.",
    kpis: [{ label: "Views", value: 15900 }],
  },
  {
    tag: "Rotterdam",
    project: "A Rotterdam Interior",
    format: "Process · Photo Series",
    type: "image",
    src: "/images/portfolio/process/01.jpg",
    aspect: "2/3",
    media: [
      { type: "image", src: "/images/portfolio/process/01.jpg" },
      { type: "image", src: "/images/portfolio/process/02.jpg" },
      { type: "image", src: "/images/portfolio/process/03.jpg" },
      { type: "image", src: "/images/portfolio/process/04.jpg" },
      { type: "image", src: "/images/portfolio/process/05.jpg" },
      { type: "image", src: "/images/portfolio/process/06.jpg" },
      { type: "image", src: "/images/portfolio/process/07.jpg" },
      { type: "image", src: "/images/portfolio/process/08.jpg" },
      { type: "image", src: "/images/portfolio/process/09.jpg" },
      { type: "image", src: "/images/portfolio/process/10.jpg" },
      { type: "image", src: "/images/portfolio/process/11.jpg" },
      { type: "image", src: "/images/portfolio/process/12.jpg" },
      { type: "image", src: "/images/portfolio/process/13.jpg" },
      { type: "image", src: "/images/portfolio/process/14.jpg" },
    ],
    description:
      "Sketches, material samples, site walkthroughs: the decisions behind a finished space, caught in the making rather than the result.",
  },
  {
    tag: "Studio",
    project: "Details Worth Staying For",
    format: "Cinematic Film",
    type: "video",
    src: "/images/portfolio/at-home-studio-2.jpg",
    video: "/video/portfolio/at-home-studio-2.mp4",
    aspect: "9/16",
    description:
      "Where the eye lingers: texture, material, the small objects a wide shot would miss.",
  },
  {
    tag: "Studio",
    project: "Everything Is in the Details",
    format: "Photo Series",
    type: "image",
    src: "/images/portfolio/details/01.jpg",
    aspect: "2/3",
    media: [
      { type: "image", src: "/images/portfolio/details/01.jpg" },
      { type: "image", src: "/images/portfolio/details/02.jpg" },
      { type: "image", src: "/images/portfolio/details/03.jpg" },
      { type: "image", src: "/images/portfolio/details/04.jpg" },
      { type: "image", src: "/images/portfolio/details/05.jpg" },
      { type: "image", src: "/images/portfolio/details/06.jpg" },
      { type: "image", src: "/images/portfolio/details/07.jpg" },
    ],
    description:
      "Material, texture, finish: the details that decide whether a space merely looks good or actually feels considered.",
  },
];

// The deck's filmstrip teases a handful rather than the full archive — the
// rest live on /work, in a grid rather than a one-at-a-time scroll. No
// extra filmstrip row for that — the last featured project's own detail
// panel carries a link into the full archive instead, so seeing it never
// costs an extra scroll step.
const FEATURED_COUNT = 4;
export const featuredProjects = projects.slice(0, FEATURED_COUNT);
export const filmstripLength = FEATURED_COUNT;

// Fixed height per filmstrip row — also drives the vertical offset math
// below, so the focused row always lands centered in the visible window.
const ROW_STEP = 160;

/**
 * A single filmstrip thumbnail: the clip (video pieces), a cross-fading
 * cycle through its images (a multi-photo piece — e.g. BTS Content, which
 * changes on its own every couple of seconds, scrolled to or not), the
 * real photo (once `src` is set), or — until then — a bordered placeholder
 * carrying just the format ("Video" / "Photo"), so an empty slot reads as
 * "not in yet" rather than a broken image icon. Only the focused row's
 * video actually plays; the rest hold on their poster frame so the
 * homepage doesn't pull every clip on load.
 */
function Thumb({ project, focused }: { project: Project; focused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cycleImages = project.media
    ?.filter((m) => m.type === "image")
    .map((m) => m.src);
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (focused) v.play().catch(() => {});
    else {
      v.pause();
      v.currentTime = 0;
    }
  }, [focused]);

  // See lib/use-video-retry.ts — local file loads have shown intermittent
  // failures even on files verified correct; a silent reload usually
  // clears it up.
  useVideoErrorRetry(videoRef);

  useEffect(() => {
    if (!cycleImages || cycleImages.length < 2) return;
    const id = setInterval(
      () => setCycleIndex((i) => (i + 1) % cycleImages.length),
      2200,
    );
    return () => clearInterval(id);
  }, [cycleImages]);

  if (project.video) {
    return (
      <div className="relative aspect-[4/5] w-32 sm:w-40 overflow-hidden">
        <video
          ref={videoRef}
          src={project.video}
          poster={project.src ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover transition-[filter] duration-500 ${
            focused ? "" : "grayscale"
          }`}
        />
      </div>
    );
  }

  if (cycleImages && cycleImages.length > 0) {
    return (
      <div className="relative aspect-[4/5] w-32 sm:w-40 overflow-hidden">
        {cycleImages.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="160px"
            className={`object-cover transition-opacity duration-700 ${
              i === cycleIndex ? "opacity-100" : "opacity-0"
            } ${focused ? "" : "grayscale"}`}
          />
        ))}
      </div>
    );
  }

  if (!project.src) {
    return (
      <div className="relative aspect-[4/5] w-32 sm:w-40 border border-black/10 flex items-center justify-center">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-black/30">
          {project.type === "video" ? "Video" : "Photo"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-32 sm:w-40 overflow-hidden">
      <Image
        src={project.src}
        alt=""
        fill
        sizes="160px"
        className={`object-cover transition-[filter] duration-500 ${
          focused ? "" : "grayscale"
        }`}
      />
    </div>
  );
}

/**
 * Pure content for the "Content We've Shaped." deck slide: a vertical
 * filmstrip rather than a static grid. The focused project sits centered,
 * bigger and in color; neighbors above/below are smaller and grayscale,
 * partially cropped by the container. `index` is owned by HomeDeck, which
 * intercepts wheel/touch/key input while this slide is current and steps
 * through projects before handing scroll back to the deck's normal
 * slide-to-slide navigation — see HomeDeck.tsx.
 */
export default function Portfolio({ index }: { index: number }) {
  const current = featuredProjects[index];
  const isLast = index === featuredProjects.length - 1;

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      <p className="font-mono font-normal text-sm text-black/60 leading-relaxed max-w-md">
        {siteData.copy.portfolioIntro}
      </p>
      <div className="flex items-center gap-6 sm:gap-10 w-full">
        <div className="flex flex-col gap-4 shrink-0">
          <div
            className="relative w-32 sm:w-40 overflow-hidden"
            style={{ height: ROW_STEP * 3 }}
          >
            <div
              className="absolute inset-x-0 top-0 transition-transform duration-500 ease-out will-change-transform"
              style={{ transform: `translateY(${(1 - index) * ROW_STEP}px)` }}
            >
              {featuredProjects.map((item, i) => {
                const distance = Math.abs(i - index);
                const focused = distance === 0;
                return (
                  <div
                    key={item.project}
                    className="flex items-center justify-center transition-opacity duration-500"
                    style={{
                      height: ROW_STEP,
                      opacity: focused ? 1 : distance === 1 ? 0.5 : 0.15,
                    }}
                  >
                    <div
                      className="transition-transform duration-500 ease-out will-change-transform"
                      style={{ transform: focused ? "scale(1)" : "scale(0.625)" }}
                    >
                      <Thumb project={item} focused={focused} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Only on the last featured piece — reaching the end of the
              highlights is what naturally invites "see more", rather than
              repeating the link under every single project. Sits under
              the filmstrip itself rather than in the text column, so it
              reads as the natural next step after the thumbnail — pulled
              up with a negative margin since the filmstrip box is a fixed
              3-row-tall window (for the neighbour-preview effect) and the
              last item has no next row to fill that bottom third, which
              would otherwise leave a whole empty band before the link. */}
          {isLast && (
            <Link
              href="/work"
              style={{ marginTop: -(ROW_STEP - 36) }}
              className="inline-block font-mono text-sm tracking-[0.15em] uppercase text-black/50 hover:text-black underline underline-offset-4 decoration-black/30 transition-colors"
            >
              See more selected projects →
            </Link>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div key={index} className="deck-fade-in">
            <p className="font-mono text-[10px] tracking-[0.2em] text-black/35 mb-2">
              0{index + 1} / 0{featuredProjects.length}
            </p>
            <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-black/50 mb-1">
              {current.tag} · {current.format}
            </p>
            <h3 className="font-sans font-semibold text-2xl tracking-tight mb-3">
              {current.project}
            </h3>
            <p className="font-mono text-sm text-black/60 leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
