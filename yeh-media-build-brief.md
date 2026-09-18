# Yeh Media — Interactive Proposal Site
## Build Brief for Claude Code

---

## 1. What this is

A standalone, chic, interactive proposal site for Yeh Media, a content strategy studio for hotels. It is sent to individual hotel prospects via personalized links. The centerpiece is a tunable 3x3 grid where the prospect sets three parameters (Storytelling, AI, Cinematic) and receives a curated visual concept in return. The site's job is to convert a visit into a WhatsApp conversation and to argue for an annual partnership, not a one-off video.

Positioning note that must survive into the copy: Yeh Media is not a video production company. It is a concept strategist. The site sells ongoing creative direction that evolves over a year. The generated result is a "starting frequency," explicitly framed as something that gets retuned as the hotel's story develops.

---

## 2. Stack and constraints

- **Next.js (App Router), deployed on Vercel.**
- No backend, no database. All prospect interaction leaves the site via WhatsApp deep links (`wa.me`).
- All 27 reveal combinations and all hotel personalization data live in static JSON files. Content is filled in later; build everything manifest-driven so swapping content never touches components.
- English only.
- Must be fully usable on mobile. Prospects will receive the link over WhatsApp or email and many will open it on a phone. The grid interaction must work as taps, not hover.
- Respect `prefers-reduced-motion`: replace morphs and resolves with simple fades.

---

## 3. Routes

| Route | Purpose |
|---|---|
| `/` | Generic version. Intro card asks for their name. |
| `/for/[hotel]` | Personalized version. Intro card already carries the hotel name and contact name from `hotels.json`. Unknown slug falls back to generic behavior. |
| `/about` | About page. |

Use `generateStaticParams` from `hotels.json` so personalized pages are pre-rendered.

---

## 4. Data files (create with placeholder content)

### `data/combinations.json`
27 entries. Key format: `s{1-3}-a{1-3}-c{1-3}` (storytelling, ai, cinematic).

```json
{
  "s2-a1-c3": {
    "image": "/reveals/s2-a1-c3.jpg",
    "title": "Placeholder title",
    "explanation": "Two to three sentences describing what this mix means for their content direction. Placeholder."
  }
}
```

Generate all 27 keys with placeholder text and a shared placeholder image so the site works before real content exists. Images will later be dropped into `/public/reveals/` using the same naming convention. No code changes required to fill content.

### `data/hotels.json`

```json
{
  "hotel-de-europe": {
    "hotelName": "Hotel de l'Europe",
    "contactName": "Sarah"
  }
}
```

Include two or three dummy entries for testing.

### `data/site.json`
WhatsApp number(s), copy strings, contact details. One place to edit everything.

---

## 5. The intro card (loads once)

**Behavior**
- Full-screen cream overlay on first visit. A single card sits centered, styled like a letterpress name card: cream stock, debossed serif name, typewriter mono details.
- Generic route: the card has one quiet input line, "Your name," typewriter style, like typing onto the card itself. An "Enter" affordance appears after they type (or they can skip; never block entry).
- Personalized route: no input. The card is already printed with "Prepared for {contactName}, {hotelName}" in typewriter mono. A short beat (2 to 3 seconds), then an enter affordance.
- On enter: the card shrinks and slides to the bottom-right corner and becomes the **notes card** (see section 6). This is the one showpiece transition of the site; make it feel physical, like a card being set aside on a desk.
- Set a `localStorage` flag. On return visits, skip the overlay entirely; the notes card is simply present in the corner already.

**Register warning:** this is quiet luxury, not a splash screen. No progress bars, no percentage counters, no spinners. The card is a ritual, not a loader.

---

## 6. The notes card (persistent corner element)

- Small folded note card fixed bottom-right. Debossed label: "Notes."
- Tap/click expands it into a writable card (textarea styled as typewriter text on paper). Collapse back down freely.
- Content persists in `localStorage`.
- Whatever is written here gets bundled into the WhatsApp message at the CTA (section 9). The card itself can also carry a small "send" affordance for people who want to reach out before finishing the grid.
- Do NOT silently transmit anything. All sending happens through the user's own WhatsApp via deep link.

---

## 7. Landing section

- Near-full-viewport. Cream paper, grain overlay, generous whitespace.
- Display serif headline, editorial and short. Working copy (placeholder, will be rewritten):
  - Headline: "Content is not the product. The story is."
  - Subline (mono, small): "Yeh Media. Concept, direction and content strategy for hotels."
- If personalized: a single small mono line, "Prepared for {hotelName}."
- A quiet scroll cue. No animation carnival. One element may breathe subtly (e.g., the grain).

---

## 8. The grid (the instrument)

**Structure**
- A 3x3 selector matrix. Rows are parameters, columns are intensity.
  - Row 1: **Storytelling** — 1/3, 2/3, 3/3
  - Row 2: **AI** — 1/3, 2/3, 3/3
  - Row 3: **Cinematic** — 1/3, 2/3, 3/3
- Exactly one cell selectable per row. Selecting a cell in a row deselects that row's previous choice.
- Each cell carries a one-line hint on hover (desktop) or a small caption (mobile) describing what that level means. Placeholder text for now, keys in `site.json`.
- Selected state: debossed/pressed look, ink fills slightly, like a key pressed into paper. Tactile, not glowing.

**Making "you must tune it" obvious without a tutorial**
- Section header in mono: "Tune the grid." Small subline: "Three parameters. One direction."
- The reveal frame (section 9) sits directly below and starts as fine film grain / static inside an embossed empty frame. It visibly wants a signal.
- A tiny mono counter under the grid: "0 of 3 tuned" → "1 of 3" → "2 of 3". When the third selection lands, the counter disappears and the reveal resolves.
- Optional: the first row pulses once, very subtly, when the grid scrolls into view. Once. Never loop it.

**States**
1. **Untuned / partial:** static in the reveal frame, counter visible.
2. **Complete:** static resolves (short dissolve, ~600ms) into the image and text for the matching key from `combinations.json`.
3. **Retuned:** changing any selection after completion re-resolves through a brief static flicker into the new combination. This should feel like turning a dial on a radio. It is also a quiet enactment of the annual-partnership message.

---

## 9. The reveal

When all three parameters are set:

- The matching image fades in inside the frame, with `title` above and `explanation` beside or below it (serif for title, readable size for explanation).
- Beneath the explanation, the **retuning line** in mono. This is strategically important copy. It is NOT a disclaimer; it is the argument for the annual contract:

  > "This is your starting frequency. A hotel's story moves with seasons, openings and guests. Over the course of a year, we retune it with you."

- Then the primary CTA.

**Primary CTA: "Send this to Yeh Media"**
- Builds a `wa.me/{number}?text=` deep link, opening WhatsApp on their device with a pre-filled message:

```
Hi Yeh Media, this is {name} ({hotelName}).
My tuning: Storytelling {x}/3 · AI {y}/3 · Cinematic {z}/3.
Notes: {notes card content, if any}
```

- URL-encode properly. If no name/hotel/notes, omit those lines gracefully.
- Secondary, quieter link underneath: "or book a call" (mailto or calendar link from `site.json`).

---

## 10. About page

- Same paper language. Two short editorial blocks:
  1. Who Yeh Media is: concept strategists, not a production house. Vision, storytelling, direction first; content as the output of that thinking.
  2. How the partnership works: annual, evolving, retuned across the year. Echo the "frequency" language once, no more.
- Founders' names in the letterpress card style (this can literally reuse the intro card component as a static element, one card per person).
- Link back to yeh.nl for the design studio, small, in the footer.

---

## 11. Menu

- Minimal. A single mono word "Menu" or "Index" top-right (top-left on mobile), opening a full-screen cream overlay with three items in large serif: Home, About, Contact (contact scrolls to CTA or opens WhatsApp).
- No hamburger icon. Text only.

---

## 12. Visual system

- **Palette:** cream/paper `#F4F1EA` range background, near-black ink `#1A1815`, one accent only: merlot `#5E2A2B` used sparingly (selected states, one word of a headline at most). Nothing else.
- **Type:** Instrument Serif (or similar editorial serif; Google Fonts) for display. Space Mono or Courier Prime for the typewriter/mono voice (cards, captions, counters, hints). Two families total.
- **Texture:** subtle paper grain overlay site-wide (CSS or a tiny tiled PNG at low opacity). Embossed/debossed effects via layered inset and outset shadows, never drop-shadow glows.
- **Motion rules:** two signature moves only. (1) The card-to-notes morph. (2) The static-to-image resolve. Everything else is opacity and small translateY fades. No parallax, no scroll-jacking, no marquee text. If a third trick suggests itself, cut it.

---

## 13. Component list

```
app/
  layout.tsx            (fonts, grain overlay, notes card mount)
  page.tsx              (generic landing)
  for/[hotel]/page.tsx  (personalized landing)
  about/page.tsx
components/
  IntroCard.tsx         (overlay, name input or personalized print, morph-out)
  NotesCard.tsx         (corner card, expand/collapse, localStorage, send affordance)
  Landing.tsx
  TuningGrid.tsx        (3x3 selector, one per row, counter, hints)
  Reveal.tsx            (static state, resolve animation, title/explanation/retune line)
  SendCTA.tsx           (wa.me link builder)
  Menu.tsx
  Grain.tsx
data/
  combinations.json     (27 placeholder entries)
  hotels.json           (dummy entries)
  site.json             (numbers, copy strings, links)
public/reveals/         (placeholder image now; 27 real images later)
```

State to track globally (context or a small store): `visitorName`, `hotelSlug/hotelName`, `selections {s, a, c}`, `notes`. Persist name and notes in `localStorage`.

---

## 14. What NOT to do

- No live AI image generation. All 27 reveals are pre-curated.
- No silent data transmission of any kind. WhatsApp deep links only.
- No yellow post-it styling. The note is cream stock, same paper language as everything else.
- No loading spinners, progress bars, or fake load percentages on the intro card.
- No third animation trick. The tuning grid and the card morph are the show; everything else stays still.
- Do not let the retuning line read like legal small print. It is set in the same considered typography as the rest and positioned as a promise, not a caveat.

---

## 15. Content still to come (build with placeholders)

- 27 reveal images (`/public/reveals/s{x}-a{y}-c{z}.jpg`)
- 27 titles + explanations in `combinations.json`
- Per-level hint lines for the 9 grid cells
- Final headline and about copy
- Real hotel entries in `hotels.json`
- WhatsApp number(s) and calendar link in `site.json`
