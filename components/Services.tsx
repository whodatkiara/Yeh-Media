const services = [
  {
    title: "Creative Direction",
    description:
      "The strategic layer, positioning, voice and storytelling rooted in your brand DNA, built the way an architectural designer builds a room: shaping the experience first, not just how it looks.",
  },
  {
    title: "Content Creation",
    description:
      "Photography, film and social content, shot on-site, that translate a space's atmosphere, its materials, light and mood, into imagery guests respond to on instinct.",
  },
  {
    title: "Strategy",
    description:
      "Content and channel strategy, grounded in neuroaesthetics: the psychology of why an image or video makes a guest stop scrolling, save, or book, instantly.",
  },
];

/**
 * Pure content for the "Our Services." deck slide. Each service carries a
 * short line tying it back to the studio's actual differentiator — a
 * founder with an interior-design background applying neuroaesthetics
 * across strategy, content and creative direction — rather than the
 * generic sub-item bullet lists this used to show.
 *
 * Each row is a plain CSS :hover treatment (no JS needed): the hairline
 * top border solidifies to full black, an index number slides in from the
 * left, and the title nudges right in step — a quiet cue that these are
 * distinct, hoverable items rather than static text.
 */
export default function Services() {
  return (
    <div className="max-w-md flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        {services.map((service, i) => (
          <div
            key={service.title}
            className="group flex flex-col gap-2 border-t border-black/10 pt-5 transition-colors duration-300 hover:border-black/80 cursor-default"
          >
            <h3 className="flex items-baseline gap-3 font-sans font-semibold text-lg tracking-tight uppercase">
              <span className="font-mono text-[10px] font-normal tracking-[0.2em] text-black/0 -translate-x-2 opacity-0 transition-all duration-300 ease-out group-hover:text-black/40 group-hover:translate-x-0 group-hover:opacity-100">
                0{i + 1}
              </span>
              <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                {service.title}
              </span>
            </h3>
            <p className="font-mono text-sm leading-relaxed text-black/60 transition-colors duration-300 group-hover:text-black/75">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
