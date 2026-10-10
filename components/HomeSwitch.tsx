"use client";

import HomeDeck from "@/components/HomeDeck";
import MobileHome from "@/components/MobileHome";
import { useIsPhone } from "@/lib/use-is-phone";

/**
 * The homepage: the swipe/scroll-driven slide deck on tablets and desktop,
 * a normal scrolling page on phones (see MobileHome). Chosen client-side
 * from the viewport width. Both the home page and the per-hotel
 * /for/[hotel] pages render through this.
 *
 * Until the width is known (server render + hydration) it shows a plain
 * white screen rather than guessing — otherwise a phone would briefly mount
 * the desktop deck, run its intro, then swap to the phone page and run the
 * intro a second time.
 */
export default function HomeSwitch() {
  const isPhone = useIsPhone();
  if (isPhone === null) {
    return <div aria-hidden="true" className="fixed inset-0 bg-white" />;
  }
  return isPhone ? <MobileHome /> : <HomeDeck />;
}
