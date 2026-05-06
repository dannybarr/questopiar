export type MissionVisibility = "open" | "approval";
export type MissionCategory =
  | "pub"
  | "run"
  | "activity-bar"
  | "bbq"
  | "swim"
  | "ride"
  | "food"
  | "nightlife"
  | "outdoors";

export interface MissionOwner {
  id: string;
  name: string;
  avatar: string;
}
export interface MissionAttendee {
  id: string;
  name: string;
  avatar: string;
  status: "going" | "pending";
}

export interface Mission {
  id: string;
  title: string;
  emoji: string;
  category: MissionCategory;
  cover: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  venue: string;
  address?: string;
  when: string;
  whenISO: string;
  visibility: MissionVisibility;
  capacity: number;
  owner: MissionOwner;
  attendees: MissionAttendee[];
  vibe: string;
  thePlan: string;
  bring?: string[];
  costPP?: string;
}

const img = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=900&q=80&sig=${seed}`;

const mkAtt = (avatars: string[], names: string[]): MissionAttendee[] =>
  avatars.map((a, i) => ({ id: `a-${i}-${a}`, name: names[i] ?? "Friend", avatar: a, status: "going" }));

export const MOCK_MISSIONS: Mission[] = [
  {
    id: "m-soho-speakeasy",
    title: "Hidden Pub Hunt — Soho speakeasies",
    emoji: "🍻",
    category: "pub",
    cover: img("1514933651103-005eec06c04b", 101),
    city: "Soho",
    region: "London",
    lat: 51.5136,
    lng: -0.1365,
    venue: "Bar Termini",
    address: "7 Old Compton St, London W1D 5JE",
    when: "Fri 8pm",
    whenISO: "2026-05-08T20:00:00",
    visibility: "approval",
    capacity: 6,
    owner: { id: "u-mara", name: "Mara", avatar: "🦊" },
    attendees: mkAtt(["🦊", "🐉", "🐯"], ["Mara", "Theo", "Priya"]),
    vibe: "Three hidden bars, one passcode each",
    thePlan:
      "Meet at Bar Termini for a negroni sbagliato. From there we hop to Swift (downstairs only) and finish at Discount Suit Co. Dress smart-ish. Cash for tips.",
    bring: ["ID", "Cash for tips"],
    costPP: "£35pp",
  },
  {
    id: "m-hackney-run",
    title: "Sunday Slow Run Club — Hackney Marshes",
    emoji: "🏃",
    category: "run",
    cover: img("1552674605-db6ffd4facb5", 102),
    city: "Hackney",
    region: "London",
    lat: 51.5559,
    lng: -0.0379,
    venue: "Hackney Marshes car park",
    when: "Sun 9am",
    whenISO: "2026-05-10T09:00:00",
    visibility: "open",
    capacity: 15,
    owner: { id: "u-jules", name: "Jules", avatar: "🦉" },
    attendees: mkAtt(["🦉", "🐻", "🦄", "🐙", "🐯"], ["Jules", "Sam", "Maya", "Ola", "Priya"]),
    vibe: "5k chat-pace then coffee. No-one left behind.",
    thePlan:
      "Meet by the car park café at 9. We loop the marshes (5k, flat) at conversational pace, then pile into Pavilion for coffee + pastries. All paces welcome.",
    bring: ["Trainers", "A fiver for coffee"],
    costPP: "Free",
  },
  {
    id: "m-bounce-pingpong",
    title: "Bounce Ping-Pong Takeover",
    emoji: "🏓",
    category: "activity-bar",
    cover: img("1517649763962-0c623066013b", 103),
    city: "Shoreditch",
    region: "London",
    lat: 51.5256,
    lng: -0.0876,
    venue: "Bounce Old Street",
    when: "Thu 7pm",
    whenISO: "2026-05-07T19:00:00",
    visibility: "open",
    capacity: 8,
    owner: { id: "u-theo", name: "Theo", avatar: "🦊" },
    attendees: mkAtt(["🦊", "🐯", "🐙"], ["Theo", "Priya", "Ola"]),
    vibe: "Pizza, cocktails, ping-pong. Loser buys.",
    thePlan:
      "Booked a table for an hour. Round-robin format then doubles. Pizzas after on the mezzanine. Loser of the final settles the drinks tab.",
    costPP: "£15pp",
  },
  {
    id: "m-london-fields-bbq",
    title: "Park BBQ — London Fields golden hour",
    emoji: "🔥",
    category: "bbq",
    cover: img("1529543544282-ea669407fca3", 104),
    city: "Hackney",
    region: "London",
    lat: 51.5414,
    lng: -0.0606,
    venue: "London Fields BBQ area",
    when: "Sat 5pm",
    whenISO: "2026-05-09T17:00:00",
    visibility: "open",
    capacity: 20,
    owner: { id: "u-sam", name: "Sam", avatar: "🐻" },
    attendees: mkAtt(["🐻", "🦄", "🦊", "🐉", "🐙", "🦉"], ["Sam", "Maya", "Theo", "Kai", "Ola", "Jules"]),
    vibe: "Bring a thing to grill, leave with new mates",
    thePlan:
      "We grab the pit by the playground from 5. Bring something to grill + something to share. Speaker on, sun going down, fire up till 9-ish.",
    bring: ["Something to grill", "Drinks", "A blanket"],
    costPP: "£10pp",
  },
  {
    id: "m-vauxhall-axe",
    title: "Axe-throwing & wings",
    emoji: "🪓",
    category: "activity-bar",
    cover: img("1540910419892-4a36d2c3266c", 105),
    city: "Vauxhall",
    region: "London",
    lat: 51.4855,
    lng: -0.124,
    venue: "Whistle Punks Vauxhall",
    when: "Sat 7pm",
    whenISO: "2026-05-09T19:00:00",
    visibility: "approval",
    capacity: 6,
    owner: { id: "u-kai", name: "Kai", avatar: "🐉" },
    attendees: mkAtt(["🐉", "🐯"], ["Kai", "Priya"]),
    vibe: "75-min coached session then wings at Smokestak",
    thePlan:
      "Coached throwing session 7–8:15. Walk to Smokestak after for wings + pickleback shots. Capped at 6 to keep the lanes moving.",
    costPP: "£40pp",
  },
  {
    id: "m-whitstable-dip",
    title: "Whitstable cold dip + chips",
    emoji: "🌊",
    category: "swim",
    cover: img("1507525428034-b723cf961d3e", 106),
    city: "Whitstable",
    region: "Kent",
    lat: 51.3623,
    lng: 1.0264,
    venue: "West Beach",
    when: "Sat 11am",
    whenISO: "2026-05-09T11:00:00",
    visibility: "open",
    capacity: 12,
    owner: { id: "u-zara", name: "Zara", avatar: "🦉" },
    attendees: mkAtt(["🦉", "🐻", "🦊", "🦄"], ["Zara", "Sam", "Mara", "Maya"]),
    vibe: "Bracing dip, then VC Jones chips",
    thePlan:
      "Meet at the West Beach groynes 11am. 10-min dip (channel is ~10°C), towel-off and walk to VC Jones for the best fish & chips on the coast.",
    bring: ["Towel", "Robe", "Cash for chips"],
    costPP: "Free",
  },
  {
    id: "m-richmond-dawn",
    title: "Richmond Park dawn loop",
    emoji: "🚴",
    category: "ride",
    cover: img("1517649763962-0c623066013b", 107),
    city: "Richmond",
    region: "London",
    lat: 51.4426,
    lng: -0.2735,
    venue: "Roehampton Gate",
    when: "Sun 6am",
    whenISO: "2026-05-10T06:00:00",
    visibility: "open",
    capacity: 10,
    owner: { id: "u-ella", name: "Ella", avatar: "🦄" },
    attendees: mkAtt(["🦄", "🦊", "🐙"], ["Ella", "Theo", "Ola"]),
    vibe: "Two laps, deer everywhere, café after",
    thePlan:
      "Roll out from Roehampton Gate at 6. Two clockwise laps of the Tamsin Trail (~14 mi). Coffee + pastries at Roehampton Café from 7:30.",
    bring: ["Bike", "Lights", "Layers"],
    costPP: "Free",
  },
  {
    id: "m-castle-climb",
    title: "Castle climbing crew night",
    emoji: "🧗",
    category: "outdoors",
    cover: img("1522163182402-834f871fd851", 108),
    city: "Stoke Newington",
    region: "London",
    lat: 51.5614,
    lng: -0.0796,
    venue: "The Castle Climbing Centre",
    when: "Tue 7pm",
    whenISO: "2026-05-12T19:00:00",
    visibility: "open",
    capacity: 8,
    owner: { id: "u-rafe", name: "Rafe", avatar: "🐯" },
    attendees: mkAtt(["🐯", "🦊", "🐉"], ["Rafe", "Mara", "Kai"]),
    vibe: "Bouldering session + vegan brownie",
    thePlan:
      "Meet in the café 6:50. Two hours on the bouldering walls — beginners welcome, we'll spot routes. Brownies + tea after, mandatory.",
    bring: ["Climbing shoes (or rent £4)"],
    costPP: "£15pp",
  },
  {
    id: "m-flippers-disco",
    title: "Flippers Roller Disco crew night",
    emoji: "🛼",
    category: "nightlife",
    cover: img("1581349485608-9469926a8e5e", 109),
    city: "Olympia",
    region: "London",
    lat: 51.496,
    lng: -0.212,
    venue: "Flippers Roller Boogie Palace",
    when: "Fri 9pm",
    whenISO: "2026-05-08T21:00:00",
    visibility: "approval",
    capacity: 10,
    owner: { id: "u-mara", name: "Mara", avatar: "🦊" },
    attendees: mkAtt(["🦊", "🦄", "🐉", "🐙"], ["Mara", "Maya", "Kai", "Ola"]),
    vibe: "Disco lights, funk, 90 min on wheels",
    thePlan:
      "Adults-only session 9–10:30. Skates included. Pre-drinks at Hand & Flower from 8. First-timers get a free 10-min lesson.",
    bring: ["Socks"],
    costPP: "£18.50pp",
  },
  {
    id: "m-margate-wander",
    title: "Margate Old Town → Dreamland",
    emoji: "🎡",
    category: "outdoors",
    cover: img("1502301103665-0b95cc738daf", 110),
    city: "Margate",
    region: "Kent",
    lat: 51.3858,
    lng: 1.3865,
    venue: "Margate Station",
    when: "Sat 12pm",
    whenISO: "2026-05-09T12:00:00",
    visibility: "open",
    capacity: 12,
    owner: { id: "u-priya", name: "Priya", avatar: "🐯" },
    attendees: mkAtt(["🐯", "🦄", "🦉"], ["Priya", "Maya", "Zara"]),
    vibe: "Vintage shops, Melt ice cream, Turner sunset",
    thePlan:
      "Train from St Pancras to Margate (90 min). Vintage shop crawl through Old Town, ice cream from Melt, Dreamland rides 4–6, Turner sunset on the harbour arm.",
    costPP: "~£40pp",
  },
  {
    id: "m-bermondsey-5aside",
    title: "Powerleague 5-a-side pickup",
    emoji: "⚽",
    category: "outdoors",
    cover: img("1551958219-acbc608c6377", 111),
    city: "Bermondsey",
    region: "London",
    lat: 51.4945,
    lng: -0.066,
    venue: "Powerleague Shoreditch",
    when: "Wed 8pm",
    whenISO: "2026-05-13T20:00:00",
    visibility: "approval",
    capacity: 10,
    owner: { id: "u-sam", name: "Sam", avatar: "🐻" },
    attendees: mkAtt(["🐻", "🦊", "🐉", "🐯", "🐙"], ["Sam", "Theo", "Kai", "Rafe", "Ola"]),
    vibe: "Mixed-ability kickabout, pints after",
    thePlan:
      "Booked a 3G pitch 8–9. Bibs provided. We split teams on arrival, rolling subs. Pints at Old Justice from 9:15.",
    bring: ["Astros", "Shin pads"],
    costPP: "£8pp",
  },
  {
    id: "m-brockley-market",
    title: "Brockley Market crawl",
    emoji: "🍕",
    category: "food",
    cover: img("1414235077428-338989a2e8c0", 112),
    city: "Lewisham",
    region: "London",
    lat: 51.4636,
    lng: -0.0359,
    venue: "Brockley Market",
    when: "Sat 11am",
    whenISO: "2026-05-09T11:00:00",
    visibility: "open",
    capacity: 15,
    owner: { id: "u-ola", name: "Ola", avatar: "🐙" },
    attendees: mkAtt(["🐙", "🦊", "🦄", "🐻"], ["Ola", "Mara", "Maya", "Sam"]),
    vibe: "Eat your way through six stalls",
    thePlan:
      "Meet at the entrance 11. We'll hit Mike & Ollie flatbreads, Wilde Pies, Mother Flipper, plus a coffee from Volcano. Walk to Hilly Fields after to digest in the sun.",
    costPP: "~£20pp",
  },
];
