import siteData from "@/data/site.json";

const NEURO_LINE = "Neuroaesthetics.";
const [pillarsRevealBefore, pillarsRevealAfter] = siteData.copy.pillarsReveal
  .split(NEURO_LINE)
  .map((part, i) => (i === 1 ? part.trimStart() : part));

/**
 * Pure content for the "Who We Are." deck slide — identity/philosophy only.
 * The service breakdown lives exclusively in "Our Services." now; this used
 * to repeat the same three categories here too.
 *
 * The grey mission line + black founder line cross-fade into a third
 * paragraph — the founder's design background and the neuroaesthetics
 * thread — once `revealed` goes true (an extra scroll/swipe/arrow-down
 * while already on this slide, gated in HomeDeck the same way the
 * portfolio filmstrip gates its own project paging before falling through
 * to the next slide). Both states stay mounted, stacked in the same grid
 * cell (borrowed from .deck-stack), so the swap is a plain opacity
 * cross-fade with no layout jump between their different heights.
 *
 * "Neuroaesthetics." itself — the studio's actual differentiator — breaks
 * onto its own line and gets a second, later beat: it pops in growing from
 * a slight scale a moment after the rest of the paragraph has already
 * faded in, rather than arriving with it, so it reads as the emphasis
 * rather than just more text.
 */
export default function Pillars({ revealed = false }: { revealed?: boolean }) {
  return (
    <div className="max-w-md deck-stack">
      <div
        className={`flex flex-col gap-5 transition-opacity duration-500 ease-out ${
          revealed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <p className="font-mono font-normal text-sm md:text-base leading-relaxed text-black/60">
          {siteData.copy.pillarsBody}
        </p>
        <p className="font-mono font-normal text-sm md:text-base leading-relaxed">
          {siteData.copy.pillarsIntro}
        </p>
      </div>
      <p
        className={`font-mono font-normal text-sm md:text-base leading-relaxed transition-opacity duration-500 ease-out ${
          revealed ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {pillarsRevealBefore}
        <span
          className={`block my-1 font-sans font-semibold text-lg md:text-xl tracking-tight transition-all duration-700 ease-out ${
            revealed ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
          style={{ transitionDelay: revealed ? "350ms" : "0ms" }}
        >
          {NEURO_LINE}
        </span>
        {pillarsRevealAfter}
      </p>
    </div>
  );
}
