import type { Metadata } from "next";
import Link from "next/link";
import terms from "@/data/terms.json";

export const metadata: Metadata = {
  title: "Terms & Conditions | Yeh Media",
  description:
    "Yeh Media's general terms and conditions for business clients: brand strategy, photography, film, content creation and social media management.",
};

/**
 * The General Terms and Conditions, laid out the way the document itself is:
 * numbered sections, numbered clauses beneath them (1.1, 1.2, …), plain
 * black on white. Content lives in data/terms.json.
 */
export default function TermsPage() {
  const [subtitleLeft, subtitleRight] = terms.subtitle.split(" | ");

  return (
    <div className="min-h-screen bg-white text-black px-6 md:px-16 pt-28 md:pt-32 pb-32 md:pb-40">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block font-mono text-[11px] tracking-[0.2em] uppercase text-black/50 hover:text-black underline underline-offset-4 decoration-black/30 transition-colors mb-12"
        >
          ← Back to Yeh Media
        </Link>

        <h1 className="font-sans font-semibold text-4xl md:text-5xl tracking-tight uppercase mb-4">
          {terms.title}.
        </h1>
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-black/40 mb-12">
          {subtitleLeft} · {subtitleRight}
        </p>

        <div className="flex flex-col gap-4 mb-4">
          {terms.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="font-mono font-normal text-sm md:text-base text-black/60 leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {terms.sections.map((section) => (
          <section key={section.number} className="pt-14">
            <h2 className="flex items-baseline gap-3 mb-6 font-sans font-semibold text-lg tracking-tight uppercase">
              <span className="font-mono text-[10px] font-normal tracking-[0.2em] text-black/30">
                {String(section.number).padStart(2, "0")}
              </span>
              {section.title}
            </h2>
            <div className="flex flex-col gap-4">
              {section.clauses.map((clause) => (
                <p
                  key={clause.number}
                  className="grid grid-cols-[2.75rem_1fr] font-mono font-normal text-sm leading-relaxed text-black/70"
                >
                  <span className="text-[11px] tracking-[0.1em] text-black/30 pt-0.5">
                    {clause.number}
                  </span>
                  <span>{clause.text}</span>
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
