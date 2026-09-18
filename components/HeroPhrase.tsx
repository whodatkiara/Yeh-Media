"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import siteData from "@/data/site.json";

const PHRASES = siteData.heroMorphPhrases;
const HOLD_MS = 1800;
// Must match .roll-out/.roll-in's animation-duration in globals.css — this
// timeout is what swaps the phrase's React state once the roll finishes;
// if it fires before the CSS animation actually completes, the content
// swap happens mid-animation and reads as a jarring flash/jump.
const ROLL_MS = 600;

/**
 * The hero slide's own right-side content: a single self-contained line
 * cycling through guest outcomes, sized to match the left panel's "Yeh
 * Media" treatment (small, thin, tracked) so both sides read as one
 * centered row rather than the right side sitting lower than the left.
 * Uses the same rolling-cube mechanic (see .roll-window/.roll-face in
 * globals.css) as the deck's title transition, just driven by an internal
 * interval instead of a scroll/swipe gesture.
 */
export default function HeroPhrase() {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"idle" | "rolling">("idle");

  useEffect(() => {
    if (reducedMotion || PHRASES.length <= 1) return;

    let holdTimer: ReturnType<typeof setTimeout>;
    let rollTimer: ReturnType<typeof setTimeout>;

    function scheduleHold() {
      holdTimer = setTimeout(() => {
        setPhase("rolling");
        rollTimer = setTimeout(() => {
          setCurrent((c) => (c + 1) % PHRASES.length);
          setPhase("idle");
          scheduleHold();
        }, ROLL_MS);
      }, HOLD_MS);
    }

    scheduleHold();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(rollTimer);
    };
  }, [reducedMotion]);

  const nextIndex = (current + 1) % PHRASES.length;

  return (
    <div className="roll-window w-full font-mono font-normal text-[clamp(15px,2.3vw,28px)] tracking-[0.06em] uppercase whitespace-nowrap">
      {phase === "rolling" ? (
        <>
          <span key={`out-${current}`} className="roll-face roll-out">
            {PHRASES[current]}
          </span>
          <span key={`in-${nextIndex}`} className="roll-face roll-in">
            {PHRASES[nextIndex]}
          </span>
        </>
      ) : (
        <span className="roll-face">{PHRASES[current]}</span>
      )}
    </div>
  );
}
