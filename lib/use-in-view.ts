"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reports whether an element is in view. Defaults to a one-way reveal
 * trigger (fires true once, then stops watching — never re-hides on
 * scroll-away), used for the "fade + rise as you scroll to it" treatment
 * on /work's grid. Pass `once: false` for something that should replay
 * every time it re-enters view — e.g. a count-up stat that should feel
 * "fresh" again on a repeat visit to the page, not just the first time.
 */
export function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
  once: boolean = true,
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting && once) observer.disconnect();
    }, options ?? { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once]);

  return { ref, inView };
}
