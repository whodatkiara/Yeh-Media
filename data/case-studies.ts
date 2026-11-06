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

export const caseStudies: CaseStudy[] = [
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
];

export function caseStudyFor(project: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.project === project);
}

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
