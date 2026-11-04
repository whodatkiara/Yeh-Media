import type { ReactNode } from "react";
import Link from "next/link";

/**
 * The top of the unlisted /work/videos and /work/stills pages: the same
 * "back" link, heading and short intro as the full /work archive, so the
 * pages read as part of the same site.
 */
export default function RailPageHeader({
  title,
  intro,
}: {
  title: string;
  intro: ReactNode;
}) {
  return (
    <header className="px-6 pt-24 pb-4 md:px-16 md:pt-32 md:pb-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/work"
          className="mb-8 inline-block md:mb-12 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50 underline decoration-black/30 underline-offset-4 transition-colors hover:text-black"
        >
          ← Back to Our Work
        </Link>
        <h1 className="mb-4 font-sans text-4xl font-semibold uppercase tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="max-w-lg font-mono text-sm font-normal leading-relaxed text-black/60 md:text-base">
          {intro}
        </p>
      </div>
    </header>
  );
}
