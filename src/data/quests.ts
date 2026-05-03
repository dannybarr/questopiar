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
}

const img = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=900&q=80&sig=${seed}`;

export const ACTIVITY_QUESTS: Quest[] = [
  { id: "q-padel-canterbury", title: "Padel Smash", venue: "Padel Hub Canterbury", city: "Canterbury", region: "Kent", lat: 51.2802, lng: 1.0789, category: "active", emoji: "🎾",
    image: img("1554068865-24cecd4e34b8", 1), blurb: "Two courts. Two friends. One absolute scrap.", description: "Book an hour at Kent's premier padel club. Loud, sweaty, ridiculous. First-timers welcome — rackets are free.", durationMin: 60, points: 120, difficulty: 2, vibes: ["with-mates", "cheap"], bring: ["Trainers", "Water"] },
  { id: "q-castle-climb", title: "Send It at The Castle", venue: "The Castle Climbing Centre", city: "Stoke Newington", region: "London", lat: 51.5614, lng: -0.0796, category: "climb", emoji: "🧗",
    image: img("1522163182402-834f871fd851", 2), blurb: "A converted Victorian water pumping station. Now: 450 routes.", description: "Tall walls, lead routes, a bouldering pit and a vegan café. Pay-and-climb for £15.", durationMin: 120, points: 200, difficulty: 3, vibes: ["with-mates", "rainy-day"], bring: ["Climbing shoes (or rent)"] },
  { id: "q-boxhill", title: "Sunrise on Box Hill", venue: "Box Hill Viewpoint", city: "Dorking", region: "Surrey", lat: 51.2519, lng: -0.3098, category: "nature", emoji: "🌄",
    image: img("1464822759023-fed622ff2c3b", 3), blurb: "Beat the sun up. Brag for the rest of the week.", description: "A 25-min uphill walk from the car park gets you a view across the Weald. Bring coffee.", durationMin: 90, points: 180, difficulty: 2, vibes: ["sunrise", "outdoorsy", "solo"], bring: ["Headtorch", "Flask"] },
  { id: "q-whitstable", title: "Sea Swim & Chips", venue: "Whitstable Beach", city: "Whitstable", region: "Kent", lat: 51.3623, lng: 1.0264, category: "water", emoji: "🌊",
    image: img("1507525428034-b723cf961d3e", 4), blurb: "Brave the channel. Reward yourself with VC Jones.", description: "A bracing dip at West Beach, then queue at VC Jones for the best fish & chips on the Kent coast.", durationMin: 180, points: 220, difficulty: 2, vibes: ["with-mates", "outdoorsy"], bring: ["Towel", "Cash for chips"] },
  { id: "q-richmond-loop", title: "Richmond Park Loop", venue: "Richmond Park", city: "Richmond", region: "London", lat: 51.4426, lng: -0.2735, category: "ride", emoji: "🚴",
    image: img("1517649763962-0c623066013b", 5), blurb: "7-mile loop. Deer guaranteed.", description: "Hire a bike at Roehampton Gate, ride the Tamsin Trail. Watch for the rutting stags in autumn.", durationMin: 75, points: 150, difficulty: 2, vibes: ["outdoorsy", "with-mates"] },
  { id: "q-princes-golf", title: "9 Holes by the Sea", venue: "Princes Golf Club", city: "Sandwich", region: "Kent", lat: 51.2818, lng: 1.4052, category: "active", emoji: "⛳",
    image: img("1535131749006-b7f58c99034b", 6), blurb: "Links golf with the sea breeze in your face.", description: "An Open Championship venue. Walk-on twilight rates from £45 for nine.", durationMin: 150, points: 180, difficulty: 2, vibes: ["with-mates", "splurge"] },
  { id: "q-yonder", title: "Bouldering at Yonder", venue: "Yonder Walthamstow", city: "Walthamstow", region: "London", lat: 51.5847, lng: -0.0210, category: "climb", emoji: "🪨",
    image: img("1583512603805-3cc6b41f3edb", 7), blurb: "Boulder, yoga, sauna, beer. Yes, all of it.", description: "Indoor bouldering with a rooftop bar. Day pass £18, sauna £10.", durationMin: 120, points: 170, difficulty: 2, vibes: ["with-mates", "rainy-day"] },
  { id: "q-regents-kayak", title: "Kayak the Canal", venue: "Regent's Canal", city: "Islington", region: "London", lat: 51.5345, lng: -0.0967, category: "water", emoji: "🛶",
    image: img("1502780402662-acc01917cb52", 8), blurb: "Paddle past Camden, wave at the houseboats.", description: "Hire a kayak from Moo Canoes. 2 hours of weirdly peaceful inner-city paddling.", durationMin: 120, points: 160, difficulty: 2, vibes: ["with-mates", "outdoorsy"] },
  { id: "q-hampstead-ponds", title: "Wild Swim, Hampstead", venue: "Kenwood Ladies'/Mens' Pond", city: "Hampstead", region: "London", lat: 51.5685, lng: -0.1648, category: "water", emoji: "🏊",
    image: img("1530541930197-ff16ac917b0e", 9), blurb: "London's worst-kept secret. Cold, dark, brilliant.", description: "Open year-round. £4.50 entry. Bring a robe and a flask of tea.", durationMin: 90, points: 140, difficulty: 2, vibes: ["wild", "solo", "sunrise"] },
  { id: "q-teamsport", title: "Karts at Tower Bridge", venue: "TeamSport Tower Bridge", city: "Bermondsey", region: "London", lat: 51.5012, lng: -0.0731, category: "active", emoji: "🏎️",
    image: img("1581094271901-8022df4466f9", 10), blurb: "Multi-level indoor karting under the arches.", description: "30-minute Open Grand Prix. £40pp, helmets included. You will yell.", durationMin: 60, points: 160, difficulty: 1, vibes: ["with-mates", "rainy-day"] },
  { id: "q-whistle-punks", title: "Axe Throwing", venue: "Whistle Punks Vauxhall", city: "Vauxhall", region: "London", lat: 51.4855, lng: -0.1240, category: "active", emoji: "🪓",
    image: img("1540910419892-4a36d2c3266c", 11), blurb: "Throw axes at wood. Discover a new hobby.", description: "75-min sessions, fully coached. Includes a tournament. £30pp.", durationMin: 75, points: 150, difficulty: 1, vibes: ["with-mates", "rainy-day", "date-night"] },
  { id: "q-flippers", title: "Roller Disco", venue: "Flippers Roller Boogie Palace", city: "Olympia", region: "London", lat: 51.4960, lng: -0.2120, category: "nightlife", emoji: "🛼",
    image: img("1581349485608-9469926a8e5e", 12), blurb: "Disco lights. Funk soundtrack. You on wheels.", description: "Skates included. Adults-only sessions Friday nights. £18.50.", durationMin: 90, points: 140, difficulty: 1, vibes: ["with-mates", "date-night"] },
  { id: "q-thames-run", title: "Sunset Thames Run", venue: "Thames Path (Tower → Greenwich)", city: "London", region: "London", lat: 51.5074, lng: -0.0252, category: "active", emoji: "🌇",
    image: img("1502082553048-f009c37129b9", 13), blurb: "5k along the river. Cider at the Trafalgar Tavern.", description: "Start at Tower Bridge as the sun drops. Easy pace, big views.", durationMin: 60, points: 130, difficulty: 1, vibes: ["sunset", "solo"] },
  { id: "q-epping", title: "Foraging Walk", venue: "Epping Forest", city: "Loughton", region: "Essex", lat: 51.6655, lng: 0.0301, category: "nature", emoji: "🍄",
    image: img("1448375240586-882707db888b", 14), blurb: "Find dinner under a tree. Don't poison yourself.", description: "Guided 3-hour foraging walk with a mycologist. Mushrooms, wild garlic, sloes.", durationMin: 180, points: 200, difficulty: 2, vibes: ["outdoorsy", "wild"] },
  { id: "q-bounce", title: "Ping-Pong Battle", venue: "Bounce Old Street", city: "Shoreditch", region: "London", lat: 51.5256, lng: -0.0876, category: "nightlife", emoji: "🏓",
    image: img("1517649763962-0c623066013b", 15), blurb: "Pizza, cocktails, table tennis. Repeat.", description: "Book a table for an hour. Loser buys the drinks.", durationMin: 90, points: 110, difficulty: 1, vibes: ["with-mates", "date-night"] },
  { id: "q-bay66", title: "Skate Bay Sixty6", venue: "Bay Sixty6 Skate Park", city: "Ladbroke Grove", region: "London", lat: 51.5208, lng: -0.2114, category: "active", emoji: "🛹",
    image: img("1520975916090-3105956dac38", 16), blurb: "Indoor park under the Westway. Bowls and a vert ramp.", description: "Day pass £8. Beginner sessions Tuesday nights.", durationMin: 90, points: 130, difficulty: 2, vibes: ["solo", "rainy-day"] },
  { id: "q-bermondsey", title: "Beer Mile Crawl", venue: "Bermondsey Beer Mile", city: "Bermondsey", region: "London", lat: 51.4945, lng: -0.0660, category: "foodie", emoji: "🍺",
    image: img("1559526324-c1f275fbfa32", 17), blurb: "Eight breweries. One railway arch after another.", description: "Saturday-only crawl from Anspach & Hobday to Fourpure. Pace yourself.", durationMin: 240, points: 220, difficulty: 1, vibes: ["with-mates", "splurge"] },
  { id: "q-stargaze", title: "Stargaze the Downs", venue: "South Downs Dark Sky Reserve", city: "Petersfield", region: "Hampshire", lat: 50.9970, lng: -0.9410, category: "nature", emoji: "✨",
    image: img("1419242902214-272b3f66ee7a", 18), blurb: "One of England's only true dark sky reserves.", description: "Drive out, lay on a blanket, count satellites. New moon nights are best.", durationMin: 180, points: 240, difficulty: 1, vibes: ["date-night", "wild"] },
  { id: "q-leeds-castle", title: "Leeds Castle Picnic", venue: "Leeds Castle", city: "Maidstone", region: "Kent", lat: 51.2487, lng: 0.6308, category: "chill", emoji: "🏰",
    image: img("1564507592333-c60657eea523", 19), blurb: "A castle on a lake. Bring a baguette.", description: "Walk the grounds, do the maze, picnic by the moat. £30.50 entry.", durationMin: 240, points: 180, difficulty: 1, vibes: ["date-night", "with-mates"] },
  { id: "q-margate", title: "Margate Old Town Wander", venue: "Margate Old Town", city: "Margate", region: "Kent", lat: 51.3858, lng: 1.3865, category: "chill", emoji: "🎡",
    image: img("1502301103665-0b95cc738daf", 20), blurb: "Vintage shops, Dreamland, ice cream from Melt.", description: "Train from St Pancras takes 90 mins. Stay till the Turner sunset.", durationMin: 360, points: 200, difficulty: 1, vibes: ["sunset", "date-night"] },
  { id: "q-dover-cliffs", title: "White Cliffs Walk", venue: "Langdon Cliffs", city: "Dover", region: "Kent", lat: 51.1320, lng: 1.3450, category: "nature", emoji: "🌬️",
    image: img("1500382017468-9049fed747ef", 21), blurb: "Five miles along the most famous cliffs in England.", description: "Easy clifftop walk to South Foreland Lighthouse. Tea at the kiosk.", durationMin: 180, points: 170, difficulty: 2, vibes: ["outdoorsy", "with-mates"] },
  { id: "q-broadstairs-surf", title: "Surf Joss Bay", venue: "Joss Bay Surf School", city: "Broadstairs", region: "Kent", lat: 51.3784, lng: 1.4458, category: "water", emoji: "🏄",
    image: img("1502680390469-be75c86b636f", 22), blurb: "Yes, you can surf in Kent. Yes, it's good.", description: "2-hour beginner lesson, board + wetsuit included. £40.", durationMin: 120, points: 200, difficulty: 2, vibes: ["with-mates", "wild"] },
];

export const STAY_QUESTS: Quest[] = [
  { id: "s-hoots", title: "Treehouse Sleepover", venue: "Hoots Cabin", city: "Forest of Dean", region: "Gloucestershire", lat: 51.7894, lng: -2.5970, category: "stay", emoji: "🌳",
    image: img("1518780664697-55e3ad937233", 30), blurb: "Off-grid treehouse with a wood stove and a bath in the trees.", description: "Sleeps 2. Outdoor copper bath, log burner, no wifi (on purpose).", durationMin: 1440, points: 400, difficulty: 1, vibes: ["date-night", "wild"], pricePerNight: 245 },
  { id: "s-houseboat", title: "Houseboat on Regent's", venue: "Lily — A Bespoke Boat", city: "Hackney", region: "London", lat: 51.5450, lng: -0.0530, category: "stay", emoji: "⛵",
    image: img("1500530855697-b586d89ba3ee", 31), blurb: "Wake up moored next to Broadway Market.", description: "Restored 60ft narrowboat. Roof terrace, full kitchen, gentle rocking.", durationMin: 1440, points: 350, difficulty: 1, vibes: ["date-night", "splurge"], pricePerNight: 180 },
  { id: "s-elmley", title: "Shepherd's Hut at Elmley", venue: "Elmley Nature Reserve", city: "Isle of Sheppey", region: "Kent", lat: 51.3617, lng: 0.7708, category: "stay", emoji: "🐑",
    image: img("1469474968028-56623f02e42e", 32), blurb: "Birdsong alarm clock. Marshland for miles.", description: "Hand-built shepherd's hut on a working nature reserve. Stargazing windows.", durationMin: 1440, points: 380, difficulty: 1, vibes: ["wild", "date-night"], pricePerNight: 220 },
  { id: "s-dome", title: "Geodesic Dome", venue: "Brook House Woods", city: "Bromyard", region: "Herefordshire", lat: 52.1850, lng: -2.5070, category: "stay", emoji: "🔮",
    image: img("1488972685288-c3fd157d7c7a", 33), blurb: "Stargaze through a clear roof.", description: "Heated dome, double bed, fire pit, woodland surround.", durationMin: 1440, points: 360, difficulty: 1, vibes: ["date-night", "wild"], pricePerNight: 165 },
  { id: "s-lighthouse", title: "Lighthouse Keeper's Cottage", venue: "Lizard Lighthouse", city: "Lizard", region: "Cornwall", lat: 49.9595, lng: -5.2030, category: "stay", emoji: "🗼",
    image: img("1502602898657-3e91760cbb34", 34), blurb: "Sleep at the southernmost point of mainland Britain.", description: "National Trust cottage attached to the working lighthouse. Cliffs out the window.", durationMin: 1440, points: 420, difficulty: 1, vibes: ["wild", "splurge"], pricePerNight: 195 },
  { id: "s-railway", title: "Railway Carriage", venue: "Coppleridge Sidings", city: "Robin Hood's Bay", region: "North Yorkshire", lat: 54.4326, lng: -0.5350, category: "stay", emoji: "🚃",
    image: img("1473773508845-188df298d2d1", 35), blurb: "1950s carriage on a clifftop above the bay.", description: "Sleeps 4. Wood burner, kitchenette, sea views, occasional steam train wave.", durationMin: 1440, points: 370, difficulty: 1, vibes: ["with-mates", "wild"], pricePerNight: 155 },
  { id: "s-snowdonia", title: "Off-Grid Cabin", venue: "Eryri Hideaway", city: "Beddgelert", region: "Snowdonia", lat: 53.0103, lng: -4.1031, category: "stay", emoji: "🏕️",
    image: img("1449158743715-0a90ebb6d2d8", 36), blurb: "No wifi. No road. A river. A wood stove.", description: "1km hike-in. Composting loo, river-cooled fridge, stars guaranteed.", durationMin: 1440, points: 440, difficulty: 2, vibes: ["wild", "solo"], pricePerNight: 130 },
  { id: "s-yurt", title: "Yurt at Loose Reins", venue: "Loose Reins Ranch", city: "Blandford Forum", region: "Dorset", lat: 50.8598, lng: -2.1660, category: "stay", emoji: "🤠",
    image: img("1517824806704-9040b037703b", 37), blurb: "American west, in the West Country.", description: "Lodges and yurts on a horse ranch. Includes hot tub and breakfast hampers.", durationMin: 1440, points: 380, difficulty: 1, vibes: ["with-mates", "splurge"], pricePerNight: 215 },
  { id: "s-loch", title: "Float Pod on Loch Lomond", venue: "Loch Lomond Waterfront", city: "Balmaha", region: "Scotland", lat: 56.0656, lng: -4.5510, category: "stay", emoji: "💧",
    image: img("1500382017468-9049fed747ef", 38), blurb: "Glass-fronted pod that floats on the loch.", description: "Wake to mist on the water. 2 people, kitchenette, BBQ on the deck.", durationMin: 1440, points: 460, difficulty: 1, vibes: ["wild", "date-night", "splurge"], pricePerNight: 275 },
  { id: "s-cellar", title: "Cellar Suite", venue: "The Beckford Arms", city: "Tisbury", region: "Wiltshire", lat: 51.0640, lng: -2.0760, category: "stay", emoji: "🍷",
    image: img("1551776235-dde6d482980b", 39), blurb: "Wine-cellar suite under a 1700s coaching inn.", description: "Stone walls, feast rooms upstairs, the kind of breakfast you'll think about for weeks.", durationMin: 1440, points: 360, difficulty: 1, vibes: ["date-night", "splurge"], pricePerNight: 245 },
];

export const ALL_QUESTS: Quest[] = [...ACTIVITY_QUESTS, ...STAY_QUESTS];
