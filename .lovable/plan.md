# Side Quest — Build Plan

A playful, arcade-feel app that turns the UK into a playground. Swipe quests, accept dares, log adventures with friends, build streaks. Demo-only (no login), seeded with rich UK data.

## The Vibe

- **Aesthetic**: Playful & arcade — chunky display type, sticker-style icons, confetti on wins, soft shadows, rounded everything, micro-bounces on every tap.
- **Palette**: Cream base `#FFF8EE`, ink black `#0E0E12`, electric lime `#C6FF3D` (primary accent), hot coral `#FF5A5F`, sky blue `#3DA9FF`, sunshine `#FFD23F`. Dark surfaces use deep plum `#1A1322`.
- **Type**: Display — a chunky geometric (Space Grotesk / Bricolage Grotesque) for headlines; Inter for body. Big numerals for points/streak.
- **Motion**: Spring physics on every interactive element. Swipe cards tilt/scale. Confetti + haptic-style flash on accept. Stamp animation ("QUEST ACCEPTED"). Page transitions slide.
- **Feel**: Tactile, generous whitespace, sticker-y. Never sterile, never AI-templated.

## Core Screens

### 1. Onboarding — "Where's your side quest?"
- 3 lightweight steps with bouncy progress dots:
  1. Splash + name ("What should we call you?")
  2. Avatar picker (8 preset sticker avatars, picked by tapping)
  3. **Location** — search any UK place (autocomplete from seeded city/area list) OR "Use my current location" (geolocation API, falls back to manual). Distance-radius slider (1–500+ miles, with a fun "no limit" toggle at the end).
- Finishes with a confetti burst into the swiper.

### 2. Quest Suggester (Hero — Tinder-style)
- Stack of 3 cards visible (back two scaled/offset). Top card is draggable with rotation + opacity feedback.
- Card content: hero image, sticker badges (category, duration, distance from user, vibe tags like "outdoorsy", "rainy-day", "date-night"), short punchy description, point reward.
- Drag right = **Accept** (lime stamp + confetti, card flies off, toast "Added to Active Quests"). Drag left = **Skip** (coral X, fades). Drag up = **Save for later**.
- Tap card → expands to full detail sheet with map preview, what to bring, est. time, "Bring a friend" share button.
- Filter chip row at top: category (Active, Chill, Foodie, Water, Climb, Ride, Stay), distance, duration. Tap "Shuffle" to reshuffle deck.
- Empty state: "You've seen them all — widen your radius?" with a slider.

### 3. Active Quests
- Vertical feed of accepted quests as colorful cards.
- Each shows status: **Planned** → **In Progress** (with "Start quest" button → live timer + check-in button) → **Complete** (photo proof upload, rating 1–5 sparkles, share).
- Completing triggers full-screen celebration: confetti, points popup, streak increment, "Quest Stamped!" passport-style stamp added to profile.
- Swipe-left on a card to abandon.

### 4. Discover
- Mixed feed of community quests + reviews.
- Each post: user avatar, quest title, photo, short review, upvote (lime arrow with count), comment count.
- Tap upvote = bouncy +1 animation. Top of feed: "Trending this week" horizontal scroll of hottest quests.
- Toggle pills: All / Activities / Stays / Groups.
- Two seeded **open groups** ("Kent Weekenders", "London After Dark") shown as joinable cards with member avatars stack and "Join the chaos" button.

### 5. Profile
- Top: big avatar, name, current city.
- **Stats row**: Total Points (big number), Streak (flame icon + days), Quests Completed, Stays Booked.
- **Streak calendar**: GitHub-style heatmap of last 12 weeks with lime squares.
- **Passport**: grid of stamp stickers earned per completed quest (rotated slightly, sticker peel effect).
- **Badges**: unlockables ("First Quest", "5-Day Streak", "Treehouse Sleeper", "Kent Conqueror") — locked ones grayscale.
- Settings row: edit location/radius, theme toggle, reset demo data.

## Navigation

Bottom tab bar (floating, rounded, sticker-style) with 4 tabs: **Quests** (swiper), **Active**, **Discover**, **Profile**. Center "Quests" tab is slightly larger with lime accent. Smooth crossfade between tabs.

## Seeded Data (≥30 quests, 2 groups)

**20+ activity quests** spread across UK with real place names & coordinates, e.g.:
- Padel at Padel Hub Canterbury (Kent)
- Rock climbing at The Castle Climbing Centre (Stoke Newington, London)
- Sunrise hike at Box Hill (Surrey)
- Sea swim + chips at Whitstable Beach (Kent)
- Bike loop around Richmond Park (London)
- Golf at Princes Golf Club (Sandwich, Kent)
- Bouldering at Yonder (Walthamstow)
- Kayaking at Regent's Canal
- Pitch & putt at Hampstead Heath
- Surf lesson at Joss Bay (Broadstairs)
- Wild swimming at Hampstead Ponds
- Go-karting at TeamSport Tower Bridge
- Axe throwing at Whistle Punks Vauxhall
- Roller disco at Flippers Olympia
- Sunset run along the Thames Path
- Foraging walk at Epping Forest
- Ping-pong at Bounce Old Street
- Skate session at Bay Sixty6
- Pub crawl on Bermondsey Beer Mile
- Stargazing at South Downs Dark Sky Reserve
- (plus extras for Kent: Leeds Castle picnic, Margate Old Town wander, Dover cliffs walk)

**10 stay quests** (UK-wide, real-feeling):
- Treehouse at Hoots Cabin (Forest of Dean)
- Houseboat on Regent's Canal (London)
- Shepherd's hut at Elmley Nature Reserve (Kent)
- Dome at Brook House Woods (Herefordshire)
- Lighthouse keeper's cottage (Cornwall)
- Converted railway carriage (North Yorkshire)
- Off-grid cabin in Snowdonia
- Yurt at Loose Reins (Dorset)
- Float pod on Loch Lomond
- Cave room at The Beckford Arms cellar suite (Wiltshire)

**2 open groups**: Kent Weekenders (12 members, active quest: "Coastal pub crawl Saturday"), London After Dark (28 members, active quest: "Soho speakeasy hunt").

Each quest has: id, title, category, location (name + lat/lng + city), image, description, duration, points, vibe tags, difficulty.

## Distance & Filtering

- User location stored in localStorage with radius preference.
- Haversine distance computed client-side against quest coords.
- Activities filtered by radius; **stays always national** but sortable by distance.
- "+5 miles" quick-bump button on empty state; radius slider has no upper cap.

## Persistence

All state in localStorage (no backend): profile, accepted/active/completed quests, streak, points, upvotes, joined groups. "Reset demo data" in settings restores seed.

## Technical Notes

- Stack: existing React + Vite + Tailwind + shadcn. Add `framer-motion` for swipe physics and page transitions, `canvas-confetti` for celebrations, `react-router-dom` routes per screen.
- Swiper built custom on framer-motion `drag` with rotate/opacity transforms — no heavy library.
- Design tokens: extend `index.css` with the new HSL palette, add display font via Google Fonts in `index.html`, extend `tailwind.config.ts` with custom shadows ("sticker": offset hard shadow), keyframes (wiggle, pop, stamp), and font families.
- Images: use Unsplash source URLs keyed to each quest category for realistic photos.
- Geolocation via `navigator.geolocation`, reverse-geocoded against a seeded UK city list (no external API needed for demo).
- Routes: `/onboarding`, `/quests`, `/active`, `/discover`, `/profile`. Root redirects to onboarding if no profile, else `/quests`.
- File structure: `src/data/quests.ts`, `src/data/stays.ts`, `src/data/groups.ts`, `src/lib/store.ts` (localStorage hooks), `src/lib/geo.ts`, `src/components/quest-card/`, `src/components/swiper/`, `src/components/bottom-nav.tsx`, `src/pages/{Onboarding,Quests,Active,Discover,Profile}.tsx`.
- Mobile-first; capped at ~480px on desktop with playful gradient backdrop framing the "phone".

## Out of Scope (v1)

- Real auth / multi-user sync
- Real bookings / payments for stays (CTA shows "Coming soon" toast)
- Push notifications
- Real-time group chat (groups show roster + active quest only)
