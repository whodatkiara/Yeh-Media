"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

// How far the neighbours shrink / fade while the centred item is at full
// size and in colour.
const MIN_SCALE = 0.7;
const MIN_OPACITY = 0.55;

/**
 * A row of items that stays pinned to the screen while ordinary vertical
 * scrolling slides it sideways — the page feels "frozen" and the row moves
 * instead. Whatever item is at the centre of the screen is full size and in
 * colour; the ones beside it are smaller and grey, and ease between the
 * two states continuously as they travel through the centre.
 *
 * How it works: the section is made as tall as the screen plus the exact
 * distance the row has to travel, with a sticky full-screen stage inside
 * it. Scroll progress through that extra height maps 1:1 onto a horizontal
 * translate of the row, so the scroll distance and the movement stay in
 * step at any width. A short hold at each end lets the first and last item
 * rest at the centre before the page carries on.
 *
 * Each frame (scroll / resize) writes transform, grayscale and opacity
 * straight to the DOM instead of through React state, and any <video>
 * inside the item nearest the centre plays while the others pause (the
 * playing one is marked data-live="1").
 */
export default function PinnedRail({
  children,
  title,
  caption,
  nudge = false,
}: {
  children: ReactNode;
  // Optional heading pinned above the row (used for the stills sections).
  title?: string;
  caption?: string;
  // Once, shortly after load, slide the row a little to the side and let it
  // settle back, so it is clear the films move. Only meant for the first rail
  // on a page.
  nudge?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let centers: number[] = [];
    let first = 0;
    let range = 0;
    let pitch = 1;
    let hold = 0;
    let vw = 0;
    let frame = 0;
    let active = -1;
    let nudgeX = 0;
    let nudgeTimer = 0;
    let nudgeFrame = 0;
    let inertia = 0;

    // Cached so a frame doesn't rebuild the list, and so an item whose look
    // hasn't changed (everything away from the centre) isn't rewritten:
    // re-filtering video layers is what makes a phone stutter.
    let items: HTMLElement[] = [];
    const looks: string[] = [];

    function measure() {
      items = Array.from(track!.children) as HTMLElement[];
      looks.length = 0;
      vw = window.innerWidth;
      centers = items.map((el) => el.offsetLeft + el.offsetWidth / 2);
      first = centers[0] ?? 0;
      range = (centers[centers.length - 1] ?? 0) - first;
      pitch =
        centers.length > 1 ? range / (centers.length - 1) : items[0]?.offsetWidth ?? 1;
      hold = window.innerHeight * 0.2;
      setExtra(range + hold * 2);
    }

    function paint() {
      frame = 0;
      if (!items.length) return;
      const top = section!.getBoundingClientRect().top;
      const t = range > 0 ? Math.min(Math.max((-top - hold) / range, 0), 1) : 0;
      const x = vw / 2 - (first + t * range) + nudgeX;
      track!.style.transform = `translate3d(${x}px,0,0)`;

      let best = 0;
      let bestP = -1;
      items.forEach((el, i) => {
        const d = Math.abs(x + centers[i] - vw / 2);
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
        active = best;
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    // Used while a finger is dragging: paint in the same event, so the row
    // moves with the finger instead of a frame behind it.
    function paintNow() {
      cancelAnimationFrame(frame);
      paint();
    }
    function onResize() {
      measure();
      schedule();
    }

    // Sideways input drives the same vertical scroll the row is tied to, so
    // swiping or trackpad-scrolling sideways moves the films just like
    // scrolling down does.
    function inView() {
      const r = section!.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    }
    function nudgeScroll(dy: number) {
      window.scrollBy({ top: dy, behavior: "instant" });
      paintNow();
    }
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || !inView()) return;
      e.preventDefault();
      nudgeScroll(e.deltaX);
    }

    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0; // px per ms, in scroll direction
    let axis: 0 | 1 | 2 = 0; // 0 undecided, 1 sideways, 2 vertical
    function glide() {
      velocity *= 0.95;
      if (Math.abs(velocity) < 0.02) {
        inertia = 0;
        return;
      }
      nudgeScroll(velocity * 16);
      inertia = requestAnimationFrame(glide);
    }
    function onTouchStart(e: TouchEvent) {
      cancelAnimationFrame(inertia);
      inertia = 0;
      const p = e.touches[0];
      startX = lastX = p.clientX;
      startY = p.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      axis = 0;
    }
    function onTouchMove(e: TouchEvent) {
      const p = e.touches[0];
      if (axis === 0) {
        const dx = Math.abs(p.clientX - startX);
        const dy = Math.abs(p.clientY - startY);
        if (dx < 8 && dy < 8) return;
        axis = dx > dy ? 1 : 2;
      }
      if (axis !== 1) return;
      e.preventDefault();
      const step = lastX - p.clientX;
      const dt = Math.max(e.timeStamp - lastT, 1);
      velocity = step / dt;
      nudgeScroll(step);
      lastX = p.clientX;
      lastT = e.timeStamp;
    }
    function onTouchEnd(e: TouchEvent) {
      // A pause before letting go means no glide.
      if (axis === 1 && e.timeStamp - lastT < 80 && Math.abs(velocity) > 0.05) {
        inertia = requestAnimationFrame(glide);
      }
    }

    // One gentle push to the side and back. Skipped if the visitor has
    // already started scrolling.
    function runNudge() {
      if (window.scrollY > 40) return;
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
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: false });
    section.addEventListener("touchstart", onTouchStart, { passive: true });
    section.addEventListener("touchmove", onTouchMove, { passive: false });
    section.addEventListener("touchend", onTouchEnd, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(track);
    if (nudge) nudgeTimer = window.setTimeout(runNudge, 900);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchmove", onTouchMove);
      section.removeEventListener("touchend", onTouchEnd);
      ro.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(inertia);
      cancelAnimationFrame(nudgeFrame);
      clearTimeout(nudgeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `calc(100svh + ${extra}px)`, touchAction: "pan-y pinch-zoom" }}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-20 pb-8 md:pt-16">
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
          ref={trackRef}
          className="relative flex w-max items-center gap-4 will-change-transform md:gap-8"
        >
          {Children.map(children, (child) => (
            <div className="shrink-0 origin-center will-change-transform">{child}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
