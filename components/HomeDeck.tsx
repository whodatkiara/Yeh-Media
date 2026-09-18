"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { useSite } from "@/lib/site-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import siteData from "@/data/site.json";
import HeroPhrase from "@/components/HeroPhrase";
import HotelRow from "@/components/HotelRow";
import Pillars from "@/components/Pillars";
import Services from "@/components/Services";
import Portfolio, {
  filmstripLength as portfolioFilmstripLength,
} from "@/components/Portfolio";
import Studio from "@/components/Studio";

// The visual transition itself.
const TRANSITION_MS = 600;
// How long wheel input stays locked after a transition starts — padded past
// TRANSITION_MS so a trackpad's brief momentum tail after the finger lifts
// can't sneak through and fire a second, unintended slide change. Kept as
// tight a margin over TRANSITION_MS as practical — the wider this gap, the
// more the deck reads as unresponsive/laggy rather than deliberate.
const WHEEL_LOCK_MS = 700;
// A single wheel event's deltaY is not "one swipe" — trackpads emit a burst
// of many small events per gesture. Accumulate them and only act once the
// burst clearly commits to a direction, so a light touch doesn't fire early.
// Kept low so the deck reacts near the start of a gesture, not partway in.
const WHEEL_COMMIT_THRESHOLD = 14;
const WHEEL_IDLE_RESET_MS = 140;
const SWIPE_THRESHOLD = 50;

const HOME_TITLE = "Yeh Media";

// Slide 0 has no title of its own here (empty string) — "Yeh Media" is
// rendered by the separate floating wordmark below instead, which morphs
// between this slide's big centered position and every other slide's
// small corner position. Rolling an empty face away when leaving slide 0
// (and in when returning to it) is what lets the incoming/outgoing slide
// title still cube-flip normally without a second "Yeh Media" competing
// with the wordmark's own transition.
//
// Slide 1 (the "imagined hotels" row) is also titleless: it's a full-bleed
// visual — see the <HotelRow> layer near the bottom of the render — so the
// two-panel split underneath it stays blank on both sides.
const SLIDE_TITLES = [
  "",
  "",
  siteData.copy.pillarsTitle,
  siteData.copy.servicesTitle,
  siteData.copy.portfolioTitle,
  siteData.copy.studioTitle,
];
export const PORTFOLIO_SLIDE_INDEX = SLIDE_TITLES.indexOf(
  siteData.copy.portfolioTitle,
);
export const STUDIO_SLIDE_INDEX = SLIDE_TITLES.indexOf(siteData.copy.studioTitle);
const PILLARS_SLIDE_INDEX = SLIDE_TITLES.indexOf(siteData.copy.pillarsTitle);

// The load-in sequence: a few words roll through the same spot the real
// title lives in, ending on "Yeh Media" so the handoff from loader to the
// floating wordmark (see below) is invisible — same text, same position,
// same typeface, right up until loading flips off and the wordmark takes
// over that exact spot.
const LOAD_SEQUENCE = [...siteData.introLoadWords, HOME_TITLE];
const LOAD_HOLD_MS = 380;
// Must match .roll-out/.roll-in's animation-duration in globals.css — see
// the identical note on ROLL_MS in HeroPhrase.tsx for why this matters.
const LOAD_ROLL_MS = 600;

/**
 * The homepage as a single static screen: scrolling/swiping/arrow keys
 * advance through slides in place — the left title rolls, the right
 * content cross-fades — rather than the page physically scrolling.
 *
 * On first mount, the left title runs a short intro sequence (see
 * LOAD_SEQUENCE) before the right panel and normal navigation become
 * active — any input during it (wheel/touch/key) skips straight to the
 * end rather than being ignored, so it never reads as a blocking wait.
 *
 * The Portfolio slide is a special case: it holds its own filmstrip of
 * projects, and scroll/swipe/arrow input steps through those first —
 * only once you're past the first/last project does the same gesture
 * fall through to the normal slide-to-slide navigation. See `advance`.
 *
 * See SiteContext's `deckIndex` for how outside chrome (Menu's Home/
 * Contact) can jump the deck to a specific slide.
 */
export default function HomeDeck() {
  const { hotelName, deckIndex, setDeckIndex } = useSite();
  const reducedMotion = useReducedMotion();

  // A "?slide=N" in the URL (see /work's back link) opens the deck
  // directly on that slide instead of the hero — e.g. returning from the
  // full portfolio lands you back among the projects, not at the top.
  // Landing anywhere but the hero also skips the intro sequence below:
  // replaying "Shaping. / Directing. / Creating." only makes sense as a
  // first-visit reveal, not as part of a "go back" navigation.
  const searchParams = useSearchParams();
  const [initialSlide] = useState(() => {
    const raw = searchParams.get("slide");
    const parsed = raw === null ? NaN : Number(raw);
    if (!Number.isInteger(parsed)) return 0;
    return Math.max(0, Math.min(SLIDE_TITLES.length - 1, parsed));
  });

  const [current, setCurrent] = useState(initialSlide);
  const [phase, setPhase] = useState<"idle" | "rolling">("idle");
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [pillarsRevealed, setPillarsRevealed] = useState(false);
  const pendingIndexRef = useRef(0);
  // Which way the right panel's cross-fade should drift — see --deck-dir
  // in globals.css. Kept in state (not just a ref) since it needs to drive
  // the inline style on every re-render while `rolling` is true.
  const [direction, setDirection] = useState<1 | -1>(1);
  const lockedRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const touchStartYRef = useRef<number | null>(null);
  const wheelAccumRef = useRef(0);
  const wheelIdleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Intro load sequence — separate state from the deck's own slide-to-slide
  // roll above, since it drives a different roll-window (the left title,
  // pre-arrival) on a different timer, before the real deck exists at all.
  const [loading, setLoading] = useState(!reducedMotion && initialSlide === 0);
  const [loadStep, setLoadStep] = useState(0);
  const [loadPhase, setLoadPhase] = useState<"idle" | "rolling">("idle");
  const loadPendingRef = useRef(0);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const loadingRef = useRef(!reducedMotion && initialSlide === 0);
  const introCancelledRef = useRef(false);

  const skipIntro = useCallback(() => {
    if (!loadingRef.current) return;
    introCancelledRef.current = true;
    clearTimeout(loadTimerRef.current);
    setLoadPhase("idle");
    setLoadStep(LOAD_SEQUENCE.length - 1);
    setLoading(false);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    // Guards against a rare edge case: if the OS-level reduced-motion
    // preference changes later, after the site has already fully
    // revealed, this dependency-reactive effect would otherwise re-run
    // and restart the intro sequence on an already-loaded site.
    if (!loadingRef.current) return;

    if (reducedMotion) {
      setLoading(false);
      loadingRef.current = false;
      return;
    }

    introCancelledRef.current = false;

    function step(next: number) {
      loadTimerRef.current = setTimeout(() => {
        if (introCancelledRef.current) return;
        loadPendingRef.current = next;
        setLoadPhase("rolling");
        loadTimerRef.current = setTimeout(() => {
          if (introCancelledRef.current) return;
          setLoadStep(next);
          setLoadPhase("idle");
          if (next < LOAD_SEQUENCE.length - 1) {
            step(next + 1);
          } else {
            loadTimerRef.current = setTimeout(() => {
              if (introCancelledRef.current) return;
              setLoading(false);
              loadingRef.current = false;
            }, LOAD_HOLD_MS);
          }
        }, LOAD_ROLL_MS);
      }, LOAD_HOLD_MS);
    }

    step(1);

    return () => {
      introCancelledRef.current = true;
      clearTimeout(loadTimerRef.current);
    };
  }, [reducedMotion]);

  // Locks wheel/touch/key input for WHEEL_LOCK_MS, same pause goTo uses
  // after a slide-to-slide transition. advance's pillars-reveal branch
  // below needs this too: without it, a single fast continuous scroll
  // gesture can cross the commit threshold twice before either state
  // update re-renders, revealing the third paragraph and immediately
  // advancing past it in one motion — the reveal was never actually seen.
  const lockInput = useCallback(() => {
    lockedRef.current = true;
    clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      lockedRef.current = false;
    }, WHEEL_LOCK_MS);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(SLIDE_TITLES.length - 1, next));
      if (lockedRef.current || clamped === current) return;

      // Always leaving/entering fresh: the "Who We Are" slide's third
      // paragraph (see advance below) should never still be showing from a
      // previous visit, nor pre-revealed on arrival.
      setPillarsRevealed(false);

      // Entering the portfolio slide: start at its first project when
      // arriving from before it, or its last when arriving from after it
      // (e.g. backing into it from Studio should reveal the end first).
      if (clamped === PORTFOLIO_SLIDE_INDEX) {
        setPortfolioIndex(clamped > current ? 0 : portfolioFilmstripLength - 1);
      }

      if (reducedMotion) {
        setCurrent(clamped);
        setDeckIndex(clamped);
        return;
      }

      pendingIndexRef.current = clamped;
      setDirection(clamped > current ? 1 : -1);
      setPhase("rolling");

      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setCurrent(clamped);
        setDeckIndex(clamped);
        setPhase("idle");
      }, TRANSITION_MS);

      // Released later than the visual transition on purpose — see
      // WHEEL_LOCK_MS above.
      lockInput();
    },
    [current, reducedMotion, setDeckIndex, lockInput],
  );

  // The single entry point for "one step forward/back", whether from
  // wheel, touch or keyboard. On the portfolio slide this steps through
  // projects first; on the pillars slide it first reveals (or hides) the
  // third paragraph in place; everywhere else (and once either of those is
  // exhausted in that direction) it moves to the next/previous slide.
  const advance = useCallback(
    (step: 1 | -1) => {
      if (current === PORTFOLIO_SLIDE_INDEX && !lockedRef.current) {
        const nextProjectIndex = portfolioIndex + step;
        if (nextProjectIndex >= 0 && nextProjectIndex < portfolioFilmstripLength) {
          // Not routed through goTo (this stays on the same slide), so the
          // fade direction needs setting here too — otherwise it keeps
          // whatever direction the last slide-to-slide transition left it
          // at, regardless of which way you're paging through projects.
          setDirection(step);
          setPortfolioIndex(nextProjectIndex);
          return;
        }
      }
      if (current === PILLARS_SLIDE_INDEX && !lockedRef.current) {
        if (step === 1 && !pillarsRevealed) {
          setPillarsRevealed(true);
          lockInput();
          return;
        }
        if (step === -1 && pillarsRevealed) {
          setPillarsRevealed(false);
          lockInput();
          return;
        }
      }
      goTo(current + step);
    },
    [current, portfolioIndex, pillarsRevealed, goTo, lockInput],
  );

  // Announce presence to context on mount, clear it on unmount, so Menu
  // knows a deck exists and can drive it.
  useEffect(() => {
    setDeckIndex(initialSlide);
    return () => setDeckIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to an external jump request (Menu's Home/Contact links).
  useEffect(() => {
    if (deckIndex !== null && deckIndex !== current) {
      goTo(deckIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckIndex]);

  // The deck owns the viewport — the page itself should never scroll.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (loadingRef.current) {
        skipIntro();
        return;
      }
      if (lockedRef.current) return;

      wheelAccumRef.current += e.deltaY;
      clearTimeout(wheelIdleTimerRef.current);
      wheelIdleTimerRef.current = setTimeout(() => {
        wheelAccumRef.current = 0;
      }, WHEEL_IDLE_RESET_MS);

      if (Math.abs(wheelAccumRef.current) < WHEEL_COMMIT_THRESHOLD) return;
      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      advance(direction);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (loadingRef.current) {
        skipIntro();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        advance(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        advance(-1);
      }
    }

    function onTouchStart(e: TouchEvent) {
      if (loadingRef.current) {
        skipIntro();
        return;
      }
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    }

    function onTouchEnd(e: TouchEvent) {
      const startY = touchStartYRef.current;
      if (startY === null) return;
      const endY = e.changedTouches[0]?.clientY ?? startY;
      touchStartYRef.current = null;
      const delta = startY - endY;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      advance(delta > 0 ? 1 : -1);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [advance, skipIntro]);

  useEffect(() => {
    return () => {
      clearTimeout(transitionTimerRef.current);
      clearTimeout(lockTimerRef.current);
      clearTimeout(wheelIdleTimerRef.current);
      clearTimeout(loadTimerRef.current);
    };
  }, []);

  function renderRight(index: number) {
    switch (index) {
      case 0:
        return <HeroPhrase />;
      case 1:
        // Slide 1's content is the full-bleed <HotelRow> layer, not
        // anything in this right panel.
        return null;
      case 2:
        return <Pillars revealed={pillarsRevealed} />;
      case 3:
        return <Services />;
      case 4:
        return <Portfolio index={portfolioIndex} />;
      case 5:
        return <Studio />;
      default:
        return null;
    }
  }

  const rolling = phase === "rolling";
  const loadRolling = loadPhase === "rolling";

  // Slide 1's full-bleed <HotelRow>. Two signals: `visible` fades the whole
  // layer (it cross-fades in/out with the neighbouring slide the instant a
  // scroll commits), `assemble` runs the building choreography (held until
  // the slide has actually settled). See HotelRow.tsx.
  const enteringHotel = rolling && pendingIndexRef.current === 1;
  const leavingHotel = rolling && current === 1 && pendingIndexRef.current !== 1;
  const hotelVisible = !loading && !leavingHotel && (current === 1 || enteringHotel);
  const hotelAssemble = !loading && !rolling && current === 1;

  return (
    <div className="fixed inset-0 bg-white text-black flex flex-col md:flex-row">
      {/* The "Yeh Media" wordmark — one persistent element that travels:
          big and centered on slide 0 (standing in for what used to be the
          left panel's own title, now blanked out above — see SLIDE_TITLES),
          shrinking and sliding into the top-left corner the moment you
          leave it, morphing back the moment you return. Not mounted until
          loading finishes, so it appears already in the "big" spot at the
          exact instant the loader's own roll-in of "Yeh Media" hands off
          to it — same text, same position, same size, no visible seam.
          Menu stays fixed top-right at every width so the two never
          collide while this one is in its small corner state. */}
      {!loading && (
        <button
          onClick={() => goTo(0)}
          className={`fixed z-40 p-0 leading-[1.3] font-sans font-semibold uppercase tracking-tight cursor-pointer transition-all duration-700 ease-out ${
            current === 0
              ? "top-[25%] md:top-1/2 left-1/2 md:left-[25%] -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl md:text-5xl"
              : "top-6 left-6 translate-x-0 translate-y-0 text-[17px]"
          }`}
        >
          {HOME_TITLE}
        </button>
      )}

      {/* Left — the rolling title (or, on first load, the intro sequence
          rolling through LOAD_SEQUENCE in the same spot). */}
      <div className="relative md:w-1/2 h-1/2 md:h-full flex flex-col items-center justify-center gap-4 px-8 md:px-16 text-center">
        {!loading && current === 0 && hotelName && (
          <p className="font-mono font-light text-[10px] tracking-[0.3em] uppercase text-black/45">
            {siteData.copy.preparedFor.replace("{hotelName}", hotelName)}
          </p>
        )}
        {loading ? (
          <div className="roll-window w-full font-sans font-semibold text-3xl sm:text-4xl md:text-5xl tracking-tight uppercase">
            {loadRolling ? (
              <>
                <span
                  key={`load-out-${loadStep}`}
                  className="roll-face roll-out"
                >
                  {LOAD_SEQUENCE[loadStep]}
                </span>
                <span
                  key={`load-in-${loadPendingRef.current}`}
                  className="roll-face roll-in"
                >
                  {LOAD_SEQUENCE[loadPendingRef.current]}
                </span>
              </>
            ) : (
              <span className="roll-face">{LOAD_SEQUENCE[loadStep]}</span>
            )}
          </div>
        ) : (
          /* Fluid, not a fixed breakpoint scale: "Content We've Shaped." is
             long enough that a fixed text-5xl clipped against this panel's
             own width for most of the 768–1600px range (px-16 padding cuts
             hard into a panel that's only 50vw at that point). Each tier's
             clamp mirrors that tier's actual available width (100vw/50vw
             minus its own padding) so the longest title always fits without
             wrapping, at whatever size that allows. */
          <div className="roll-window w-full font-sans font-semibold text-[clamp(18px,calc((100vw_-_64px)*0.069),34px)] md:text-[clamp(18px,calc((50vw_-_128px)*0.073),48px)] tracking-tight uppercase">
            {rolling ? (
              <>
                <span key={`title-out-${current}`} className="roll-face roll-out">
                  {SLIDE_TITLES[current]}
                </span>
                <span
                  key={`title-in-${pendingIndexRef.current}`}
                  className="roll-face roll-in"
                >
                  {SLIDE_TITLES[pendingIndexRef.current]}
                </span>
              </>
            ) : (
              <span className="roll-face">{SLIDE_TITLES[current]}</span>
            )}
          </div>
        )}
      </div>

      {/* Right — the cross-fading content. The wrapper's own opacity/
          transform fades it in the one time `loading` flips false — a
          plain CSS transition on the outer box, entirely decoupled from
          the per-slide rolling/idle logic below, which stays exactly as
          it was pre-loader (no remount-on-every-transition risk that a
          shared "first reveal" animation trick would carry). overflow-
          hidden rather than -auto: the wheel handler above unconditionally
          preventDefaults, so an auto scrollbar here would be visible but
          unreachable — content is sized to fit one viewport instead (see
          Pillars/Services/Portfolio/Studio). */}
      <div className="relative md:w-1/2 h-1/2 md:h-full flex items-center justify-center px-8 md:px-16 py-8 overflow-hidden">
        <div
          className={`deck-stack w-full transition-all duration-700 ease-out ${
            loading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
          style={{ "--deck-dir": direction } as CSSProperties}
        >
          {!loading &&
            (rolling ? (
              <>
                <div key={`content-out-${current}`} className="deck-fade-out">
                  {renderRight(current)}
                </div>
                <div
                  key={`content-in-${pendingIndexRef.current}`}
                  className="deck-fade-in"
                >
                  {renderRight(pendingIndexRef.current)}
                </div>
              </>
            ) : (
              <div>{renderRight(current)}</div>
            ))}
        </div>
      </div>

      {/* Slide 1 — a full-bleed layer over the (blank, on this slide)
          two-panel split. Cross-fades with its neighbours as the scroll
          commits, then assembles once settled; leaving resets it so coming
          back replays. Sits under the floating wordmark (z-40) and Menu. */}
      <HotelRow visible={hotelVisible} assemble={hotelAssemble} />
    </div>
  );
}
