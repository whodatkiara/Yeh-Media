"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@/lib/use-in-view";

type RevealVars = CSSProperties & { "--reveal-delay"?: string };

/**
 * Wraps content in the .reveal/.is-visible treatment already scaffolded in
 * globals.css (rise + fade in, via --reveal-delay) — toggled the moment
 * the wrapped element scrolls into view, via useInView.
 */
export default function ScrollReveal({
  children,
  delayMs = 0,
  className = "",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal${inView ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--reveal-delay": `${delayMs}ms` } as RevealVars}
    >
      {children}
    </div>
  );
}
