# Real-Place LLM Side Quests (Live, Varied, Location-Aware)

Replace the static deck with quests generated on demand by an LLM that knows the *character* of the place the user is in, then mixes a wide variety of real venues into the swiper.

## Core principles

1. **Real venues only.** Use Google Gemini via the Lovable AI Gateway with **Google Search grounding** so place names + addresses come from the live web, not hallucinated.
2. **Location-aware persona.** Before generating quests, the model classifies the area (dense city / coastal town / countryside / market town / national park) and picks the *right* category mix for that place.
3. **Forced variety.** The prompt requires the result set to span multiple distinct categories — never 8 hikes in a row, never 8 cocktail bars in a row.
4. **Live + reactive.** Anytime location or radius changes (or the user taps shuffle), a new pull fires. Cached for 30 min per (rounded location, radius) so opens are instant.

## The variety system

The edge function builds the prompt around a **place profile** so the deck feels right for where the user is:

```text
Place profile (derived from lat/lng + radius)
├── Urban dense        → activity bars, hidden cocktail dens, pop-ups, museums late nights,
│                        rooftop sundowners, supper clubs, comedy basements, lidos
├── Urban fringe       → city farms, reservoir runs, climbing gyms, food markets, urban hikes
├── Coastal            → wild swims, surf, fish shacks, pier walks, lighthouse hikes
├── Cotswolds-style    → village pub crawl, spa day, longbarrow hike, antique trail,
│                        farm-shop picnic, vineyard tour, fire-pit dinner
├── National park      → summit hikes, wild camp, stargazing, gorge scrambles, bothy nights
└── Market town        → market wander, indie cinema, walled-garden pub, river paddle
```

Each profile maps to a **required category spread**. The model must return at least one quest from each required bucket for that profile, plus a few wildcards.

Examples:

- **London (urban dense)**: 1 activity bar (Puttshack / Flight Club / Bounce / Poolhouse style), 1 hidden bar, 1 viewpoint hike (Parliament Hill, Greenwich), 1 museum late, 1 pop-up / supper club, 1 spa or sauna, 1 lido / wild swim, 1 ride/skate, 1 nightlife, 1 wildcard.
- **Cotswolds**: 2 walks (e.g. Broadway Tower, Cleeve Common), 1 cosy pub with fire, 1 farm-shop / cheese trail, 1 spa (Calcot, Daylesford), 1 vineyard or distillery, 1 antique town wander, 1 stargazing / dark sky, 1 wildcard.
- **Cornish coast**: surf lesson, coastal path leg, fish shack, lighthouse, sea swim, smugglers' pub, gallery, wildcard.

This prevents the deck from collapsing into one vibe.

## Points formula

```text
points = round( 25 + (randomness * 25) + (durationMin / 8) )
clamped 30–320
```

Randomness is a 1–5 score the model assigns: 1 = obvious tourist thing, 5 = "I would never have thought of that". Long *and* random quests pay the most.

## UX flow

1. Onboarding (existing) captures location + radius.
2. Quests page calls `useGeneratedQuests(location, radius)`.
3. While generating: show seeded fallback deck filtered to radius and a small animated chip "Scouting [Town] for side quests…".
4. When response arrives: prepend generated quests, dedupe by venue+title, keep category filter chips working.
5. Cache per `round(lat,2)|round(lng,2)|radius` for 30 min. Shuffle button forces refresh. Changing location/radius invalidates and refires automatically.
6. Detail sheet gains an **Open in Maps** link using the venue address/coords returned by the model.

## Image strategy

- Don't trust LLM image URLs.
- For each quest, build an Unsplash Source URL from `{category, city, venueKeyword}` (e.g. `https://source.unsplash.com/800x600/?cocktail,bar,soho`). Free, no key, always returns something on-brief.
- Fallback to existing per-category seeded photos if the network image fails.
- Future upgrade path noted: swap to Google Places Photos when a paid key is added.

## Technical plan

**Backend (new — requires Lovable Cloud)**
- Edge function `generate-quests`:
  - Input: `{ lat, lng, radiusMiles, count?: 12 }`
  - Step 1: ask the model to classify the place profile + name the nearest town(s).
  - Step 2: ask the model (with Google Search grounding) to return `count` real quests, enforcing the variety spread for that profile. Strict JSON via tool calling.
  - Server validates, computes points, attaches Unsplash image URLs, returns `{ profile, town, quests }`.
  - Handles Lovable AI 429 / 402 with clear error messages.

**Frontend**
- `src/lib/api.ts` — `fetchGeneratedQuests(loc, radius)` with localStorage cache + TTL.
- `src/hooks/useGeneratedQuests.ts` — re-fires on location/radius change, exposes `{ quests, loading, profile, town, refresh }`.
- `src/pages/Quests.tsx` — merge generated quests in front of seeded deck, show "Scouting Bourton-on-the-Water…" chip while loading, show profile pill ("Cotswolds vibe ✨") once loaded.
- Extend `Quest` with optional `address`, `source: 'seed' | 'ai'`, `mapsUrl`.
- Detail sheet: add "Open in Maps" button.

## Out of scope (for this pass)

- Real-time opening hours / ticketing.
- Stays generation (kept seeded — booking flow not in scope).
- Per-user accounts / cloud-synced cache.

## What I need from you to confirm before building

1. Enable **Lovable Cloud** so the edge function and the AI key live server-side.
2. OK with **Unsplash category images** for now (swap to Google Places Photos later if you want pixel-perfect venue shots).
