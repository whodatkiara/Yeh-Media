"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/use-in-view";

/**
 * A number that counts up from zero the first time it scrolls into view.
 * Takes the finished figure as text ("147,613", "6.6K", "40.8%") and keeps its
 * commas, decimals and suffix. The server renders the finished figure, so it
 * reads correctly without scripts; the count only plays once the number is
 * about to be seen.
 */
export default function CountUp({
  value,
  durationMs = 1500,
}: {
  value: string;
  durationMs?: number;
}) {
  const match = /^([\d.,]+)(.*)$/.exec(value);
  const numeric = match?.[1] ?? "";
  const suffix = match?.[2] ?? "";
  const target = parseFloat(numeric.replace(/,/g, ""));
  const decimals = numeric.includes(".") ? numeric.split(".")[1].length : 0;

  const { ref, inView } = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(target);
  const armed = useRef(false);

  // Drop to zero once mounted (the block is still hidden at this point, so
  // nobody sees the jump), then count up when it comes into view.
  useEffect(() => {
    if (!match) return;
    setShown(0);
    armed.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!match || !inView || !armed.current) return;
    let frame = 0;
    const start = performance.now();
    function step(now: number) {
      const u = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - u, 3);
      setShown(target * eased);
      if (u < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (!match || Number.isNaN(target)) return <span>{value}</span>;

  const text = shown.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {text}
        {suffix}
      </span>
    </span>
  );
}
