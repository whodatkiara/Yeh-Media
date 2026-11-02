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
 * inside the item nearest the centre plays while the others pause.
 */
export default function PinnedRail({
  children,
  title,
  caption,
}: {
  children: ReactNode;
  // Optional heading pinned above the row (used for the stills sections).
  title?: string;
  caption?: string;
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

    function measure() {
      const items = Array.from(track!.children) as HTMLElement[];
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
      const items = Array.from(track!.children) as HTMLElement[];
      if (!items.length) return;
      const top = section!.getBoundingClientRect().top;
      const t = range > 0 ? Math.min(Math.max((-top - hold) / range, 0), 1) : 0;
      const x = vw / 2 - (first + t * range);
      track!.style.transform = `translate3d(${x}px,0,0)`;

      let best = 0;
      let bestP = -1;
      items.forEach((el, i) => {
        const d = Math.abs(x + centers[i] - vw / 2);
        const linear = Math.min(Math.max(1 - d / pitch, 0), 1);
        const p = linear * linear * (3 - 2 * linear);
        el.style.transform = `scale(${MIN_SCALE + (1 - MIN_SCALE) * p})`;
        el.style.filter = `grayscale(${1 - p})`;
        el.style.opacity = String(MIN_OPACITY + (1 - MIN_OPACITY) * p);
        if (p > bestP) {
          bestP = p;
          best = i;
        }
      });

      if (best !== active) {
        const prev = items[active]?.querySelector("video");
        const next = items[best]?.querySelector("video");
        prev?.pause();
        next?.play().catch(() => {});
        active = best;
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function onResize() {
      measure();
      schedule();
    }

    measure();
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(track);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `calc(100svh + ${extra}px)` }}
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
