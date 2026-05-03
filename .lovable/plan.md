## Fix duplicate quest images — fetch real venue photos

### Problem
Every quest card shows the same image because `loremflickr.com` is unreliable and falls back to a default when its tag index doesn't match.

### Solution
Replace tag-based stock images with a real-image cascade per venue.

### Changes — `supabase/functions/generate-quests/index.ts`

1. **Extend the AI JSON schema** to include per-venue grounding:
   - `websiteUrl` — the venue's official site
   - `wikipediaTitle` — for landmarks/parks/museums
   - `imageQuery` — precise visual description (final fallback only)

2. **Add an image resolver** with a 3-step cascade, run in parallel for all quests with per-fetch timeouts (2.5–3s) so slow venue sites never block the response:
   1. **Official site og:image** — fetch the venue's homepage, regex-parse `og:image` / `twitter:image`, absolutize relative URLs, validate via HEAD request (must return `image/*`). This gives the actual venue photo (Puttshack neon, Flight Club oches, spa pools, etc.).
   2. **Wikipedia REST summary** — `en.wikipedia.org/api/rest_v1/page/summary/{title}` → `originalimage.source` (or upgraded thumbnail). Perfect for Parliament Hill, Tate, Kew.
   3. **Unsplash Source featured** — `source.unsplash.com/featured/900x700/?<imageQuery>,<categoryTags>&sig=<venueHash>`. Per-venue `sig` guarantees variety even when tags repeat.

3. **In-memory cache** (`Map<venueKey, url>`) inside the module to avoid refetching on warm invocations.

4. **Remove Loremflickr entirely** — the root cause of the duplicates.

5. **Pass `websiteUrl` through** to the response so the detail sheet can link to the official site too.

### No frontend changes needed
`QuestCard` and `QuestDetailSheet` already consume `quest.image`.

### Deploy
After editing, redeploy `generate-quests` and test with a London coordinate to confirm varied, venue-accurate images.