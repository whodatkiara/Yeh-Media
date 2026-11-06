// The "Behind the piece" pages on /work/<slug>. Each one belongs to a piece in
// components/Portfolio.tsx, matched on `project` (the piece's title).
//
// Every number here is read straight from Instagram's own reel insights.
// "Typical" always means the account's typical reel, which is the comparison
// Instagram itself makes. Nothing is benchmarked against an outside figure.

export type CaseStudy = {
  slug: string;
  // Must match `project` in components/Portfolio.tsx.
  project: string;
  eyebrow: string;
  standfirst: string;
  // One plain sentence that carries the whole idea, shown large above the detail.
  takeaway: string;
  thinking: string[];
  // Three short things the eye picks up, each a label and a sentence.
  reads: { label: string; text: string }[];
  results?: {
    headline: string;
    metrics: { value: string; label: string; hint: string }[];
    compared: { lead: string; text: string }[];
  };
};

const entries: CaseStudy[] = [
  {
    slug: "paris-by-design",
    project: "Paris, by Design",
    eyebrow: "Paris · Instagram Reel",
    standfirst:
      "Five restaurants, chosen by a designer. The room comes first, the menu second.",
    takeaway: "People decide how a room feels long before they decide what to order.",
    thinking: [
      "Most restaurant roundups lead with the food. This one leads with how it feels to walk in, because that is what a guest decides first. Every pick was made on atmosphere and material: green marble, brass, silver, soft light on dark surfaces.",
      "Neuroaesthetics gives the reasoning. Warm, low light reads as shelter and slows people down. Smooth, curved forms feel safer to the brain than hard corners. A reflective surface adds depth and lets a guest see the room fill with other people before they have sat down. We filmed for those three signals, so viewers feel the room before they read a word of the caption.",
      "The result is a recommendation that works like a visit. People do not only watch it, they keep it.",
    ],
    reads: [
      {
        label: "Light",
        text: "Warm and close to the table. It tells the body where to settle.",
      },
      {
        label: "Surface",
        text: "Stone, brass and glass catch the light and give the eye something to rest on.",
      },
      {
        label: "Depth",
        text: "Mirrors and long sightlines show the room with people in it, which is what makes a table feel worth booking.",
      },
    ],
    results: {
      headline: "Viewed 147,613 times.",
      metrics: [
        { value: "147,613", label: "Views", hint: "Times the reel was played" },
        { value: "9s", label: "Average watch time", hint: "How long people watched on average" },
        { value: "6.6K", label: "Saves", hint: "Kept to come back to" },
        { value: "280", label: "New follows", hint: "People who followed after watching" },
      ],
      compared: [
        {
          lead: "5.5 times more saves than likes.",
          text: "6.6K saves against 1.2K likes. A save is how people keep a place they mean to visit.",
        },
        {
          lead: "Above the account's typical reel.",
          text: "Instagram rates this reel's save rate (6.4%) and share rate (1.2%) higher than typical, and its skip rate (45.8%) lower.",
        },
        {
          lead: "About three times the views of Where to Stay, by Design.",
          text: "147,613 views against 48,063.",
        },
      ],
    },
  },
  {
    slug: "where-to-stay-by-design",
    project: "Where to Stay, by Design",
    eyebrow: "Paris · Instagram Reel",
    standfirst:
      "The best designer hotels in Paris, picked by someone who designs them.",
    takeaway: "A lobby tells a guest who they will be there, before they ever see a room.",
    thinking: [
      "A hotel recommendation is usually a list of amenities. This one is a list of feelings. The edit opens in a lobby and lets the details do the persuading: a round table with greenery, a velvet bench, a dark textured artwork against pale walls, and black and white floor tiles that give the room its rhythm.",
      "That rhythm is the neuroaesthetics. Pattern and contrast give the eye an order to follow, soft wall light keeps it calm, and natural materials and plants signal that a space is cared for. A guest reads all of that in a second, and it decides whether a place feels like somewhere they would stay.",
      "It is also a format, not a one-off. The same structure carries each hotel, so the series builds a point of view over time instead of a pile of posts.",
    ],
    reads: [
      {
        label: "Pattern",
        text: "A chequered floor gives the eye an order to follow, so the room feels composed at a glance.",
      },
      {
        label: "Light",
        text: "Soft light on the walls rather than overhead keeps the lobby warm and the mood calm.",
      },
      {
        label: "Material",
        text: "Velvet, wood, plaster and greenery. Natural textures read as care.",
      },
    ],
    results: {
      headline: "Viewed 48,063 times.",
      metrics: [
        { value: "48,063", label: "Views", hint: "Times the reel was played" },
        { value: "9s", label: "Average watch time", hint: "How long people watched on average" },
        { value: "1.4K", label: "Saves", hint: "Kept to come back to" },
        { value: "289", label: "New follows", hint: "People who followed after watching" },
      ],
      compared: [
        {
          lead: "More new follows than Paris, by Design.",
          text: "289 against 280, from about a third of the views.",
        },
        {
          lead: "Above the account's typical reel.",
          text: "Instagram rates this reel's save rate (5.1%) and share rate (0.9%) higher than typical, and its skip rate (49.3%) lower.",
        },
      ],
    },
  },
  {
    slug: "fashion-interiors",
    project: "Fashion Interiors",
    eyebrow: "Paris · Instagram Reel",
    standfirst:
      "A Paris boutique, read with a hospitality designer's eye.",
    takeaway: "A well-ordered space persuades without saying a word.",
    thinking: [
      "The brief we gave ourselves: find the shop that is quietly a masterclass in atmosphere, and show it the way a guest walks through a lobby. Pink tile, walnut shelves, a deep green display counter with rounded corners, lighting set in one clean line.",
      "Neuroaesthetics again. Rounded forms feel friendlier than sharp ones, a restrained palette of warm tones keeps the eye calm, and an ordered ceiling line leads it straight to the display. Nothing competes with what matters, and nothing needs to.",
      "Hotels use these same tools in lobbies, bars and corridors. Showing them in a boutique makes the lesson easy to see, and shows a hotel how we look at any space.",
    ],
    reads: [
      {
        label: "Form",
        text: "Rounded corners on the counter soften the room and invite the eye in.",
      },
      {
        label: "Palette",
        text: "Pink, walnut and deep green: warm and restrained, so nothing shouts.",
      },
      {
        label: "Order",
        text: "A single line of lights guides the eye through the space in one pass.",
      },
    ],
    results: {
      headline: "Viewed 16,346 times.",
      metrics: [
        { value: "16,346", label: "Views", hint: "Times the reel was played" },
        { value: "7s", label: "Average watch time", hint: "How long people watched on average" },
        { value: "40.8%", label: "Skip rate", hint: "Left in the opening seconds. Lower is better." },
        { value: "159", label: "Saves", hint: "Kept to come back to" },
      ],
      compared: [
        {
          lead: "The lowest skip rate of the three reels on this page.",
          text: "40.8%, and lower than the account's typical reel. Fewer people left in the opening seconds.",
        },
        {
          lead: "Saved as often as it was liked.",
          text: "159 saves, 159 likes. Instagram rates its save rate (1.2%) higher than typical.",
        },
      ],
    },
  },
  {
    slug: "the-rotterdam-interview",
    project: "The Rotterdam Interview",
    eyebrow: "Rotterdam · Interview · Website Feature",
    standfirst:
      "One long conversation, built for the website rather than the feed.",
    takeaway: "Trust is built at the pace of a real conversation.",
    thinking: [
      "A hotel deciding who to trust wants more than a reel. So we filmed a long, unhurried conversation in a Rotterdam interior and gave it room to breathe: no rush, no cuts for the sake of cuts.",
      "The set was chosen as carefully as the questions. Daylight from the side, a dark stone with a visible pattern, a warm neutral wall: calm surroundings with enough contrast to keep attention on the speaker and make a long film easy to stay with. The frame is wide enough to include the room, because the room is part of what is being said.",
      "A film like this gives a hotel something a feed cannot: the person and the thinking, at the pace of a real conversation. It sits on the website because that is where a buyer goes to decide.",
    ],
    reads: [
      {
        label: "Light",
        text: "Daylight from the side, never overhead. It shapes the face and keeps the room honest.",
      },
      {
        label: "Setting",
        text: "Dark veined stone gives depth and a point of calm behind the speaker.",
      },
      {
        label: "Pace",
        text: "Long, unhurried answers. People trust what they are given time to understand.",
      },
    ],
  },
  {
    slug: "rotterdam-in-motion",
    project: "Rotterdam, in Motion",
    eyebrow: "Rotterdam · Cinematic Film",
    standfirst:
      "A voiceover-led film that lets the designer introduce the space, in her own voice.",
    takeaway:
      "A space should be introduced the way a person is: slowly, and in their own voice.",
    thinking: [
      "The film opens close, on a sketchbook, a hand and the soft grain of paper, while Hsiu-Li says her name. There is no wide establishing shot and no sweep of the room. Starting small tells the viewer that what follows was made by someone, with care, and that the space has a point of view behind it.",
      "Neuroaesthetics says the brain reads texture and warmth before it reads layout. Soft focus, warm paper tones and slow movement lower the pace of the whole film, so the viewer arrives at the space calm and curious rather than sold to.",
      "It is cut like a story, not a walkthrough. Each shot is there because it moves the story forward, and the narration carries the thread, which is what keeps a film about a room worth watching to the end.",
    ],
    reads: [
      {
        label: "Voice",
        text: "A human voice up front gives the space an author, and an author is easier to trust than a brochure.",
      },
      {
        label: "Texture",
        text: "Paper, pencil and skin in soft focus. Tactile detail reads as craft.",
      },
      {
        label: "Pace",
        text: "Slow, close shots set a calm rhythm before the room is ever shown.",
      },
    ],
  },
  {
    slug: "bts-content",
    project: "BTS Content",
    eyebrow: "Rotterdam · Photo Series · 6 photos",
    standfirst:
      "The set, the light, the moments between takes: how one Rotterdam shoot came together.",
    takeaway: "Showing how a shoot is made shows how a studio thinks.",
    thinking: [
      "Behind-the-scenes photographs are the most honest thing a studio can publish. These six follow one Rotterdam shoot from the empty chair to the monitor: the set, the light, the camera, and the quiet moments between takes.",
      "For a hotel choosing a partner, process is reassurance. A calm set, a considered frame and a team at ease tell them how the day will feel with us, long before they brief us.",
      "The photographs borrow the interview's own palette: dark stone, warm wood, soft window light. The behind-the-scenes and the final film look like they belong together because they were made in the same light.",
    ],
    reads: [
      {
        label: "Frame",
        text: "Shooting past the equipment puts the viewer behind the camera, as part of the crew.",
      },
      {
        label: "Light",
        text: "Warm daylight from the side, the same as in the film itself.",
      },
      {
        label: "Calm",
        text: "A relaxed sitter and an ordered set. Ease is visible, and it is catching.",
      },
    ],
  },
  {
    slug: "a-morning-slowed-down",
    project: "A Morning, Slowed Down",
    eyebrow: "Studio · Cinematic Film",
    standfirst:
      "A quieter film, paced around light and stillness, with no dialogue at all.",
    takeaway: "Stillness is a luxury, and it can be filmed.",
    thinking: [
      "No dialogue and no explanation: a hand on a leather handle, warm light falling across one curve. The film asks the viewer to slow down, and then rewards them for it.",
      "The neuroaesthetics here is rhythm. Slow, unhurried movement and warm, low-contrast light bring the viewer's own pace down. Smooth, rounded forms feel safe and tactile, and a close frame lets you feel the material instead of only looking at it.",
      "A hotel sells the first slow morning. It is hard to describe in a sentence, so the film simply lets you have one.",
    ],
    reads: [
      {
        label: "Light",
        text: "Warm and low, falling across one curve at a time.",
      },
      {
        label: "Touch",
        text: "Leather, skin, a rounded handle. Close frames let you feel the material.",
      },
      {
        label: "Pace",
        text: "Long, still takes. Nothing demands attention, so attention is given freely.",
      },
    ],
  },
  {
    slug: "a-rotterdam-interior",
    project: "A Rotterdam Interior",
    eyebrow: "Rotterdam · Process · Photo Series · 14 photos",
    standfirst:
      "The decisions behind a finished space, caught while they were still being made.",
    takeaway: "A finished room hides its decisions. This series shows them.",
    thinking: [
      "Most interior photography starts when the work is over. This series begins earlier: a slab of dark stone still wrapped in plastic, a kitchen island with tape still on its edge, a corridor with the light just right and someone checking it.",
      "That is where the quality of a space is really set. Material is chosen against light, edges are chosen against hands, and every sightline is walked before it is built. Neuroaesthetics tells us people sense these decisions even when they cannot name them: a space that has been thought through feels calmer to be in.",
      "For a hotel, it is proof of method. Guests will never see this stage, but owners will recognise it, and trust it.",
    ],
    reads: [
      {
        label: "Material",
        text: "Veined stone, warm wood, brass handles. Natural pattern gives the eye something to explore.",
      },
      {
        label: "Light",
        text: "Warm light from slim fittings turns raw surfaces into somewhere you would want to stay.",
      },
      {
        label: "Order",
        text: "Straight lines, clean sightlines and a clear route through the rooms tell the eye where to go next.",
      },
    ],
  },
  {
    slug: "details-worth-staying-for",
    project: "Details Worth Staying For",
    eyebrow: "Studio · Cinematic Film",
    standfirst: "Where the eye lingers: the small things a wide shot would miss.",
    takeaway: "Comfort is made of small things.",
    thinking: [
      "Rain on the window, a dog asleep on the sill, a candle burning low, someone reading. None of it is a feature. All of it is the reason people stay.",
      "Neuroaesthetics calls this the feeling of refuge: a sheltered place from which you can watch the weather outside. Soft textures, warm points of light and a view you are protected from are among the oldest comfort signals we respond to. The film is built from them.",
      "It carries one line, design felt, not explained, and that is the whole approach. We do not tell a guest a room is comforting. We let them feel it.",
    ],
    reads: [
      {
        label: "Refuge",
        text: "A sheltered seat by a window, with weather outside and warmth inside.",
      },
      {
        label: "Warmth",
        text: "A candle, a lamp, a blanket. Small warm points of light and soft textures signal comfort.",
      },
      {
        label: "Life",
        text: "A dog, a book, a pause. A space with someone living in it feels welcoming.",
      },
    ],
  },
  {
    slug: "everything-is-in-the-details",
    project: "Everything Is in the Details",
    eyebrow: "Studio · Photo Series · 7 photos",
    standfirst:
      "Material, texture, finish: what makes a space feel considered.",
    takeaway: "A space feels considered long before anyone can say why.",
    thinking: [
      "Seven photographs of a designer's working surface: leather and velvet, marble and wood, black gloves, a hand turning over a small monogrammed box, a mood board of woven timber, hand-drawn sketches. Nothing here is a finished room, and everything here is why a finished room works.",
      "Neuroaesthetics tells us that touch and sight are close partners: we judge a surface by how we imagine it would feel. Natural materials, fine finishes and variety in texture are read as care, and care is felt as comfort. That is the difference between a space that looks good and one that feels considered.",
      "These images are also a point of view for a hotel's own content: show the material, and the guest does the rest.",
    ],
    reads: [
      {
        label: "Touch",
        text: "Leather, velvet, stone and timber. Surfaces you want to touch, shown so you can almost feel them.",
      },
      {
        label: "Palette",
        text: "Warm woods, deep greens, a flash of pink and burnt orange. Colour chosen as carefully as material.",
      },
      {
        label: "Craft",
        text: "Sketches, swatches and monograms. Signs of a hand at work.",
      },
    ],
  },
];

// Same order as the Our Work page, which is also the order the "Next" link
// at the bottom of each page follows.
const ORDER = [
  "Rotterdam, in Motion",
  "Paris, by Design",
  "BTS Content",
  "Where to Stay, by Design",
  "The Rotterdam Interview",
  "A Morning, Slowed Down",
  "Fashion Interiors",
  "A Rotterdam Interior",
  "Details Worth Staying For",
  "Everything Is in the Details",
];

export const caseStudies: CaseStudy[] = [...entries].sort(
  (a, b) => ORDER.indexOf(a.project) - ORDER.indexOf(b.project),
);

export function caseStudyFor(project: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.project === project);
}

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
