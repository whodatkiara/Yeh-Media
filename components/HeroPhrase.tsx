"use client";

import { useEffect, useState } from "react";
import siteData from "@/data/site.json";

const PHRASES = siteData.heroMorphPhrases;
// Long enough to read a whole line, not just a word.
const HOLD_MS = 2800;
// Must match .roll-out/.roll-in's animation-duration in globals.css — this
// timeout is what swaps the phrase's React state once the roll finishes;
// if it fires before the CSS animation actually completes, the content
// swap happens mid-animation and reads as a jarring flash/jump.
const ROLL_MS = 600;

/**
 * The hero's right-hand content (and, on phones, the line under the
 * wordmark): short, hotel-facing lines that take turns, each one a pitch
 * from the positioning (the story starts in the space, not in a content
 * calendar). They use the same rolling-cube mechanic (see
 * .roll-window/.roll-face in globals.css) as the deck's title transition,
 * driven by an internal interval instead of a scroll/swipe gesture.
 *
 * A line can run to two lines on a narrow screen, so the window is two
 * lines tall (2.7em) rather than the one-line default.
 *
 * It keeps cycling under Reduce Motion too: there the roll is swapped for a
 * plain cross-fade (see globals.css) rather than the line freezing on the
 * first one.
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
    <div
      className="roll-window w-full px-2 text-center font-mono font-normal text-[clamp(18px,2vw,28px)] leading-snug whitespace-normal"
      style={{ height: "2.7em" }}
    >
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
