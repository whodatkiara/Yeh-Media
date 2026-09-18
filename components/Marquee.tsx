export default function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  // Duplicated once so the track can translate exactly -50% and loop
  // seamlessly — the CSS animation only needs to know this contract.
  const loop = [...items, ...items];

  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-serif font-light text-2xl md:text-3xl tracking-tight text-ink-faint whitespace-nowrap px-8 flex items-center gap-8"
          >
            {item}
            <span className="dot-mark text-lg">••</span>
          </span>
        ))}
      </div>
    </div>
  );
}
