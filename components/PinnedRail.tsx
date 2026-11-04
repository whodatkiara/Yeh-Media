"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";

// How far the neighbours shrink / fade while the centred item is at full
// size and in colour.
const MIN_SCALE = 0.7;
const MIN_OPACITY = 0.55;

/**
 * A row of items that scrolls sideways, one item at a time. The page itself
 * scrolls down as normal until the row comes into view; then sideways moves
 * the row (swipe on a phone, trackpad or shift + wheel on a laptop, or click
 * a neighbouring item to bring it to the centre), and scrolling down carries
 * on to whatever comes next.
 *
 * Whatever item is at the centre is full size and in colour; the ones beside
 * it are smaller and grey, and ease between the two states continuously as
 * they travel through the centre. Any <video> inside the item nearest the
 * centre plays while the others pause (the playing one is marked
 * data-live="1").
 *
 * The browser does the scrolling itself (a native scroller with snap points)
 * and each frame only writes transform, grayscale and opacity straight to the
 * DOM, which is what keeps it smooth.
 */
export default function PinnedRail({
  children,
  title,
  caption,
  nudge = false,
}: {
  children: ReactNode;
  // Optional heading above the row (used for the stills sections).
  title?: string;
  caption?: string;
  // Once, shortly after load, slide the row a little to the side and let it
  // settle back, so it is clear the films move. Only meant for the first rail
  // on a page.
  nudge?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(-1);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    let centers: number[] = [];
    let pitch = 1;
    let width = 0;
    let frame = 0;
    let nudgeX = 0;
    let nudgeTimer = 0;
    let nudgeFrame = 0;

    // Cached so a frame doesn't rebuild the list, and so an item whose look
    // hasn't changed (everything away from the centre) isn't rewritten:
    // re-filtering video layers is what makes a phone stutter.
    let items: HTMLElement[] = [];
    const looks: string[] = [];

    function measure() {
      items = Array.from(track!.children) as HTMLElement[];
      looks.length = 0;
      width = scroller!.clientWidth;
      // The first and last item need room to reach the centre.
      const lead = Math.max((width - (items[0]?.offsetWidth ?? 0)) / 2, 0);
      const tail = Math.max((width - (items[items.length - 1]?.offsetWidth ?? 0)) / 2, 0);
      track!.style.paddingLeft = lead ? `${lead}px` : "";
      track!.style.paddingRight = tail ? `${tail}px` : "";
      centers = items.map((el) => el.offsetLeft + el.offsetWidth / 2);
      pitch =
        centers.length > 1
          ? ((centers[centers.length - 1] ?? 0) - (centers[0] ?? 0)) / (centers.length - 1)
          : items[0]?.offsetWidth ?? 1;
    }

    function paint() {
      frame = 0;
      if (!items.length) return;
      // The scroller moves the row; only the nudge is a transform.
      const x = -scroller!.scrollLeft + nudgeX;
      track!.style.transform = nudgeX ? `translate3d(${nudgeX}px,0,0)` : "";

      let best = 0;
      let bestP = -1;
      items.forEach((el, i) => {
        const d = Math.abs(x + centers[i] - width / 2);
        const linear = Math.min(Math.max(1 - d / pitch, 0), 1);
        const p = Math.round(linear * linear * (3 - 2 * linear) * 1000) / 1000;
        const look = `${p}`;
        if (looks[i] !== look) {
          looks[i] = look;
          el.style.transform = `scale(${MIN_SCALE + (1 - MIN_SCALE) * p})`;
          el.style.filter = p >= 1 ? "none" : `grayscale(${1 - p})`;
          el.style.opacity = String(MIN_OPACITY + (1 - MIN_OPACITY) * p);
        }
        if (p > bestP) {
          bestP = p;
          best = i;
        }
      });

      const active = activeRef.current;
      if (best !== active) {
        const prev = items[active]?.querySelector("video");
        const next = items[best]?.querySelector("video");
        if (prev) {
          prev.dataset.live = "0";
          prev.pause();
        }
        if (next) {
          next.dataset.live = "1";
          // Only a NotAllowedError means the browser refused sound (iPhones
          // can, outside a tap): then play silently rather than leave the
          // clip frozen, and the page's speaker icon reads "off". An
          // AbortError just means the row moved on again before the clip
          // started, which is normal when scrolling fast and must not mute
          // anything.
          next.play().catch((error: unknown) => {
            if ((error as DOMException)?.name === "NotAllowedError" && !next.muted) {
              next.muted = true;
              next.play().catch(() => {});
            }
          });
        }
        activeRef.current = best;
      }
    }

    // Scrolling down with a trackpad over the row nearly always carries a
    // little sideways drift, and the snap points turn that drift into a jump
    // to the next picture, so the row would arrive already moved on. Each
    // wheel gesture is therefore classed as sideways or vertical when it
    // starts (a gap in the events starts a new one); during a vertical one
    // the row is held where it was.
    let wheelAxis: 0 | 1 | 2 = 0; // 0 none, 1 sideways, 2 vertical
    let wheelHold = 0;
    let wheelTimer = 0;
    function onWheel(e: WheelEvent) {
      if (wheelAxis === 0) {
        const ax = Math.abs(e.deltaX);
        const ay = Math.abs(e.deltaY);
        if (ax === 0 && ay === 0) return;
        wheelAxis = ax > ay ? 1 : 2;
        wheelHold = scroller!.scrollLeft;
      }
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        wheelAxis = 0;
      }, 140);
    }
    function onScrollerScroll() {
      if (wheelAxis === 2 && scroller!.scrollLeft !== wheelHold) {
        scroller!.scrollLeft = wheelHold;
      }
      schedule();
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function onResize() {
      measure();
      schedule();
    }

    // One gentle push to the side and back. Skipped if the visitor has
    // already started moving.
    function runNudge() {
      if (window.scrollY > 40 || scroller!.scrollLeft > 5) return;
      const distance = Math.min(90, pitch * 0.3);
      const duration = 1800;
      const start = performance.now();
      function step(now: number) {
        const u = Math.min((now - start) / duration, 1);
        nudgeX = -distance * Math.sin(Math.PI * u);
        schedule();
        if (u < 1) nudgeFrame = requestAnimationFrame(step);
        else nudgeX = 0;
      }
      nudgeFrame = requestAnimationFrame(step);
    }

    measure();
    paint();
    scroller.addEventListener("scroll", onScrollerScroll, { passive: true });
    scroller.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(track);
    ro.observe(scroller);
    if (nudge) nudgeTimer = window.setTimeout(runNudge, 900);
    return () => {
      scroller.removeEventListener("scroll", onScrollerScroll);
      scroller.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      clearTimeout(wheelTimer);
      ro.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(nudgeFrame);
      clearTimeout(nudgeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clicking or tapping an item beside the centre brings it to the centre
  // instead of doing whatever the item itself does (the one in the centre
  // behaves normally). This is the way to move along with a plain mouse.
  function bringToCentre(e: React.MouseEvent<HTMLDivElement>, index: number) {
    const scroller = scrollerRef.current;
    if (!scroller || index === activeRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    scroller.scrollTo({
      left: el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2,
      behavior: "smooth",
    });
  }

  return (
    <section className="relative">
      <div className="flex flex-col justify-center py-6 md:py-12">
        {title && (
          <div className="mb-6 px-6 md:mb-10 md:px-16">
            <h2 className="font-sans text-2xl font-semibold uppercase leading-tight tracking-tight md:text-4xl">
              {title}
            </h2>
            {caption && (
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/45">
                {caption}
              </p>
            )}
          </div>
        )}
        <div
          ref={scrollerRef}
          className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            ref={trackRef}
            className="relative flex w-max items-center gap-4 will-change-transform md:gap-8"
          >
            {Children.map(children, (child, i) => (
              <div
                className="shrink-0 origin-center snap-center will-change-transform"
                onClickCapture={(e) => bringToCentre(e, i)}
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
