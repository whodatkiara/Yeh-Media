"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useVideoErrorRetry } from "@/lib/use-video-retry";

/**
 * The "imagined hotels" slide (HomeDeck slide 1): three torn-newsprint
 * building cut-outs that assemble themselves, with vivid colour "screens"
 * set into some of their window openings — a deliberate modern pop against
 * the grainy monochrome facades.
 *
 * Two separate signals from the deck:
 *  - `visible` — fade the whole layer in/out. Goes true the moment a
 *    scroll toward slide 1 commits (so the layer cross-fades in over the
 *    outgoing slide) and false the moment a scroll away commits.
 *  - `assemble` — run the building assembly. Held back until the slide has
 *    actually settled. When it drops, the pose is held briefly so nothing
 *    visibly rewinds mid-fade.
 *
 * The buildings slide in bare — no window is visible while they're moving.
 * Only once assembled does the window "spotlight" start: one window lit at
 * a time, never more — the elevator first (it fades in as it starts its
 * ride up the facade), holds, fades out; then the next window fades in
 * elsewhere, holds, fades out; looping through the rest. See WINDOW_KEYS/
 * WINDOW_HOLD_MS below for the order and pacing, and .hotel-win/.is-current
 * in app/globals.css for how a window actually shows.
 *
 * The elevator, room-service, and breakfast windows are real silent clips
 * (generated in Higgsfield, locked camera); the keyhole window cross-fades
 * through a few room interiors on its own.
 */

type WinVars = CSSProperties & {
  "--wx": string;
  "--wy": string;
  "--ww": string;
  "--wh": string;
};

const W = "/images/hotel-illustration/windows";
const V = "/video/hotel-illustration";

const WINDOW_KEYS = [
  "elevator",
  "room-service",
  "keyhole",
  "breakfast",
] as const;
type WindowKey = (typeof WINDOW_KEYS)[number];

// The keyhole window cross-fades through several room interiors on its
// own, rather than showing one still — see KEYHOLE_CYCLE_MS below.
const KEYHOLE_IMAGES = [
  `${W}/keyhole-1.jpg`,
  `${W}/keyhole-2.jpg`,
  `${W}/keyhole-3.jpg`,
  `${W}/keyhole-4.jpg`,
  `${W}/keyhole-5.jpg`,
];
const KEYHOLE_CYCLE_MS = 700;

// How long each window stays lit before handing off to the next. The
// elevator's and room-service's clips are both 4s; each hold is just that
// plus a short beat, not a long dwell, so the handoff to the next window
// follows close behind the clip actually finishing. The keyhole's covers
// one full pass through KEYHOLE_IMAGES.
const WINDOW_HOLD_MS: Record<WindowKey, number> = {
  elevator: 4400,
  "room-service": 3300,
  keyhole: KEYHOLE_CYCLE_MS * KEYHOLE_IMAGES.length,
  breakfast: 4400,
};

// Once the buildings have visually finished assembling (see the
// slide/gap timing on .hotel-row-track in globals.css) before the first
// window — the elevator — starts its turn.
const FIRST_WINDOW_DELAY_MS = 1300;

// preload="metadata" (not "none") on every clip below is deliberate —
// these autoplay on a fixed timer with no user click, so the browser
// needs a head start buffering before a window's brief turn comes up.
// preload="none" is fine for something the user clicks and waits on
// (the /work grid's videos), but starved these of the runway they need,
// which read as "the video doesn't work" even though the file was fine.

// A window's clip only plays during its own turn in the spotlight —
// pausing (and rewinding) it the rest of the time, same reasoning as the
// portfolio filmstrip's focused-only playback.
function useSpotlightVideo(
  ref: RefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [ref, active]);
}

export default function HotelRow({
  visible,
  assemble,
}: {
  visible: boolean;
  assemble: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [played, setPlayed] = useState(false);
  const [current, setCurrent] = useState<WindowKey | "all" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const elevatorVideoRef = useRef<HTMLVideoElement>(null);
  const roomServiceVideoRef = useRef<HTMLVideoElement>(null);
  const breakfastVideoRef = useRef<HTMLVideoElement>(null);
  const [keyholeIndex, setKeyholeIndex] = useState(0);

  useEffect(() => {
    if (!assemble) {
      clearTimeout(timerRef.current);
      setCurrent(null);
      const t = setTimeout(() => setPlayed(false), 850);
      return () => clearTimeout(t);
    }

    if (reducedMotion) {
      setPlayed(true);
      setCurrent("all"); // no cycling — every window shown at once
      return;
    }

    const id = requestAnimationFrame(() => setPlayed(true));

    function step(i: number, delay: number) {
      timerRef.current = setTimeout(() => {
        const key = WINDOW_KEYS[i];
        setCurrent(key);
        step((i + 1) % WINDOW_KEYS.length, WINDOW_HOLD_MS[key]);
      }, delay);
    }
    step(0, FIRST_WINDOW_DELAY_MS);

    return () => {
      cancelAnimationFrame(id);
      clearTimeout(timerRef.current);
    };
  }, [assemble, reducedMotion]);

  function winClass(key: WindowKey, extra?: string) {
    const lit = current === "all" || current === key;
    return ["hotel-win", extra, lit && "is-current"].filter(Boolean).join(" ");
  }

  // Under reduced motion neither clip plays — the poster stands in as the
  // still.
  useSpotlightVideo(
    elevatorVideoRef,
    !reducedMotion && (current === "elevator" || current === "all"),
  );
  useSpotlightVideo(
    roomServiceVideoRef,
    !reducedMotion && (current === "room-service" || current === "all"),
  );
  useSpotlightVideo(
    breakfastVideoRef,
    !reducedMotion && (current === "breakfast" || current === "all"),
  );

  // See lib/use-video-retry.ts — local file loads have shown intermittent
  // failures even on files verified correct; a silent reload usually
  // clears it up.
  useVideoErrorRetry(elevatorVideoRef);
  useVideoErrorRetry(roomServiceVideoRef);
  useVideoErrorRetry(breakfastVideoRef);

  // The keyhole window cycles through its room interiors only during its
  // own turn — under reduced motion (current === "all") it just holds on
  // the first one, same spirit as the videos staying on their poster.
  useEffect(() => {
    if (reducedMotion || current !== "keyhole") return;
    setKeyholeIndex(0);
    const id = setInterval(() => {
      setKeyholeIndex((i) => (i + 1) % KEYHOLE_IMAGES.length);
    }, KEYHOLE_CYCLE_MS);
    return () => clearInterval(id);
  }, [current, reducedMotion]);

  return (
    <div
      className={`hotel-row${visible ? " is-visible" : ""}${played ? " is-in" : ""}`}
      aria-hidden={!visible}
    >
      <div className="hotel-row-track">
        <div className="hotel-piece hotel-left">
          <img src="/images/hotel-illustration/left.png" alt="" />
          {/* room service: a real clip now — the butler walking closer
              through the peephole view — rather than a still. */}
          <span
            className={winClass("room-service")}
            style={
              { "--wx": "18%", "--wy": "15%", "--ww": "19%", "--wh": "32%" } as WinVars
            }
          >
            <video
              ref={roomServiceVideoRef}
              src={`${V}/room-service.mp4`}
              poster={`${W}/room-service.jpg`}
              muted
              playsInline
              preload="metadata"
            />
          </span>
          {/* keyhole: one of the ground-arcade arches. Cross-fades through
              a few room interiors on its own rather than showing one. */}
          <span
            className={winClass("keyhole")}
            style={
              { "--wx": "42%", "--wy": "63%", "--ww": "16%", "--wh": "23%" } as WinVars
            }
          >
            {KEYHOLE_IMAGES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`hotel-win-cycle-img${i === keyholeIndex ? " is-active" : ""}`}
              />
            ))}
          </span>
        </div>

        <div className="hotel-piece hotel-center">
          <img src="/images/hotel-illustration/center.png" alt="" />
          {/* the elevator: first in the rotation, fading in as it rides up.
              A real clip now — closed doors opening on a locked camera —
              rather than a still; only plays during its own turn. */}
          <span
            className={winClass("elevator", "lift")}
            style={
              { "--wx": "40%", "--wy": "27%", "--ww": "20%", "--wh": "31%" } as WinVars
            }
          >
            <video
              ref={elevatorVideoRef}
              src={`${V}/elevator.mp4`}
              poster={`${W}/elevator.jpg`}
              muted
              playsInline
              preload="metadata"
            />
          </span>
        </div>

        <div className="hotel-piece hotel-right">
          <img src="/images/hotel-illustration/right.png" alt="" />
          {/* breakfast: an in-room tray, a hand lifting the silver dome
              cover away to reveal french toast underneath — a real clip,
              only plays during its own turn. */}
          <span
            className={winClass("breakfast")}
            style={
              { "--wx": "11%", "--wy": "19%", "--ww": "17%", "--wh": "27%" } as WinVars
            }
          >
            <video
              ref={breakfastVideoRef}
              src={`${V}/breakfast.mp4`}
              poster={`${W}/breakfast.jpg`}
              muted
              playsInline
              preload="metadata"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
