## Goal
Replace the small hardcoded UK place list with a fully comprehensive UK-wide search, and make "Use current location" actually resolve to a real place name (reverse geocoding) instead of snapping to one of ~27 seeded towns.

## Recommended provider: Nominatim (OpenStreetMap)
- **Free, no API key, no signup** — ideal for Lovable Cloud.
- Covers every UK city, town, village, postcode, neighbourhood, landmark.
- Supports both forward search (typeahead) and reverse geocoding (lat/lng → place).
- Usage policy requires a descriptive User-Agent and ≤1 req/sec — we satisfy both by routing through an edge function with debounce.

Alternatives considered:
- **Mapbox / Google Places**: better UX but require API keys + billing setup. Overkill here.
- **postcodes.io**: UK-only and excellent, but postcode-focused (no "Shoreditch" / "Peak District" style search).

Going with Nominatim. We can swap to Mapbox later if rate limits ever bite.

## Changes

### 1. New edge function `geocode` (`supabase/functions/geocode/index.ts`)
Thin proxy to Nominatim so we control User-Agent, caching, and can swap providers later.
- `GET ?q=<text>` → forward search, `countrycodes=gb`, `limit=8`, returns `[{name, region, lat, lng}]`
- `GET ?lat=<>&lng=<>` → reverse geocode, returns single `{name, region, lat, lng}`
- Maps Nominatim address fields to a friendly name (prefer `village`/`town`/`city`/`suburb`/`neighbourhood`) and region (`county`/`state_district`/`state`).
- 5-minute in-memory LRU cache keyed by query string to soften repeat calls.
- CORS headers, `verify_jwt = false` (public endpoint).
- Registered automatically — no `config.toml` change needed.

### 2. Onboarding search UX (`src/pages/Onboarding.tsx`)
- Replace `UK_PLACES.filter(...)` with debounced (250 ms) call to `supabase.functions.invoke('geocode', { body: { q } })`.
- Show a small spinner in the input while loading; show "No matches" when empty.
- Keep the existing result-row styling (name + region chevron).
- On select: store `{name, region, lat, lng}` exactly as today — downstream code (`useGeneratedQuests`, quests feed) already accepts arbitrary lat/lng.

### 3. Live "Use current location"
- Keep `navigator.geolocation.getCurrentPosition` but on success call the new `geocode` function with `{lat, lng}`.
- Set `place` to the real reverse-geocoded result (e.g. "Tunbridge Wells, Kent") instead of "Near me".
- Improve error handling: distinct toasts for permission denied vs timeout vs unavailable; raise timeout to 10 s and `enableHighAccuracy: true`.
- Show a subtle loading state on the button while resolving.

### 4. Keep `UK_PLACES` as a tiny offline fallback
- If the geocode function fails (offline / 5xx), fall back to filtering the existing seeded list so search never appears broken.

## Out of scope
- No map rendering — search + reverse geocode only. Adding a visual map can come later if you want.
- No changes to quest generation, radius slider, or storage shape.

## Technical notes
- Nominatim endpoint: `https://nominatim.openstreetmap.org/search` and `/reverse`, `format=jsonv2`.
- User-Agent header set to `SideQuest/1.0 (lovable.app)` per their policy.
- Debounce implemented with a `setTimeout` ref; abort in-flight requests via `AbortController` when the query changes.
