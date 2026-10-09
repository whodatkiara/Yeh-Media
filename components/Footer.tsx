"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import terms from "@/data/terms.json";
import { useIsPhone } from "@/lib/use-is-phone";

/**
 * The site footer, in the same quiet black-and-white register as the
 * General Terms and Conditions it links to: hairline rule, small mono
 * type, business identity set out plainly.
 *
 * Two forms, since the homepage deck is a fixed, non-scrolling viewport
 * with no "bottom of the page" to put a footer at: there it's a single
 * small line pinned bottom-left (opposite the floating Work With Us
 * button); on every normal scrolling page it's a full footer after the
 * content. The deck's slides are the home page and the per-hotel
 * /for/[hotel] pages.
 */
export default function Footer() {
  const pathname = usePathname();
  const isPhone = useIsPhone();
  // Phones get a normal scrolling homepage (MobileHome), so the full footer
  // at the end of the page, not the deck's pinned line.
  const onDeck = (pathname === "/" || pathname.startsWith("/for/")) && !isPhone;
  const { business } = terms;

  if (onDeck) {
    return (
      <p className="fixed bottom-6 left-6 z-30 font-mono text-[10px] tracking-[0.2em] uppercase text-black/40">
        <span className="hidden sm:inline">
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          {business.tradingName} ·{" "}
        </span>
        <Link
          href="/terms"
          className="hover:text-black underline underline-offset-4 decoration-black/20 transition-colors"
        >
          Terms &amp; Conditions
        </Link>
      </p>
    );
  }

  return (
    <footer className="bg-white text-black px-6 md:px-16 pb-28">
      <div
        className={`${
          pathname === "/work" ? "max-w-6xl" : "max-w-2xl"
        } mx-auto border-t border-black/10 pt-8 flex flex-col gap-6 sm:flex-row sm:justify-between`}
      >
        <div className="flex flex-col gap-2 font-mono text-[11px] leading-relaxed text-black/50">
          <p className="tracking-[0.2em] uppercase text-black">
            {business.tradingName}
          </p>
          <p>
            Trading name of {business.legalName}
            <br />
            KvK {business.kvk}
            <br />
            {business.address}
          </p>
        </div>
        <div className="flex flex-col gap-2 font-mono text-[11px] tracking-[0.2em] uppercase sm:items-end">
          <a
            href={`mailto:${business.email}`}
            className="text-black/50 hover:text-black transition-colors"
          >
            {business.email}
          </a>
          <Link
            href="/terms"
            className="text-black/50 hover:text-black underline underline-offset-4 decoration-black/30 transition-colors"
          >
            Terms &amp; Conditions
          </Link>
          <p className="text-black/30">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
            {business.tradingName}
          </p>
        </div>
      </div>
    </footer>
  );
}
