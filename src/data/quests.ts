export type QuestCategory = "active" | "chill" | "foodie" | "water" | "climb" | "ride" | "stay" | "nightlife" | "nature";
export type Vibe = "outdoorsy" | "rainy-day" | "date-night" | "with-mates" | "solo" | "sunrise" | "sunset" | "cheap" | "splurge" | "wild";

export interface Quest {
  id: string;
  title: string;
  venue: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  category: QuestCategory;
  image: string;
  emoji: string;
  blurb: string;
  description: string;
  durationMin: number;
  points: number;
  difficulty: 1 | 2 | 3;
  vibes: Vibe[];
  bring?: string[];
  pricePerNight?: number;
  source?: "seed" | "ai";
  address?: string;
  mapsUrl?: string;
  websiteUrl?: string;
  randomness?: number;
}

const img = (q: string) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=900&q=80`;

const PHOTO = {
  miniGolf: "1543599723-d6815c0c5a29",
  darts: "1578662996442-48f60103fc96",
  axe: "1540910419892-4a36d2c3266c",
  pingPong: "1517649763962-0c623066013b",
  pool: "1571721756-e0a95c68a70e",
  view: "1464822759023-fed622ff2c3b",
  wildSwim: "1530541930197-ff16ac917b0e",
  climb: "1522163182402-834f871fd851",
  boulder: "1583512603805-3cc6b41f3edb",
  kayak: "1502780402662-acc01917cb52",
  whiteWater: "1504701954957-2010ec3bcec1",
  forest: "1448375240586-882707db888b",
  rooftop: "1536329832-aafd4f7cd4e3",
  streetArt: "1520275741222-0421c96f6db8",
  historic: "1564507592333-c60657eea523",
  kart: "1581094271901-8022df4466f9",
  roller: "1581349485608-9469926a8e5e",
  surf: "1502680390469-be75c86b636f",
  nature: "1500382017468-9049fed747ef",
  beer: "1559526324-c1f275fbfa32",
  golf: "1535131749006-b7f58c99034b",
  thames: "1502082553048-f009c37129b9",
};

export const ACTIVITY_QUESTS: Quest[] = [
  { id: "q-puttshack-bank", title: "Tee off in neon", venue: "Puttshack Bank", city: "Bank", region: "London", lat: 51.5133, lng: -0.0886, category: "nightlife", emoji: "⛳", websiteUrl: "https://puttshack.com/london/bank/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Puttshack+Bank+London", image: img(PHOTO.miniGolf), blurb: "Tech-infused mini golf with cocktails and a DJ. The vibes are unreal.", description: "Four immersive holes, ball-tracking tech that auto-scores. Book ahead — it fills up. From £14pp.", durationMin: 90, points: 150, difficulty: 1, vibes: ["with-mates","date-night"], bring: ["Competitive spirit"] },
  { id: "q-flight-club-shoreditch", title: "Darts, but make it filthy", venue: "Flight Club Shoreditch", city: "Shoreditch", region: "London", lat: 51.5249, lng: -0.0762, category: "nightlife", emoji: "🎯", websiteUrl: "https://flightclubdarts.com/london/shoreditch/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Flight+Club+Shoreditch", image: img(PHOTO.darts), blurb: "Social darts with enough games to keep it spicy for 4 hours.", description: "Oches (dartboards + sofas), cocktails on tap, and game modes for all skill levels. £12pp for 75 min.", durationMin: 90, points: 140, difficulty: 1, vibes: ["with-mates","date-night"], bring: ["Group of 2–8"] },
  { id: "q-whistle-punks", title: "Throw axes. Win nothing.", venue: "Whistle Punks Vauxhall", city: "Vauxhall", region: "London", lat: 51.4855, lng: -0.1240, category: "active", emoji: "🪓", websiteUrl: "https://whistlepunks.com/london-vauxhall/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Whistle+Punks+Vauxhall", image: img(PHOTO.axe), blurb: "75 minutes of coached axe throwing ending in a tournament.", description: "Full coaching session, then a timed group tournament. £30pp. Scarier than it looks, easier than you think.", durationMin: 75, points: 150, difficulty: 2, vibes: ["with-mates","date-night","rainy-day"] },
  { id: "q-bounce-farringdon", title: "Ping-Pong battle", venue: "Bounce Farringdon", city: "Farringdon", region: "London", lat: 51.5198, lng: -0.1042, category: "nightlife", emoji: "🏓", websiteUrl: "https://bouncepingpong.com/london/farringdon/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bounce+Farringdon+London", image: img(PHOTO.pingPong), blurb: "Beer, pizza, table tennis — and the loser buys the next round.", description: "Book a table for 60–90 min. Paddles included. The bar is genuinely great.", durationMin: 90, points: 110, difficulty: 1, vibes: ["with-mates","date-night"] },
  { id: "q-swingers-city", title: "Crazy golf, city edition", venue: "Swingers The City", city: "City of London", region: "London", lat: 51.5136, lng: -0.0846, category: "nightlife", emoji: "🏌️", websiteUrl: "https://swingersbar.co.uk/city/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Swingers+The+City+London", image: img(PHOTO.miniGolf), blurb: "Street food, cocktail bars and nine holes of inspired crazy golf.", description: "Book 90 min. Street food traders rotate. Cocktails are excellent. From £13pp.", durationMin: 90, points: 130, difficulty: 1, vibes: ["with-mates","date-night"] },
  { id: "q-junkyard-golf", title: "Golf in a scrapyard", venue: "Junkyard Golf Club Shoreditch", city: "Shoreditch", region: "London", lat: 51.5244, lng: -0.0749, category: "nightlife", emoji: "🛸", websiteUrl: "https://junkyardgolfclub.co.uk/london/shoreditch/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Junkyard+Golf+Club+Shoreditch", image: img(PHOTO.miniGolf), blurb: "Chaotic themed mini golf holes with rum bars and neon lighting.", description: "Three 9-hole courses, each with its own rum bar. £9.95pp. No skill required.", durationMin: 75, points: 120, difficulty: 1, vibes: ["with-mates","date-night","wild"] },
  { id: "q-poolhouse", title: "Rack 'em up", venue: "Poolhouse Canary Wharf", city: "Canary Wharf", region: "London", lat: 51.5053, lng: -0.0195, category: "nightlife", emoji: "🎱", websiteUrl: "https://poolhousebar.co.uk/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Poolhouse+Canary+Wharf", image: img(PHOTO.pool), blurb: "Neon-lit pool halls with cocktails — seriously cool aesthetic.", description: "American pool tables, cocktail bar, great soundtrack. From £10/table/hr. Walk-in or book.", durationMin: 90, points: 120, difficulty: 1, vibes: ["with-mates","date-night"] },
  { id: "q-sky-garden", title: "Free rooftop, unreal views", venue: "Sky Garden", city: "City of London", region: "London", lat: 51.5113, lng: -0.0836, category: "chill", emoji: "🌿", websiteUrl: "https://skygarden.london/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sky+Garden+London", image: img(PHOTO.rooftop), blurb: "London's highest public garden. Free to enter if you book ahead.", description: "38th floor tropical garden. Booking opens 3 weeks ahead — slots go in minutes. Pre-drinks are mandatory.", durationMin: 90, points: 120, difficulty: 1, vibes: ["date-night","sunset","with-mates"] },
  { id: "q-parliament-hill", title: "Beat the city to the view", venue: "Parliament Hill Viewpoint", city: "Hampstead", region: "London", lat: 51.5563, lng: -0.1483, category: "nature", emoji: "🌄", websiteUrl: "https://www.cityoflondon.gov.uk/things-to-do/green-spaces/hampstead-heath/parliament-hill", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Parliament+Hill+Hampstead+Heath", image: img(PHOTO.view), blurb: "The best free panoramic view of the London skyline, bar none.", description: "20-min walk from Tufnell Park. Hit it at sunrise or golden hour. Free, always open.", durationMin: 90, points: 160, difficulty: 1, vibes: ["sunrise","sunset","solo","with-mates","outdoorsy"] },
  { id: "q-greenwich-obs", title: "Stand on the meridian", venue: "Royal Observatory Greenwich", city: "Greenwich", region: "London", lat: 51.4769, lng: -0.0005, category: "nature", emoji: "🔭", websiteUrl: "https://www.rmg.co.uk/royal-observatory", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Royal+Observatory+Greenwich", image: img(PHOTO.historic), blurb: "One foot in the east, one in the west. The view of the City is spectacular.", description: "Grounds free, telescope dome ticketed. Best done with a Cutty Sark walk below. Take the DLR to Cutty Sark.", durationMin: 180, points: 170, difficulty: 1, vibes: ["with-mates","date-night","outdoorsy"] },
  { id: "q-leake-street", title: "Walk through a legal tunnel of art", venue: "Leake Street Arches", city: "Waterloo", region: "London", lat: 51.5010, lng: -0.1117, category: "chill", emoji: "🎨", websiteUrl: "https://leakestreetarches.london/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Leake+Street+Arches+Waterloo", image: img(PHOTO.streetArt), blurb: "300m tunnel of legal graffiti under Waterloo station — constantly changing.", description: "Free. Walk through, take photos. Then grab a beer at one of the bars inside the arches.", durationMin: 60, points: 100, difficulty: 1, vibes: ["with-mates","solo","date-night"] },
  { id: "q-hampstead-pond", title: "Wild swim in the city", venue: "Hampstead Heath Men's Pond", city: "Hampstead", region: "London", lat: 51.5685, lng: -0.1609, category: "water", emoji: "🏊", websiteUrl: "https://www.cityoflondon.gov.uk/things-to-do/green-spaces/hampstead-heath/swimming", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hampstead+Heath+Mens+Pond+London", image: img(PHOTO.wildSwim), blurb: "Open-water swimming in the middle of London. Cold, dark, and totally addictive.", description: "Open year-round from 7am. £4.50 entry. Bring a robe, a towel, and bravery. Mixed pond also available.", durationMin: 90, points: 160, difficulty: 2, vibes: ["solo","wild","sunrise","cheap"], bring: ["Towel","Robe","Flask"] },
  { id: "q-arch-climbing", title: "Send the roof route", venue: "The Arch Climbing Wall Bermondsey", city: "Bermondsey", region: "London", lat: 51.4980, lng: -0.0710, category: "climb", emoji: "🧗", websiteUrl: "https://archclimbing.com/bermondsey/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Arch+Climbing+Wall+Bermondsey", image: img(PHOTO.climb), blurb: "Three floors of lead and top-rope routes in a converted railway arch.", description: "Day pass £16.50. Shoe hire £4. Beginners absolutely welcome. A proper climbing community.", durationMin: 120, points: 200, difficulty: 3, vibes: ["with-mates","rainy-day","solo"], bring: ["Climbing shoes (or rent)","Chalk bag"] },
  { id: "q-yonder-walthamstow", title: "Boulder, sauna, beer", venue: "Yonder Walthamstow", city: "Walthamstow", region: "London", lat: 51.5847, lng: -0.0210, category: "climb", emoji: "🪨", websiteUrl: "https://yonderclimbing.com/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Yonder+Walthamstow", image: img(PHOTO.boulder), blurb: "Bouldering centre with a rooftop sauna, yoga, and a craft beer bar.", description: "Day pass £18, sauna £10. The combination of climbing + sauna + bar is actually unbeatable.", durationMin: 180, points: 200, difficulty: 2, vibes: ["with-mates","rainy-day","splurge","date-night"] },
  { id: "q-moo-canoes", title: "Paddle past Camden", venue: "Moo Canoes", city: "Islington", region: "London", lat: 51.5345, lng: -0.0967, category: "water", emoji: "🛶", websiteUrl: "https://moocanoes.com/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Moo+Canoes+Regents+Canal+London", image: img(PHOTO.kayak), blurb: "Self-hire kayaks on Regent's Canal. Surprisingly calm. Weirdly restorative.", description: "2-hour self-hire from £22pp. Paddle from Angel past Camden Lock. No experience needed.", durationMin: 120, points: 160, difficulty: 1, vibes: ["with-mates","outdoorsy","date-night"], bring: ["Layers","Waterproof jacket"] },
  { id: "q-lee-valley-white-water", title: "Shoot the rapids", venue: "Lee Valley White Water Centre", city: "Waltham Cross", region: "Hertfordshire", lat: 51.7027, lng: -0.0232, category: "water", emoji: "🌊", websiteUrl: "https://visitleevalley.org.uk/lee-valley-white-water-centre/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lee+Valley+White+Water+Centre", image: img(PHOTO.whiteWater), blurb: "Olympic white water course from 2012 — open to the public on rafts.", description: "Group rafting from £40pp on the course built for the London Olympics. Weekends book up fast.", durationMin: 120, points: 250, difficulty: 3, vibes: ["with-mates","wild","outdoorsy"], bring: ["Swimsuit","Towel"] },
  { id: "q-go-ape-battersea", title: "Ape through the treetops", venue: "Go Ape Battersea Park", city: "Battersea", region: "London", lat: 51.4781, lng: -0.1568, category: "active", emoji: "🐒", websiteUrl: "https://goape.co.uk/locations/battersea-park", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Go+Ape+Battersea+Park", image: img(PHOTO.forest), blurb: "Zip lines and rope courses through the canopy of Battersea Park.", description: "Treetop Adventure from £33 per adult. 2 hrs of zip wires, Tarzan swings, wobble boards.", durationMin: 120, points: 200, difficulty: 2, vibes: ["with-mates","outdoorsy","wild"], bring: ["Closed-toe shoes","Layers"] },
  { id: "q-box-hill", title: "Conquer the Weald", venue: "Box Hill Viewpoint", city: "Dorking", region: "Surrey", lat: 51.2519, lng: -0.3098, category: "nature", emoji: "🌄", websiteUrl: "https://www.nationaltrust.org.uk/visit/surrey/box-hill", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Box+Hill+Viewpoint+Dorking", image: img(PHOTO.view), blurb: "25-min uphill from the car park for one of the best views in southern England.", description: "Free (parking £4). Walk from Box Hill & Westhumble station. Bring coffee. Tour de France came through here in 2007.", durationMin: 120, points: 170, difficulty: 2, vibes: ["outdoorsy","sunrise","solo","with-mates"], bring: ["Good shoes","Flask"] },
  { id: "q-teamsport-bermondsey", title: "Race your mates", venue: "TeamSport Indoor Karting London Bridge", city: "Bermondsey", region: "London", lat: 51.5012, lng: -0.0731, category: "active", emoji: "🏎️", websiteUrl: "https://team-sport.co.uk/locations/london-bridge/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=TeamSport+Indoor+Karting+London+Bridge", image: img(PHOTO.kart), blurb: "Multi-level indoor karting under the arches. You will lose your voice yelling.", description: "30-min Open Grand Prix from £40pp. Book online. Helmets and overalls provided. Take it seriously.", durationMin: 90, points: 180, difficulty: 1, vibes: ["with-mates","rainy-day"] },
  { id: "q-castle-climbing", title: "400 routes, Victorian walls", venue: "The Castle Climbing Centre", city: "Stoke Newington", region: "London", lat: 51.5614, lng: -0.0796, category: "climb", emoji: "🏰", websiteUrl: "https://www.castle-climbing.co.uk/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Castle+Climbing+Centre+Stoke+Newington", image: img(PHOTO.climb), blurb: "A Victorian pumping station converted into one of London's best climbing centres.", description: "450 routes across bouldering and roped. £15 walk-in. Vegan café on site. Stunning building.", durationMin: 120, points: 200, difficulty: 3, vibes: ["with-mates","rainy-day","solo"], bring: ["Shoes (or rent £5)"] },
  { id: "q-bermondsey-beer-mile", title: "Eight breweries, one street", venue: "Bermondsey Beer Mile", city: "Bermondsey", region: "London", lat: 51.4945, lng: -0.0660, category: "foodie", emoji: "🍺", websiteUrl: "https://bermondseybeermile.co.uk/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bermondsey+Beer+Mile+London", image: img(PHOTO.beer), blurb: "Eight world-class breweries in a row under the same railway arches. Saturday only.", description: "Start at Anspach & Hobday, end at Fourpure. Each does small tasters. Open Saturdays 11am–5pm only.", durationMin: 240, points: 220, difficulty: 1, vibes: ["with-mates","splurge","outdoorsy"], bring: ["Cash","Snacks"] },
  { id: "q-flippers-roller", title: "Skate like it's 1978", venue: "Flippers Roller Boogie Palace", city: "Olympia", region: "London", lat: 51.4960, lng: -0.2120, category: "nightlife", emoji: "🛼", websiteUrl: "https://www.flippersrollerboogie.com/", mapsUrl: "https://www.google.com/maps/search/?api=1&query=Flippers+Roller+Boogie+Palace+Olympia+London", image: img(PHOTO.roller), blurb: "London's only roller disco. Disco lights, funk music, skates included.", description: "Adults-only sessions Friday and Saturday nights from 8pm. £18.50 including skate hire. Bring your best move.", durationMin: 90, points: 150, difficulty: 2, vibes: ["with-mates","date-night"] },
];

export const STAY_QUESTS: Quest[] = [];

export const ALL_QUESTS: Quest[] = [...ACTIVITY_QUESTS, ...STAY_QUESTS];
