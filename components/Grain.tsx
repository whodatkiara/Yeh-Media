"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";

export default function Grain() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`grain ${reducedMotion ? "" : "grain-breathe"}`}
      aria-hidden="true"
    />
  );
}
