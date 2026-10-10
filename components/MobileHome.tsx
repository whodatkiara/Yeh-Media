"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import siteData from "@/data/site.json";
import { useSite } from "@/lib/site-context";
import { useInView } from "@/lib/use-in-view";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useVideoErrorRetry } from "@/lib/use-video-retry";
import HeroPhrase from "@/components/HeroPhrase";
import HotelRow from "@/components/HotelRow";
import ScrollReveal from "@/components/ScrollReveal";
import { services } from "@/components/Services";
import {
  NEURO_LINE,
  pillarsRevealAfter,
  pillarsRevealBefore,
} from "@/components/Pillars";
import { featuredProjects, type Project } from "@/components/Portfolio";

/**
 * The homepage on phones: one continuous scrolling page instead of the
 * swipe-driven slide deck (HomeDeck, which tablets and desktop keep).
 * Each section animates in as it scrolls into view, the hotel diorama
 * assembles when you reach it, and every project gets a big picture/clip
 * with its text right under it, where the deck's filmstrip had to squeeze
 * thumbnails and text side by side.
 *
 * Section ids line up with the deck's slide indices so "?slide=N" (the
 * /work page's back link) still lands on the right part of the page.
 */
const SECTION_IDS = ["hero", "hotel", "who", "services", "projects", "studio"];

const LOAD_HOLD_MS = 380;
// Must match .roll-out/.roll-in's animation-duration in globals.css.
const LOAD_ROLL_MS = 600;
const SEQUENCE = [...siteData.introLoadWords, "Yeh Media"];

const titleClass =
  "font-sans font-semibold text-[clamp(28px,9vw,40px)] leading-[1.1] tracking-tight uppercase mb-7";
const bodyClass = "font-mono font-normal text-base leading-relaxed";

function Hero({ scrolledPast }: { scrolledPast: (past: boolean) => void }) {
  const { hotelName } = useSite();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(reducedMotion ? SEQUENCE.length - 1 : 0);
  const [pending, setPending] = useState<number | null>(null);
  const [ready, setReady] = useState(reducedMotion);
  const ref = useRef<HTMLElement>(null);

  // The same "Shaping. Directing. Creating. Yeh Media" roll the deck opens
  // with, then the phrase fades in and the scroll cue appears. Under
  // reduced motion it skips straight to the finished state (and, if the
  // setting flips on mid-session, jumps there rather than stranding the
  // hero on its first word).
  useEffect(() => {
    if (reducedMotion) {
      setStep(SEQUENCE.length - 1);
      setPending(null);
      setReady(true);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function advance(from: number) {
      timer = setTimeout(() => {
        if (cancelled) return;
        setPending(from + 1);
        timer = setTimeout(() => {
          if (cancelled) return;
          setStep(from + 1);
          setPending(null);
          if (from + 1 < SEQUENCE.length - 1) advance(from + 1);
          else timer = setTimeout(() => !cancelled && setReady(true), LOAD_HOLD_MS);
        }, LOAD_ROLL_MS);
      }, LOAD_HOLD_MS);
    }
    advance(0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reducedMotion]);

  // Tell the page once the hero has scrolled away, so the small logo and
  // the soft header fade can come in.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => scrolledPast(!entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrolledPast]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-svh flex flex-col items-center justify-center gap-6 px-6 text-center"
    >
      {hotelName && (
        <p className="font-mono font-light text-[10px] tracking-[0.3em] uppercase text-black/45">
          {siteData.copy.preparedFor.replace("{hotelName}", hotelName)}
        </p>
      )}
      <div className="roll-window w-full font-sans font-semibold text-[clamp(34px,11vw,52px)] tracking-[-0.01em] uppercase">
        {pending !== null ? (
          <>
            <span key={`out-${step}`} className="roll-face roll-out">
              {SEQUENCE[step]}
            </span>
            <span key={`in-${pending}`} className="roll-face roll-in">
              {SEQUENCE[pending]}
            </span>
          </>
        ) : (
          <span className="roll-face">{SEQUENCE[step]}</span>
        )}
      </div>
      <div
        className={`w-full text-black/70 transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {ready && <HeroPhrase />}
      </div>
      <span
        aria-hidden="true"
        className={`ph-cue transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </section>
  );
}

// The hotel diorama assembles when scrolled into view and replays on
// re-entry, as it did on the deck's slide 1.
function Hotel() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.35 }, false);
  const [assemble, setAssemble] = useState(false);

  useEffect(() => {
    if (!inView) {
      setAssemble(false);
      return;
    }
    const t = setTimeout(() => setAssemble(true), 350);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <section
      id="hotel"
      ref={ref}
      className="relative isolate h-[82svh] mt-4"
    >
      <HotelRow visible={inView} assemble={assemble} compact />
    </section>
  );
}

// "Neuroaesthetics." gets its own line and a second, later beat — see
// Pillars.tsx.
function NeuroParagraph() {
  const { ref, inView } = useInView<HTMLParagraphElement>();
  return (
    <p
      ref={ref}
      className={`${bodyClass} mt-10 transition-all duration-[900ms] ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {pillarsRevealBefore}
      <span
        className={`block my-3 origin-left font-sans font-semibold text-3xl tracking-tight transition-all duration-700 ease-out ${
          inView ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        style={{ transitionDelay: inView ? "350ms" : "0ms" }}
      >
        {NEURO_LINE}
      </span>
      {pillarsRevealAfter}
    </p>
  );
}

function Who() {
  return (
    <section id="who" className="px-6 pt-24 pb-2">
      <ScrollReveal>
        <h2 className={titleClass}>{siteData.copy.pillarsTitle}</h2>
      </ScrollReveal>
      <ScrollReveal delayMs={100} className="mb-5">
        <p className={`${bodyClass} text-black/60`}>
          {siteData.copy.pillarsBody}
        </p>
      </ScrollReveal>
      <ScrollReveal delayMs={100}>
        <p className={bodyClass}>{siteData.copy.pillarsIntro}</p>
      </ScrollReveal>
      <NeuroParagraph />
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="px-6 pt-24 pb-2">
      <ScrollReveal>
        <h2 className={titleClass}>{siteData.copy.servicesTitle}</h2>
      </ScrollReveal>
      <div className="flex flex-col gap-7">
        {services.map((service, i) => (
          <ScrollReveal key={service.title} delayMs={i * 80}>
            <div className="flex flex-col gap-2 border-t border-black/10 pt-5">
              <h3 className="flex items-baseline gap-3 font-sans font-semibold text-lg tracking-tight uppercase">
                <span className="font-mono text-[10px] font-normal tracking-[0.2em] text-black/35">
                  0{i + 1}
                </span>
                {service.title}
              </h3>
              <p className="font-mono text-[15px] leading-relaxed text-black/60">
                {service.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

// Big picture/clip first, text right under it. Clips play only while on
// screen; photo series cross-fade on their own. The reveal is a white
// curtain sliding away rather than a clip-path — clip-path on a container
// holding a video is flaky on iOS, and a curtain leaves the video itself
// untouched so it can start playing underneath.
function ProjectMedia({ project, reveal }: { project: Project; reveal: boolean }) {
  const reducedMotion = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const images =
    project.media && project.media.length > 1
      ? project.media.filter((m) => m.type === "image").map((m) => m.src)
      : null;
  const [cycle, setCycle] = useState(0);

  // Also makes the clip iOS-autoplay-safe (muted/inline attributes) — must
  // be declared before the effect below that calls play().
  useVideoErrorRetry(videoRef);

  useEffect(() => {
    const box = boxRef.current;
    const v = videoRef.current;
    if (!box || !v || reducedMotion) return;
    let onScreen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(box);
    // Low Power Mode (and some data-saver settings) refuse autoplay until
    // the first touch — pick the clip back up the moment there is one.
    const resume = () => {
      if (onScreen && v.paused) v.play().catch(() => {});
    };
    window.addEventListener("touchend", resume, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("touchend", resume);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!images) return;
    const id = setInterval(() => setCycle((i) => (i + 1) % images.length), 2200);
    return () => clearInterval(id);
  }, [images]);

  return (
    <div
      ref={boxRef}
      className="relative w-full aspect-[4/5] overflow-hidden bg-black/[0.04]"
    >
      {project.video ? (
        <video
          ref={videoRef}
          src={project.video}
          poster={project.src ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : images ? (
        images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="100vw"
            className={`object-cover transition-opacity duration-700 ${
              i === cycle ? "opacity-100" : "opacity-0"
            }`}
          />
        ))
      ) : project.src ? (
        <Image src={project.src} alt="" fill sizes="100vw" className="object-cover" />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-white origin-bottom"
        style={{
          transform: reveal ? "scaleY(0)" : "scaleY(1)",
          transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}

function ProjectCard({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  const isLast = index === total - 1;

  return (
    <article ref={ref} className="mb-[72px]">
      <ProjectMedia project={project} reveal={inView} />
      <ScrollReveal delayMs={250}>
        <div className="pt-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-black/35 mb-2">
            0{index + 1} / 0{total}
          </p>
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-black/50 mb-1">
            {project.tag} · {project.format}
          </p>
          <h3 className="font-sans font-semibold text-[26px] leading-[1.15] tracking-tight mb-3">
            {project.project}
          </h3>
          <p className="font-mono text-[15px] leading-relaxed text-black/60">
            {project.description}
          </p>
          {isLast && (
            <Link
              href="/work"
              className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-black/50 hover:text-black underline underline-offset-4 decoration-black/30 transition-colors"
            >
              See more selected projects →
            </Link>
          )}
        </div>
      </ScrollReveal>
    </article>
  );
}

function Projects() {
  return (
    <section id="projects" className="px-6 pt-24 pb-2">
      <ScrollReveal>
        <h2 className={titleClass}>{siteData.copy.portfolioTitle}</h2>
      </ScrollReveal>
      {featuredProjects.map((project, i) => (
        <ProjectCard
          key={project.project}
          project={project}
          index={i}
          total={featuredProjects.length}
        />
      ))}
    </section>
  );
}

function Studio() {
  const { setCtaHidden } = useSite();
  const ref = useRef<HTMLElement>(null);

  // This section carries its own "Work With Us" — hide the floating one
  // while it's on screen so the same CTA never shows twice.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCtaHidden(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setCtaHidden(false);
    };
  }, [setCtaHidden]);

  return (
    <section id="studio" ref={ref} className="px-6 pt-24 pb-16">
      <ScrollReveal>
        <h2 className={titleClass}>{siteData.copy.studioTitle}</h2>
      </ScrollReveal>
      <ScrollReveal delayMs={100}>
        <p className={`${bodyClass} mb-8`}>{siteData.copy.studioText}</p>
      </ScrollReveal>
      <ScrollReveal delayMs={200}>
        <Link
          href="/contact"
          className="inline-block border border-black px-8 py-4 font-mono text-[11px] tracking-[0.25em] uppercase transition-colors hover:bg-black hover:text-white"
        >
          {siteData.copy.workWithUsCta}
        </Link>
      </ScrollReveal>
    </section>
  );
}

export default function MobileHome() {
  const [scrolled, setScrolled] = useState(false);
  const searchParams = useSearchParams();

  // "?slide=N" (the /work page's back link) lands on that part of the page.
  useEffect(() => {
    const raw = searchParams.get("slide");
    const index = raw === null ? NaN : Number(raw);
    if (!Number.isInteger(index) || index < 1 || index >= SECTION_IDS.length) return;
    document.getElementById(SECTION_IDS[index])?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white text-black">
      {/* Small logo once the hero has scrolled away — the solid white
          header strip behind it lives in the root layout. */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed top-6 left-6 z-40 p-0 font-sans font-semibold text-[17px] tracking-tight uppercase transition-all duration-500 ${
          scrolled
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1.5 pointer-events-none"
        }`}
      >
        Yeh Media
      </button>

      <Hero scrolledPast={setScrolled} />
      <Hotel />
      <Who />
      <Services />
      <Projects />
      <Studio />
    </div>
  );
}
