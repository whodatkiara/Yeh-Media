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

// On phones the three buildings together are ~1200px wide — several times
// the screen — so only the middle one is ever in view, and three of the four
// windows would never be seen. Instead the whole row pans to bring the
// window whose turn it is to the centre of the screen. Where each window
// sits: which building, and how far across it (0-1, the centre of the
// window's --wx/--ww box below).
const WINDOW_FOCUS: Record<
  WindowKey,
  { piece: "left" | "center" | "right"; x: number }
> = {
  elevator: { piece: "center", x: 0.5 },
  "room-service": { piece: "left", x: 0.275 },
  keyhole: { piece: "left", x: 0.5 },
  breakfast: { piece: "right", x: 0.195 },
};

// Once the buildings have visually finished assembling (see the
// slide/gap timing on .hotel-row-track in globals.css) before the first
// window — the elevator — starts its turn.
const FIRST_WINDOW_DELAY_MS = 1300;

// preload="auto" on every clip below is deliberate — these autoplay on a
// fixed timer with no user click, so each needs to already be on hand when
// its brief turn in the spotlight comes up. That's cheap now: the clips are
// ~300KB each (360x480, which is plenty for windows this small), not the
// ~3MB they started as. preload="none" is fine for something the user
// clicks and waits on (the /work grid's videos), but starved these.

// A window's clip only plays during its own turn in the spotlight —
// pausing (and rewinding) it the rest of the time, same reasoning as the
// portfolio filmstrip's focused-only playback.
//
// play() can be refused on iPhone (the clip's data hasn't arrived — iOS
// ignores preload — or the element wasn't counted as visible the instant
// the window started fading in), and a refusal used to be swallowed for
// good, leaving the poster frozen. So it retries a few times, and also
// picks up the moment data becomes playable. `data-live` lets the priming
// pass below know a clip is mid-turn and must not be paused.
function useSpotlightVideo(
  ref: RefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.dataset.live = active ? "1" : "0";
    if (!active) {
      v.pause();
      return;
    }

    let cancelled = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;

    function start() {
      if (cancelled || !v) return;
      v.play().catch(() => {
        if (cancelled || ++tries > 8) return;
        timer = setTimeout(start, 300);
      });
    }
    function onCanPlay() {
      if (!cancelled && v && v.paused) v.play().catch(() => {});
    }

    try {
      v.currentTime = 0;
    } catch {
      /* not seekable yet */
    }
    start();
    v.addEventListener("canplay", onCanPlay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      v.removeEventListener("canplay", onCanPlay);
    };
  }, [ref, active]);
}

export default function HotelRow({
  visible,
  assemble,
  compact = false,
}: {
  visible: boolean;
  assemble: boolean;
  // Phones: use the much smaller clips (240x320, ~130KB each) — the windows
  // are only ~60px wide on a phone, so the full-size ones are wasted bytes.
  compact?: boolean;
}) {
  const clip = (name: string) => `${V}/${name}${compact ? "-sm" : ""}.mp4`;
  const reducedMotion = useReducedMotion();
  const [played, setPlayed] = useState(false);
  const [current, setCurrent] = useState<WindowKey | "all" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const elevatorVideoRef = useRef<HTMLVideoElement>(null);
  const roomServiceVideoRef = useRef<HTMLVideoElement>(null);
  const breakfastVideoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
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

  // Prime the clips as soon as the buildings assemble. iPhones don't fetch
  // video data ahead of time whatever preload says, so without this each
  // clip only starts downloading at the very moment its turn begins — which
  // is too late for a 4-second turn. Muted playback needs no tap, so start
  // each one and immediately pause it again (unless it has meanwhile been
  // given its turn). Retried once, since the first attempt can land while
  // the row is still fading in.
  useEffect(() => {
    if (!assemble || reducedMotion) return;
    const videos = [
      elevatorVideoRef.current,
      roomServiceVideoRef.current,
      breakfastVideoRef.current,
    ].filter((v): v is HTMLVideoElement => !!v);

    function prime(v: HTMLVideoElement) {
      v.play()
        .then(() => {
          if (v.dataset.live !== "1") {
            v.pause();
            v.currentTime = 0;
          }
        })
        .catch(() => {});
    }
    const first = setTimeout(() => videos.forEach(prime), 500);
    const second = setTimeout(() => videos.forEach(prime), 1800);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [assemble, reducedMotion]);

  // Phones only (see WINDOW_FOCUS): slide the track so the lit window sits
  // at the centre of the screen. Works from the pieces' layout sizes (not
  // their on-screen rects), since those are mid-transform during assembly.
  // Re-run as the images load, since their widths aren't known until then.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function apply() {
      const t = trackRef.current;
      const l = leftRef.current;
      const c = centerRef.current;
      const r = rightRef.current;
      if (!t || !l || !c || !r) return;
      const phone = window.matchMedia("(max-width: 767px)").matches;
      const focus =
        phone && !reducedMotion && current && current !== "all"
          ? WINDOW_FOCUS[current]
          : null;
      if (!focus) {
        t.style.setProperty("--hotel-pan", "0px");
        return;
      }
      const gapL = parseFloat(getComputedStyle(l).marginRight) || 0;
      const gapR = parseFloat(getComputedStyle(r).marginLeft) || 0;
      const wL = l.offsetWidth;
      const wC = c.offsetWidth;
      const wR = r.offsetWidth;
      const total = wL + gapL + wC + gapR + wR;
      if (!total) return;
      const left = { left: 0, center: wL + gapL, right: wL + gapL + wC + gapR };
      const width = { left: wL, center: wC, right: wR };
      const x = left[focus.piece] + width[focus.piece] * focus.x;
      t.style.setProperty("--hotel-pan", `${total / 2 - x}px`);
    }

    apply();
    window.addEventListener("resize", apply);
    const imgs = track.querySelectorAll("img");
    imgs.forEach((img) => img.addEventListener("load", apply));
    return () => {
      window.removeEventListener("resize", apply);
      imgs.forEach((img) => img.removeEventListener("load", apply));
    };
  }, [current, reducedMotion]);

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
      <div className="hotel-row-track" ref={trackRef}>
        <div className="hotel-piece hotel-left" ref={leftRef}>
          <img src="/images/hotel-illustration/left.webp" alt="" decoding="async" />
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
              src={clip("room-service")}
              poster={`${W}/room-service.jpg`}
              muted
              playsInline
              preload="auto"
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

        <div className="hotel-piece hotel-center" ref={centerRef}>
          <img src="/images/hotel-illustration/center.webp" alt="" decoding="async" />
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
              src={clip("elevator")}
              poster={`${W}/elevator.jpg`}
              muted
              playsInline
              preload="auto"
            />
          </span>
        </div>

        <div className="hotel-piece hotel-right" ref={rightRef}>
          <img src="/images/hotel-illustration/right.webp" alt="" decoding="async" />
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
              src={clip("breakfast")}
              poster={`${W}/breakfast.jpg`}
              muted
              playsInline
              preload="auto"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
