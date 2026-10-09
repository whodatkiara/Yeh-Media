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

function getServerSnapshot() {
  return false;
}

export function useIsPhone() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
