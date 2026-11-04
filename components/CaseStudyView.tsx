"use client";

import { useRef } from "react";
import Link from "next/link";
import { projects } from "@/components/Portfolio";
import ScrollReveal from "@/components/ScrollReveal";
import { caseStudies, type CaseStudy } from "@/data/case-studies";
import { useVideoErrorRetry } from "@/lib/use-video-retry";

function Media({ project }: { project: (typeof projects)[number] }) {
  const ref = useRef<HTMLVideoElement>(null);
  useVideoErrorRetry(ref);
  return (
    <div
      className="relative w-full overflow-hidden bg-black/[0.04]"
      style={{ aspectRatio: project.aspect ?? "9/16" }}
    >
      {/* Not muted: this only plays on a deliberate press of the controls,
          so it can carry real sound. */}
      <video
        ref={ref}
        src={project.video}
        poster={project.src ?? undefined}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-6 font-sans text-2xl font-semibold uppercase leading-tight tracking-tight md:text-3xl">
      {children}
    </h2>
  );
}

/**
 * One "Behind the piece" page: the piece itself, the thinking behind it (the
 * neuroaesthetics), and, where there are real numbers, the results. Content
 * lives in data/case-studies.ts.
 */
export default function CaseStudyView({ study }: { study: CaseStudy }) {
  const project = projects.find((p) => p.project === study.project);
  if (!project) return null;

  const [aw, ah] = (project.aspect ?? "9/16").split("/").map(Number);
  const landscape = aw > ah;
  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  const text = (
    <div className="flex flex-col gap-16">
      <ScrollReveal>
        <SectionTitle>The Thinking.</SectionTitle>
        <div className="flex flex-col gap-5 font-mono text-sm leading-relaxed text-black/60 md:text-base">
          {study.thinking.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <dl className="mt-10 border-t border-black/10">
          {study.reads.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-black/10 py-4 md:grid-cols-[8rem_1fr]"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
                {r.label}
              </dt>
              <dd className="font-mono text-sm leading-relaxed text-black/70">
                {r.text}
              </dd>
            </div>
          ))}
        </dl>
      </ScrollReveal>

      {study.results && (
        <ScrollReveal>
          <SectionTitle>The Results.</SectionTitle>
          <p className="mb-8 font-sans text-xl font-semibold tracking-tight md:text-2xl">
            {study.results.headline}
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            {study.results.metrics.map((m) => (
              <div key={m.label}>
                <p className="font-sans text-4xl font-semibold tracking-tight md:text-5xl">
                  {m.value}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
          <ul className="mt-10 border-t border-black/10">
            {study.results.compared.map((c) => (
              <li key={c.lead} className="border-b border-black/10 py-4">
                <p className="font-sans text-base font-semibold tracking-tight">
                  {c.lead}
                </p>
                <p className="mt-1 font-mono text-sm leading-relaxed text-black/60">
                  {c.text}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-[11px] leading-relaxed tracking-[0.05em] text-black/40">
            Figures from Instagram's reel insights. "Typical" means the
            account's typical reel, as Instagram compares it.
          </p>
        </ScrollReveal>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-6 pb-24 pt-28 text-black md:px-16 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/work"
          className="mb-12 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-black/50 underline decoration-black/30 underline-offset-4 transition-colors hover:text-black"
        >
          ← Back to Our Work
        </Link>

        <header className="mb-12 md:mb-16">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
            {study.eyebrow}
          </p>
          <h1 className="mb-4 font-sans text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            {study.project}
          </h1>
          <p className="max-w-xl font-mono text-sm leading-relaxed text-black/60 md:text-base">
            {study.standfirst}
          </p>
        </header>

        {landscape ? (
          <div className="flex flex-col gap-16">
            <Media project={project} />
            <div className="max-w-2xl">{text}</div>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-20">
            <div className="mx-auto w-full max-w-[360px] md:sticky md:top-28 md:self-start">
              <Media project={project} />
            </div>
            {text}
          </div>
        )}

        <div className="mt-24 border-t border-black/10 pt-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
            Next
          </p>
          <Link
            href={`/work/${next.slug}`}
            className="font-sans text-2xl font-semibold uppercase tracking-tight underline decoration-black/30 underline-offset-8 transition-colors hover:decoration-black md:text-3xl"
          >
            {next.project} →
          </Link>
        </div>
      </div>
    </div>
  );
}
