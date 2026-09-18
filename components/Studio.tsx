import Link from "next/link";
import siteData from "@/data/site.json";

/**
 * Pure content for "The Studio." deck slide. "Work With Us" opens the
 * qualifying questionnaire on /contact rather than jumping straight to
 * WhatsApp — see app/contact/page.tsx. Shares its label with the floating
 * WorkWithUsButton, which hides itself on this slide (see that component)
 * so the two never show the same CTA twice at once.
 */
export default function Studio() {
  return (
    <div className="max-w-md flex flex-col gap-6">
      <p className="font-mono font-normal text-sm md:text-base leading-relaxed">
        {siteData.copy.studioText}
      </p>
      <Link
        href="/contact"
        className="inline-block border border-black px-8 py-4 font-mono text-[11px] tracking-[0.25em] uppercase transition-colors hover:bg-black hover:text-white w-fit"
      >
        {siteData.copy.workWithUsCta}
      </Link>
    </div>
  );
}
