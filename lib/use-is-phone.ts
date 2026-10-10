"use client";

import { useSyncExternalStore } from "react";

// Below Tailwind's md breakpoint (768px) the homepage is a normal scrolling
// page (MobileHome); from there up it's the slide deck (HomeDeck).
const QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// null = "not known yet" (server render and the hydration pass). Callers
// that pick a whole layout from this must not guess during that window —
// guessing "desktop" made phones flash the slide deck (and start its
// intro) before swapping to the phone page.
function getServerSnapshot(): boolean | null {
  return null;
}

export function useIsPhone(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
