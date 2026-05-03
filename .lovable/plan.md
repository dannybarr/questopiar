## Stay Quests — Unique places to stay, with affiliate revenue

A new "Stay Quests" tab where users discover unique Airbnbs, boutique hotels, treehouses, shepherd's huts, glamping pods, etc. in their chosen area, then book via affiliate links.

### Important reality check on data sources

Before building, you should know how each provider actually works — this shapes what we can build:

- **Booking.com** — has a real affiliate program (Booking.com Affiliate Partner Programme / Partner Hub). Approved partners get a deeplink format `https://www.booking.com/searchresults.html?aid=YOUR_AID&...` plus, after approval, access to the **Demand API** for live inventory. Without API approval (which takes days/weeks), we can still earn commission via **affiliate deeplinks** to search results and individual hotels.
- **Airbnb** — **does not currently offer a public affiliate program or public API**. The old "Airbnb Associates" program closed years ago. We can still deeplink to Airbnb listings/search (`https://www.airbnb.co.uk/s/{location}/homes?...`), but you will not earn commission unless you join a third-party network (e.g. Awin, Travelpayouts) that resells Airbnb traffic — and even those are limited.
- **Realistic alternatives that pay commission today**: Booking.com (hotels + some unique stays), **Hostelworld**, **Plum Guide**, **Canopy & Stars** (Awin — unique UK stays, perfect fit), **Sykes Cottages**, **Vrbo** (CJ Affiliate), **Expedia Group** (hotels.com / Vrbo). I'd strongly recommend **Booking.com + Canopy & Stars** as the v1 pair for "unique UK stays."

### v1 approach (no API approval required, ships now)

Use the same proven pattern as `generate-quests`: an AI-curated list of real, named unique stays in the user's area, each enriched with:
- A **Booking.com affiliate deeplink** (search by property name + city, with your `aid`)
- An **Airbnb search deeplink** (works as discovery, no commission until/unless you join a network)
- Optional **Canopy & Stars** deeplink for glamping/cabins (Awin tracking)
- A real image (same `resolveImage` cascade we already use: official site og:image → Wikipedia → curated Unsplash fallback keyed on the property name so each card is unique)

When you later get approved for Booking's Demand API, we swap the AI-curated list for live inventory in the same edge function — no UI changes needed.

### What we'll build

1. **New page**: `/stays` — "Stay Quests" tab in the bottom nav (replaces or sits alongside Discover; recommend adding as a 5th tab, or replacing Discover if you want to keep 4).
2. **New edge function**: `supabase/functions/generate-stays/index.ts`
   - Input: `{ lat, lng, radiusMiles, locationName, vibe? }`
   - Calls Lovable AI (`google/gemini-2.5-flash`) with a prompt that asks for 8–12 genuinely unique, real, currently-operating stays within radius (treehouses, shepherd's huts, converted chapels, lighthouse keepers' cottages, design-led boutique hotels, narrowboats, etc. — never generic chain hotels).
   - For each: `name, type, area, blurb, whyUnique, priceBand (£/££/£££/££££), nights, sleeps, websiteUrl, bookingHotelName, latitude, longitude, imageQuery`.
   - Server enriches each with: Booking.com affiliate URL, Airbnb search URL, image (og:image → Wikipedia → Unsplash with name-seeded sig).
   - Same 30-min localStorage cache pattern as quests.
3. **UI** (`src/pages/Stays.tsx`):
   - Header with location + radius (reuses profile.location/radiusMiles).
   - Filter chips: type (Cabin, Treehouse, Boutique, Glamping, Boat, Castle…), price band, sleeps.
   - Card list with image, name, type badge, area, price band, "Why it's special" blurb, **Book on Booking.com** primary CTA, **View on Airbnb** secondary, **Save** heart.
   - Detail sheet (reuse `QuestDetailSheet` pattern) with full blurb, map preview, both affiliate CTAs prominently.
4. **Affiliate config**:
   - Store your Booking AID as a public env var `VITE_BOOKING_AFFILIATE_AID` (it's a public ID, safe in the client) so you can swap it without redeploying functions. Same for any future Awin publisher ID.
   - Centralised helper `src/lib/affiliate.ts` builds the URLs so all CTAs are consistent and trackable.
5. **Save / track**: extend the existing store with `savedStays: string[]` and surface saved stays on the Profile page (small section "Saved stays").
6. **Analytics hook**: log every affiliate click to `console.info` for now, with a TODO to wire to a `stay_clicks` table later for revenue attribution.

### Affiliate URL formats (technical)

```
Booking.com:
https://www.booking.com/searchresults.html
  ?aid={VITE_BOOKING_AFFILIATE_AID}
  &ss={encodeURIComponent(propertyName + ", " + city)}
  &checkin={today+14}&checkout={today+16}
  &group_adults=2&no_rooms=1

Airbnb (discovery, no commission):
https://www.airbnb.co.uk/s/{slug(location)}/homes
  ?query={encodeURIComponent(propertyName)}
  &adults=2

Canopy & Stars via Awin (if/when you join):
https://www.awin1.com/cread.php
  ?awinmid={MID}&awinaffid={VITE_AWIN_AFFID}
  &ued={encoded canopyandstars URL}
```

### File changes

```
src/
  pages/Stays.tsx                (new)
  components/StayCard.tsx        (new)
  components/StayDetailSheet.tsx (new)
  lib/affiliate.ts               (new)
  lib/store.ts                   (add savedStays + actions)
  components/BottomNav.tsx       (add Stays tab, icon: BedDouble)
  App.tsx                        (add /stays route)
  pages/Profile.tsx              (small "Saved stays" section)

supabase/functions/generate-stays/index.ts  (new — mirrors generate-quests)
```

### Decisions I need from you before I build

1. **Affiliate program**: do you already have a Booking.com affiliate `aid`? If yes, share it (it's public — safe in client env). If no, I'll scaffold with a placeholder and link you to apply: https://www.booking.com/affiliate-program/v2/index.html
2. **Airbnb expectation**: are you OK that Airbnb links won't earn commission (just user value), or do you want me to skip Airbnb entirely and use Booking + Canopy & Stars (Awin) as the two providers?
3. **Nav**: 5th tab (Quests / Active / Stays / Discover / Profile) or replace Discover with Stays?

Once you confirm those three, I'll implement end-to-end in one pass.
