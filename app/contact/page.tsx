"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import siteData from "@/data/site.json";
import { buildSurveyMailtoLink } from "@/lib/contact";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Matches .envelope-flying's animation-duration in globals.css — the
// mailto: handoff waits for the fly-away to actually finish before it
// takes over the tab, so the animation always gets to play out.
const ENVELOPE_FLY_MS = 700;

// The submit button itself is the envelope — its own border is the
// envelope's rectangle, a full-width flap crease is drawn edge to edge
// across the top, and a wax-seal medallion sits at the crease's point —
// rather than a small icon sitting next to a plain "Send" label.
function EnvelopeSendButton({ sending }: { sending: boolean }) {
  return (
    <button
      type="submit"
      disabled={sending}
      className={`relative flex flex-col items-center justify-end border border-black w-56 h-24 font-mono text-[11px] tracking-[0.25em] uppercase transition-colors hover:bg-black hover:text-white pb-4 disabled:pointer-events-none ${
        sending ? "envelope-flying" : ""
      }`}
    >
      <svg
        viewBox="0 0 224 96"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
        fill="none"
      >
        <path
          d="M0 0 112 46 224 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="112" cy="46" r="7" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="112" cy="46" r="2" fill="currentColor" stroke="none" />
      </svg>
      <span className="relative z-10">Send</span>
    </button>
  );
}

// We work exclusively with hospitality brands, see contactIntro in
// data/site.json, so every option below stays inside that scope rather
// than opening up to any business type.
const PROPERTY_TYPES = [
  "Independent hotel",
  "Boutique hotel",
  "Hotel group",
  "Resort",
  "Restaurant or F&B",
  "Other hospitality brand",
];
const SIZES = ["Under 20 rooms", "20–100 rooms", "100+ rooms", "Multiple properties"];
const NEEDS = [
  "Social content",
  "Website photography & film",
  "Brand film",
  "Full content strategy",
  "Not sure yet",
];
const ENGAGEMENTS = ["Long-term partnership", "One-time project", "Not sure yet"];
const TEAM_OPTIONS = ["Yes", "No", "Some freelancers"];
const TIMELINES = ["ASAP", "Next 1–3 months", "Just exploring"];

function GroupHeader({
  index,
  total,
  label,
}: {
  index: number;
  total: number;
  label: string;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-8 pt-14 border-t border-black/10 first:border-t-0 first:pt-0">
      <span className="font-mono text-[10px] tracking-[0.2em] text-black/30">
        0{index}/0{total}
      </span>
      <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-black/50">
        {label}
      </h2>
    </div>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-black/40 mb-2 block">
        {label}
        {optional && <span className="text-black/25 normal-case"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border-b border-black/20 focus:border-black bg-transparent py-2 font-mono text-sm outline-none transition-colors placeholder:text-black/25";

function ToggleGroup({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(selected ? "" : opt)}
            className={`border px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors ${
              selected
                ? "bg-black text-white border-black"
                : "border-black/20 text-black/60 hover:border-black hover:text-black"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ToggleGroupMulti({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`border px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors ${
              selected
                ? "bg-black text-white border-black"
                : "border-black/20 text-black/60 hover:border-black hover:text-black"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The contact page — a short qualifying questionnaire rather than a bare
 * "email us" form, so a first message already carries the context the
 * studio actually needs (property, scope, timeline) before a reply.
 * Submits with no backend: compiles the answers into one message and hands
 * off to the visitor's own mail client via a mailto: link (see
 * buildSurveyMailtoLink) addressed to contactEmail in data/site.json —
 * swap that placeholder for the real inbox once there is one.
 */
export default function ContactPage() {
  const reducedMotion = useReducedMotion();
  const [sending, setSending] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [engagement, setEngagement] = useState("");
  const [hasTeam, setHasTeam] = useState("");
  const [timeline, setTimeline] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [heardFrom, setHeardFrom] = useState("");

  function toggleNeed(opt: string) {
    setNeeds((prev) =>
      prev.includes(opt) ? prev.filter((n) => n !== opt) : [...prev, opt],
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    const link = buildSurveyMailtoLink({
      propertyType,
      location,
      size,
      needs,
      engagement,
      hasTeam,
      timeline,
      name,
      role,
      hotelName,
      email,
      phone,
      heardFrom,
      notes,
    });
    // The envelope flies off first (see .envelope-flying in globals.css) —
    // mailto:, not window.open — that would just leave a blank tab behind
    // once the mail client takes over.
    setSending(true);
    setTimeout(
      () => {
        window.location.href = link;
      },
      reducedMotion ? 0 : ENVELOPE_FLY_MS,
    );
  }

  return (
    <div className="min-h-screen bg-white text-black px-6 md:px-16 py-28 md:py-32">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block font-mono text-[11px] tracking-[0.2em] uppercase text-black/50 hover:text-black underline underline-offset-4 decoration-black/30 transition-colors mb-12"
        >
          ← Back to Yeh Media
        </Link>

        <h1 className="font-sans font-semibold text-4xl md:text-5xl tracking-tight uppercase mb-4">
          {siteData.copy.contactTitle}
        </h1>
        <p className="font-mono font-normal text-sm md:text-base text-black/60 leading-relaxed max-w-lg mb-16">
          {siteData.copy.contactIntro}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-16">
          <div>
            <GroupHeader index={1} total={3} label="About the property" />
            <div className="flex flex-col gap-8">
              <Field label="What best describes you?">
                <ToggleGroup
                  options={PROPERTY_TYPES}
                  value={propertyType}
                  onSelect={setPropertyType}
                />
              </Field>
              <Field label="Where is it located?">
                <input
                  className={inputClass}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, country"
                />
              </Field>
              <Field label="Size">
                <ToggleGroup options={SIZES} value={size} onSelect={setSize} />
              </Field>
            </div>
          </div>

          <div>
            <GroupHeader index={2} total={3} label="About the project" />
            <div className="flex flex-col gap-8">
              <Field label="What are you looking for? Pick any that apply">
                <ToggleGroupMulti
                  options={NEEDS}
                  values={needs}
                  onToggle={toggleNeed}
                />
              </Field>
              <Field label="Long-term partnership or a one-time project?">
                <ToggleGroup
                  options={ENGAGEMENTS}
                  value={engagement}
                  onSelect={setEngagement}
                />
              </Field>
              <Field label="Do you currently work with a content team or agency?">
                <ToggleGroup
                  options={TEAM_OPTIONS}
                  value={hasTeam}
                  onSelect={setHasTeam}
                />
              </Field>
              <Field label="Timeline">
                <ToggleGroup
                  options={TIMELINES}
                  value={timeline}
                  onSelect={setTimeline}
                />
              </Field>
            </div>
          </div>

          <div>
            <GroupHeader index={3} total={3} label="About you" />
            <div className="flex flex-col gap-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <Field label="Name">
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Role" optional>
                  <input
                    className={inputClass}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </Field>
                <Field label="Hotel / property name">
                  <input
                    className={inputClass}
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Phone" optional>
                  <input
                    type="tel"
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
                <Field label="How did you hear about us?" optional>
                  <input
                    className={inputClass}
                    value={heardFrom}
                    onChange={(e) => setHeardFrom(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Anything else we should know?" optional>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="pt-4">
            <EnvelopeSendButton sending={sending} />
          </div>
        </form>
      </div>
    </div>
  );
}
