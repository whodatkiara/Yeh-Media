"use client";

import { useEffect, useState } from "react";
import siteData from "@/data/site.json";

const PHRASES = siteData.heroMorphPhrases;
const HOLD_MS = 1800;
// Must match .roll-out/.roll-in's animation-duration in globals.css — this
// timeout is what swaps the phrase's React state once the roll finishes;
// if it fires before the CSS animation actually completes, the content
// swap happens mid-animation and reads as a jarring flash/jump.
const ROLL_MS = 600;

/**
 * The hero's right-hand content (and, on phones, the block under the
 * wordmark): the positioning line (siteData.copy.heroLine), which stays put,
 * with a single line of words under it cycling through what the studio
 * does. The cycling line uses the same rolling-cube mechanic (see
 * .roll-window/.roll-face in globals.css) as the deck's title transition,
 * driven by an internal interval instead of a scroll/swipe gesture.
 *
 * It keeps cycling under Reduce Motion too: there the roll is swapped for a
 * plain cross-fade (see globals.css) rather than the phrase freezing on its
 * first word.
 */
export default function HeroPhrase() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"idle" | "rolling">("idle");

  useEffect(() => {
    if (PHRASES.length <= 1) return;

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
  }, []);

  const nextIndex = (current + 1) % PHRASES.length;

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      {/* The positioning line: what makes the studio different, said once
          and staying put, while the words below it keep changing. */}
      <p className="max-w-[24ch] font-mono font-normal text-[clamp(17px,1.9vw,26px)] leading-snug text-black">
        {siteData.copy.heroLine}
      </p>
      <div className="roll-window w-full font-mono font-normal text-[clamp(12px,1.35vw,15px)] tracking-[0.2em] uppercase whitespace-nowrap text-black/50">
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
    </div>
  );
}
