"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import siteData from "@/data/site.json";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useSite } from "@/lib/site-context";
import { STUDIO_SLIDE_INDEX } from "@/components/HomeDeck";

/**
 * A persistent floating CTA, fixed bottom-right at every width, pointing
 * straight at the qualifying questionnaire (see Studio's in-content
 * "Work With Us" for the other entry point to the same page). Pops in on
 * the visitor's first scroll/swipe gesture rather than on a timer — arriving
 * the moment they're actually engaging with the page, not before.
 *
 * Hidden on /contact itself (no point pointing the page at itself) and on
 * the Studio slide of the home deck, since that slide already carries its
 * own "Work With Us" — never show the same CTA twice at once.
 */
export default function WorkWithUsButton() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { deckIndex } = useSite();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setShown(true);
      return;
    }

    function reveal() {
      setShown(true);
    }

    window.addEventListener("wheel", reveal, { passive: true, once: true });
    window.addEventListener("touchmove", reveal, { passive: true, once: true });
    window.addEventListener("scroll", reveal, { passive: true, once: true });
    return () => {
      window.removeEventListener("wheel", reveal);
      window.removeEventListener("touchmove", reveal);
      window.removeEventListener("scroll", reveal);
    };
  }, [reducedMotion]);

  if (pathname === "/contact") return null;
  if (pathname === "/" && deckIndex === STUDIO_SLIDE_INDEX) return null;

  return (
    <Link
      href="/contact"
      className={`fixed bottom-6 right-6 z-40 bg-black text-white border border-black px-6 py-3.5 font-mono text-[11px] tracking-[0.25em] uppercase transition-all duration-500 ease-out hover:bg-white hover:text-black ${
        shown
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      {siteData.copy.workWithUsCta}
    </Link>
  );
}
