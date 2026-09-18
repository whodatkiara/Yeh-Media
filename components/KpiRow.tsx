"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/use-in-view";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A stat row under a /work card's description: each number counts up
 * from zero the moment the card scrolls into view, with a thicker
 * underline filling in step and a slight rise-and-settle on the number
 * itself — a bolder, more "loading" feel than a quiet counter. Retriggers
 * every time the card re-enters view (see `once: false` below) rather
 * than firing only the first time ever, so it feels fresh again on a
 * repeat visit to /work, not just the first. See Project["kpis"] in
 * Portfolio.tsx for the data shape (placeholder figures until the real
 * ones are in hand).
 */
function formatCount(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(Math.round(value));
}

function Stat({
  label,
  value,
  suffix,
  active,
  delayMs,
}: {
  label: string;
  value: number;
  suffix?: string;
  active: boolean;
  delayMs: number;
}) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!active) {
      // Reset so the next time this scrolls into view, it counts up from
      // zero again rather than just sitting at its old final value.
      setDisplay(0);
      setFilled(false);
      return;
    }
    if (reducedMotion) {
      setDisplay(value);
      setFilled(true);
      return;
    }
    const startTimer = setTimeout(() => {
      setFilled(true);
      const duration = 1300;
      let raf: number;
      let start: number | null = null;
      function tick(ts: number) {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, delayMs);
    return () => clearTimeout(startTimer);
  }, [active, reducedMotion, value, delayMs]);

  return (
    <div className="min-w-[88px]">
      <p
        className={`font-mono text-3xl sm:text-4xl font-bold tabular-nums tracking-tight transition-all duration-300 ease-out ${
          filled ? "opacity-100 translate-y-0" : "opacity-30 translate-y-1.5"
        }`}
      >
        {formatCount(display)}
        {suffix ?? ""}
      </p>
      <div className="h-[2px] w-full bg-black/10 mt-2 mb-1.5 overflow-hidden">
        <div
          className="h-[2px] bg-black transition-transform duration-[1300ms] ease-out"
          style={{
            transformOrigin: "left",
            transform: filled ? "scaleX(1)" : "scaleX(0)",
          }}
        />
      </div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-black/40">
        {label}
      </p>
    </div>
  );
}

export default function KpiRow({
  kpis,
}: {
  kpis: { label: string; value: number; suffix?: string }[];
}) {
  const { ref, inView } = useInView<HTMLDivElement>(undefined, false);
  return (
    <div ref={ref} className="mt-6">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-black/30 mb-3">
        What This Video Generated
      </p>
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {kpis.map((kpi, i) => (
          <Stat
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            suffix={kpi.suffix}
            active={inView}
            delayMs={i * 150}
          />
        ))}
      </div>
    </div>
  );
}
