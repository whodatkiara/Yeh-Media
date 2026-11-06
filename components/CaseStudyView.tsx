"use client";

import { useRef } from "react";
import Link from "next/link";
import { projects } from "@/components/Portfolio";
import CaseGallery from "@/components/CaseGallery";
import CountUp from "@/components/CountUp";
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
    <h2 className="font-sans text-2xl font-semibold uppercase leading-tight tracking-tight md:text-3xl">
      {children}
    </h2>
  );
}

function Label({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">
      {children}
    </p>
  );
}

/**
 * One "Behind the piece" page. On a laptop the piece stays frozen on the left
 * for the whole page while the words scroll past on the right: the idea in one
 * line, the thinking, what the eye picks up, and (where there are real
 * numbers) the results, each part fading in as it arrives. On a phone it all
 * runs in a single column. Content lives in data/case-studies.ts.
 */
export default function CaseStudyView({ study }: { study: CaseStudy }) {
  const project = projects.find((p) => p.project === study.project);
  if (!project) return null;

  const [aw, ah] = (project.aspect ?? "9/16").split("/").map(Number);
  const landscape = aw > ah;
  // A photo series has no single video: its photos are paged through instead.
  const series = !project.video && (project.media?.length ?? 0) > 1;
  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <div className="min-h-screen bg-white px-6 pt-28 text-black md:px-16 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/work"
          className="mb-10 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-black/50 underline decoration-black/30 underline-offset-4 transition-colors hover:text-black md:mb-14"
        >
          ← Back to Our Work
        </Link>

        <div
          className={`grid gap-x-16 gap-y-12 lg:gap-x-24 ${
            landscape
              ? "md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
              : "md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
          }`}
        >
          <header className="md:col-start-2 md:row-start-1">
            <ScrollReveal>
              <Label>{study.eyebrow}</Label>
            </ScrollReveal>
            <ScrollReveal delayMs={80}>
              <h1 className="mb-5 mt-3 font-sans text-4xl font-semibold uppercase leading-[1.05] tracking-tight md:text-5xl">
                {study.project}
              </h1>
            </ScrollReveal>
            <ScrollReveal delayMs={160}>
              <p className="max-w-lg font-mono text-base leading-relaxed text-black/60">
                {study.standfirst}
              </p>
            </ScrollReveal>
          </header>

          {/* Frozen on the left on a laptop: it stays in view while the
              right-hand column scrolls past. Sized to fit the screen's
              height so the whole piece is always visible. */}
          <div className="md:col-start-1 md:row-span-2 md:row-start-1 md:self-start md:sticky md:top-28">
            <ScrollReveal delayMs={120}>
              <div
                className={
                  landscape
                    ? "w-full"
                    : series
                      ? "mx-auto w-full max-w-[360px] md:mx-0 md:w-[min(100%,calc((100svh-13rem)*2/3))] md:max-w-none"
                      : "mx-auto w-full max-w-[360px] md:mx-0 md:w-[min(100%,calc((100svh-9rem)*9/16))] md:max-w-none"
                }
              >
                {series ? (
                  <CaseGallery media={project.media!} title={project.project} />
                ) : (
                  <Media project={project} />
                )}
              </div>
            </ScrollReveal>
          </div>

          <div className="flex flex-col gap-28 md:col-start-2 md:row-start-2 md:gap-36">
            <section>
              <ScrollReveal>
                <SectionTitle>The Thinking.</SectionTitle>
              </ScrollReveal>
              <ScrollReveal delayMs={80}>
                <p className="mb-10 mt-6 font-sans text-2xl font-semibold leading-snug tracking-tight md:text-4xl md:leading-tight">
                  {study.takeaway}
                </p>
              </ScrollReveal>
              <div className="flex flex-col gap-8">
                {study.thinking.map((p) => (
                  <ScrollReveal key={p}>
                    <p className="font-mono text-[15px] leading-[1.9] text-black/70 md:text-base md:leading-[1.9]">
                      {p}
                    </p>
                  </ScrollReveal>
                ))}
              </div>

              <div className="mt-16">
                <ScrollReveal>
                  <Label>What the eye picks up</Label>
                </ScrollReveal>
                <ol className="mt-5 border-t border-black/15">
                  {study.reads.map((r, i) => (
                    <li key={r.label}>
                      <ScrollReveal delayMs={i * 90}>
                        <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 border-b border-black/15 py-6 md:grid-cols-[3rem_8rem_1fr] md:items-baseline">
                          <span className="font-mono text-[11px] tracking-[0.2em] text-black/35">
                            0{i + 1}
                          </span>
                          <span className="font-sans text-lg font-semibold uppercase tracking-tight">
                            {r.label}
                          </span>
                          <span className="col-start-2 font-mono text-sm leading-relaxed text-black/65 md:col-start-auto md:text-[15px]">
                            {r.text}
                          </span>
                        </div>
                      </ScrollReveal>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {study.results && (
              <section>
                <ScrollReveal>
                  <SectionTitle>The Results.</SectionTitle>
                </ScrollReveal>
                <ScrollReveal delayMs={80}>
                  <p className="mb-12 mt-6 font-sans text-2xl font-semibold leading-snug tracking-tight md:text-4xl md:leading-tight">
                    {study.results.headline}
                  </p>
                </ScrollReveal>
                <div className="grid grid-cols-2 gap-x-6 gap-y-12">
                  {study.results.metrics.map((m, i) => (
                    <ScrollReveal key={m.label} delayMs={(i % 2) * 120}>
                      <p className="font-sans text-5xl font-semibold leading-none tracking-tight md:text-6xl">
                        <CountUp value={m.value} />
                      </p>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black">
                        {m.label}
                      </p>
                      <p className="mt-1 font-mono text-xs leading-relaxed text-black/50">
                        {m.hint}
                      </p>
                    </ScrollReveal>
                  ))}
                </div>

                <div className="mt-16">
                  <ScrollReveal>
                    <Label>How it compares</Label>
                  </ScrollReveal>
                  <ul className="mt-5 border-t border-black/15">
                    {study.results.compared.map((c, i) => (
                      <li key={c.lead}>
                        <ScrollReveal delayMs={i * 90}>
                          <div className="border-b border-black/15 py-6">
                            <p className="font-sans text-lg font-semibold leading-snug tracking-tight md:text-xl">
                              {c.lead}
                            </p>
                            <p className="mt-2 font-mono text-sm leading-relaxed text-black/60 md:text-[15px]">
                              {c.text}
                            </p>
                          </div>
                        </ScrollReveal>
                      </li>
                    ))}
                  </ul>
                  <ScrollReveal>
                    <p className="mt-6 font-mono text-[11px] leading-relaxed tracking-[0.05em] text-black/40">
                      Figures from Instagram's reel insights. "Typical" means
                      the account's typical reel, as Instagram compares it.
                    </p>
                  </ScrollReveal>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="mt-36 border-t border-black/10 pt-10 md:mt-48">
          <ScrollReveal>
            <Label>Next</Label>
            <Link
              href={`/work/${next.slug}`}
              className="mt-3 inline-block font-sans text-3xl font-semibold uppercase leading-tight tracking-tight underline decoration-black/30 underline-offset-8 transition-colors hover:decoration-black md:text-5xl"
            >
              {next.project} →
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
