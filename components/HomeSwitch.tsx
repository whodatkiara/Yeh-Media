"use client";

import HomeDeck from "@/components/HomeDeck";
import MobileHome from "@/components/MobileHome";
import { useIsPhone } from "@/lib/use-is-phone";

/**
 * The homepage: the swipe/scroll-driven slide deck on tablets and desktop,
 * a normal scrolling page on phones (see MobileHome). Chosen client-side
 * from the viewport width. Both the home page and the per-hotel
 * /for/[hotel] pages render through this.
 */
export default function HomeSwitch() {
  const isPhone = useIsPhone();
  return isPhone ? <MobileHome /> : <HomeDeck />;
}
