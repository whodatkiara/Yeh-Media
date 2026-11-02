"use client";

import { useEffect, useRef, useState } from "react";
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
// rest, so nothing here autoplays on its own. Tapping a clip switches sound
// on (or off) for all of them.
function RailVideo({
  project,
  onTap,
  onMutedChange,
}: {
  project: Project;
  onTap: () => void;
  onMutedChange: (muted: boolean) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useVideoErrorRetry(ref);
  const size = sizeFor(project.aspect ?? "9/16");
  return (
    <figure>
      <div
        className={`relative cursor-pointer overflow-hidden bg-black/[0.04] ${size.className}`}
        style={size.style}
        onClick={onTap}
      >
        <video
          ref={ref}
          src={project.video}
          poster={project.src ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          onVolumeChange={(e) => onMutedChange(e.currentTarget.muted)}
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [sound, setSound] = useState(false);

  function allVideos() {
    return Array.from(rootRef.current?.querySelectorAll("video") ?? []);
  }

  // Browsers only allow sound after a tap, so it starts off and this runs
  // inside the tap. Unmuting whatever is playing right now is what lets the
  // browser count the tap as permission. iPhones decide per clip, though: a
  // clip that has never been started inside a tap can't later start with
  // sound on its own. So every other clip is started and stopped again right
  // here, inside the tap, which is what clears it to play with sound later
  // (clips the row has already moved onto in the meantime are left alone).
  function toggleSound() {
    const next = !sound;
    allVideos().forEach((v) => {
      v.muted = !next;
      if (next && v.paused) {
        v.play()
          .then(() => {
            if (v.dataset.live !== "1") {
              v.pause();
              v.currentTime = 0;
            }
          })
          .catch(() => {});
      }
    });
    setSound(next);
  }

  // If a browser refuses sound on a clip and the rail has to fall back to
  // silent playback (see PinnedRail), the button should say so.
  function onMutedChange(muted: boolean) {
    setSound((current) => (current === !muted ? current : !muted));
  }

  // Keep every clip in step with the button, including ones that haven't
  // been reached yet.
  useEffect(() => {
    allVideos().forEach((v) => {
      v.muted = !sound;
    });
  }, [sound]);

  return (
    <div ref={rootRef} className="bg-white text-black">
      <RailPageHeader
        title="In Motion."
        intro="This part of the site shows the films only. Scroll to move through them, one at a time. Tap the speaker icon, or any film, to hear them."
      />
      <PinnedRail>
        {videos.map((project) => (
          <RailVideo
            key={project.project}
            project={project}
            onTap={toggleSound}
            onMutedChange={onMutedChange}
          />
        ))}
      </PinnedRail>
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={sound}
        aria-label={sound ? "Turn sound off" : "Turn sound on"}
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center border border-black bg-white text-black transition-colors hover:bg-black hover:text-white sm:bottom-6 sm:left-6"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
          {sound ? (
            <>
              <path d="M15.5 9a4 4 0 0 1 0 6" />
              <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
            </>
          ) : (
            <path d="M16 9.5l5 5M21 9.5l-5 5" />
          )}
        </svg>
      </button>
    </div>
  );
}
