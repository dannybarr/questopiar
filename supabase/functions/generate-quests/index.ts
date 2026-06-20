// Generate real, location-aware Side Quests via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ReqBody {
  lat: number;
  lng: number;
  radiusMiles: number;
  count?: number;
  locationName?: string;
}

const CATEGORIES = ["active","chill","foodie","water","climb","ride","nightlife","nature"] as const;

const PROFILE_GUIDES: Record<string, string> = {
  urban_dense: "dense city. Mix activity bars (Puttshack, Flight Club, Bounce, Poolhouse, Swingers, axe throwing), hidden speakeasy bars, late museum openings, viewpoint hikes (Parliament Hill, Greenwich, Primrose Hill), supper clubs / pop-ups, lidos & wild swims, urban rides/skates, comedy basements, rooftop sundowners, spas/saunas, street food markets.",
  urban_fringe: "urban fringe / suburb. Mix climbing gyms, reservoir runs, city farms, food halls, urban hikes, open-water swims, indie cinemas, brewery taprooms.",
  coastal: "coastal town. Mix sea swims, surf lessons, fish shacks, pier walks, lighthouse hikes, kayak/SUP, smugglers' pubs, galleries, coastal path legs, fossil hunts.",
  countryside: "Cotswolds-style countryside. Mix walks/viewpoints, cosy fire-side pubs, farm shops, spa days (think Calcot/Daylesford/Thyme), vineyard or distillery tours, antique trails, stargazing, bluebell woods, river dips.",
  national_park: "national park / wild. Mix summit hikes, gorge scrambles, wild camp spots, stargazing, bothy nights, paddleboarding, wildlife hides, dark-sky picnics.",
  market_town: "market town. Mix market wanders, indie cinemas, walled-garden pubs, river paddles, antique trails, supper clubs, short walks, craft brewery visits.",
};

async function callAI(messages: any[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI ${res.status}: ${txt}`);
  }
  return res.json();
}

const CATEGORY_FALLBACK_TAGS: Record<string, string> = {
  active: "sport,activity-bar",
  chill: "cozy,lounge",
  foodie: "restaurant,food",
  water: "swimming,water",
  climb: "climbing,bouldering",
  ride: "cycling,skateboarding",
  nightlife: "cocktail,bar",
  nature: "landscape,nature",
};

function emojiFor(c: string) {
  return ({active:"💪",chill:"🌿",foodie:"🍻",water:"🌊",climb:"🧗",ride:"🚴",nightlife:"🌃",nature:"🌄"} as any)[c] || "✨";
}

function computePoints(randomness: number, durationMin: number) {
  const r = Math.max(1, Math.min(5, randomness || 3));
  const d = Math.max(15, Math.min(600, durationMin || 60));
  return Math.max(30, Math.min(320, Math.round(25 + r * 25 + d / 8)));
}

function parseQuestArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray((value as any).quests)) return (value as any).quests;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.quests)) return parsed.quests;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const objStart = value.indexOf("{");
    const objEnd = value.lastIndexOf("}");
    if (objStart >= 0 && objEnd > objStart) {
      try {
        const parsed = JSON.parse(value.slice(objStart, objEnd + 1));
        if (parsed && Array.isArray(parsed.quests)) return parsed.quests;
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    const arrStart = value.indexOf("[");
    const arrEnd = value.lastIndexOf("]");
    if (arrStart >= 0 && arrEnd > arrStart) {
      try {
        const parsed = JSON.parse(value.slice(arrStart, arrEnd + 1));
        return Array.isArray(parsed) ? parsed : [];
      } catch {}
    }
    return [];
  }
}

function normalizeCategory(category: unknown, imageKeyword = "", vibes: unknown[] = []) {
  const haystack = [category, imageKeyword, ...vibes].join(" ").toLowerCase();
  if (CATEGORIES.includes(category as any)) return category as typeof CATEGORIES[number];
  if (/bar|cocktail|club|speakeasy|night|flight club|bounce|darts/.test(haystack)) return "nightlife";
  if (/food|restaurant|market|supper|bakery|pub|brewery/.test(haystack)) return "foodie";
  if (/hike|park|view|garden|wood|trail|nature|walk/.test(haystack)) return "nature";
  if (/swim|lido|river|canal|water|kayak|sup/.test(haystack)) return "water";
  if (/climb|boulder/.test(haystack)) return "climb";
  if (/cycle|bike|skate|ride/.test(haystack)) return "ride";
  if (/golf|darts|axe|sport|activity|fitness/.test(haystack)) return "active";
  return "chill";
}

// ============ Image resolution ============

const imageCache = new Map<string, string>();

async function safeFetch(url: string, init: RequestInit = {}, timeoutMs = 2500): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SideQuestBot/1.0; +https://lovable.dev)",
        ...(init.headers || {}),
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function absolutize(maybeUrl: string, base: string): string | null {
  try { return new URL(maybeUrl, base).toString(); } catch { return null; }
}

async function ogImageFromSite(siteUrl: string): Promise<string | null> {
  const res = await safeFetch(siteUrl, { headers: { Accept: "text/html,*/*" } }, 3000);
  if (!res || !res.ok) return null;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return null;
  const html = (await res.text()).slice(0, 250_000);
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const abs = absolutize(m[1].trim(), siteUrl);
      if (abs) return abs;
    }
  }
  return null;
}

async function wikiImage(title: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, "_"))}`;
  const res = await safeFetch(url, { headers: { Accept: "application/json" } }, 2500);
  if (!res || !res.ok) return null;
  try {
    const j = await res.json();
    const src: string | undefined = j?.originalimage?.source || j?.thumbnail?.source;
    return src || null;
  } catch { return null; }
}

async function validateImage(url: string): Promise<boolean> {
  const res = await safeFetch(url, { method: "HEAD" }, 2000);
  if (!res || !res.ok) return false;
  const ct = res.headers.get("content-type") || "";
  return ct.startsWith("image/");
}

async function unsplashSearch(query: string): Promise<string | null> {
  const key = Deno.env.get("UNSPLASH_ACCESS_KEY");
  if (!key) return null;
  try {
    const res = await safeFetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}`, Accept: "application/json" } },
      4000
    );
    if (!res || !res.ok) return null;
    const json = await res.json();
    const results: any[] = json?.results || [];
    if (!results.length) return null;
    const idx = Math.abs([...query].reduce((a, c) => a + c.charCodeAt(0), 0)) % Math.min(results.length, 5);
    return results[idx]?.urls?.regular || results[0]?.urls?.regular || null;
  } catch {
    return null;
  }
}

const FALLBACK_PHOTO_IDS: Record<string, string[]> = {
  active:    ["1554068865-24cecd4e34b8", "1581094271901-8022df4466f9", "1540910419892-4a36d2c3266c"],
  climb:     ["1522163182402-834f871fd851", "1583512603805-3cc6b41f3edb"],
  nature:    ["1464822759023-fed622ff2c3b", "1500382017468-9049fed747ef"],
  water:     ["1507525428034-b723cf961d3e", "1502780402662-acc01917cb52", "1504701954957-2010ec3bcec1"],
  ride:      ["1517649763962-0c623066013b"],
  foodie:    ["1559526324-c1f275fbfa32"],
  nightlife: ["1581349485608-9469926a8e5e", "1578662996442-48f60103fc96"],
  chill:     ["1564507592333-c60657eea523", "1536329832-aafd4f7cd4e3"],
};

async function resolveImage(q: any, category: string): Promise<string> {
  const cacheKey = `${q.venue || ""}|${q.city || ""}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  // 1. Official site og:image
  if (q.websiteUrl && typeof q.websiteUrl === "string" && /^https?:\/\//.test(q.websiteUrl)) {
    try {
      const og = await ogImageFromSite(q.websiteUrl);
      if (og && await validateImage(og)) {
        imageCache.set(cacheKey, og);
        return og;
      }
    } catch {}
  }

  // 2. Wikipedia
  if (q.wikipediaTitle && typeof q.wikipediaTitle === "string") {
    try {
      const wiki = await wikiImage(q.wikipediaTitle);
      if (wiki) {
        imageCache.set(cacheKey, wiki);
        return wiki;
      }
    } catch {}
  }

  // 3. Unsplash API search using the precise imageQuery field
  const searchQuery = q.imageQuery || q.imageKeyword || `${q.venue} ${q.city}`;
  const unsplashResult = await unsplashSearch(searchQuery);
  if (unsplashResult) {
    imageCache.set(cacheKey, unsplashResult);
    return unsplashResult;
  }

  // 4. Static fallback — working Unsplash photo IDs (NOT the dead source.unsplash.com)
  const ids = FALLBACK_PHOTO_IDS[category] || FALLBACK_PHOTO_IDS.chill;
  const hash = Math.abs([...(q.venue || category)].reduce((a, c) => a + c.charCodeAt(0), 0));
  const id = ids[hash % ids.length];
  const fb = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;
  imageCache.set(cacheKey, fb);
  return fb;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat, lng, radiusMiles, count = 12, locationName }: ReqBody = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(JSON.stringify({ error: "lat/lng required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Step 1: classify place + name town
    const profileResp = await callAI([
      { role: "system", content: "You classify UK locations. Reply ONLY with JSON {\"profile\":one of [urban_dense,urban_fringe,coastal,countryside,national_park,market_town], \"town\":string, \"region\":string}. No prose." },
      { role: "user", content: `Coords ${lat},${lng}${locationName ? ` (user said: ${locationName})` : ""}. Classify the area within ~${radiusMiles} miles.` },
    ]);
    let profile = "urban_fringe", town = locationName || "your area", region = "UK";
    try {
      const txt = profileResp.choices?.[0]?.message?.content || "";
      const m = txt.match(/\{[\s\S]*\}/);
      if (m) {
        const j = JSON.parse(m[0]);
        if (j.profile && PROFILE_GUIDES[j.profile]) profile = j.profile;
        if (j.town) town = j.town;
        if (j.region) region = j.region;
      }
    } catch {}

    const guide = PROFILE_GUIDES[profile];

    const sys = `You are a UK local-adventure curator who knows real venues. The user is near ${town}, ${region} (${lat},${lng}), within ${radiusMiles} miles. Area type: ${profile} — ${guide}

RULES:
- Use ONLY real, currently-operating venues you are confident exist.
- Maximise VARIETY: spread across at least 5 different categories. Never repeat the same vibe twice in a row.
- Mix iconic with hidden-gem.
- Approximate lat/lng of the venue.
- Vary durations from 30 min to 4 hrs.
- Be specific (real bar names, real hike names, real museums).
- For each quest, ALWAYS include the venue's official website URL (websiteUrl) so we can fetch its real photo. If the venue is a landmark/museum/park with a Wikipedia page, also include wikipediaTitle.
- imageQuery: a precise 3-5 word visual description of THIS specific venue (e.g. "neon mini golf interior", "candlelit speakeasy cocktail bar", "Hampstead Heath viewpoint sunset").

Return ONLY valid JSON, no markdown, in this exact shape: {"quests":[{"title":"","venue":"","city":"","region":"","address":"","lat":0,"lng":0,"category":"active|chill|foodie|water|climb|ride|nightlife|nature","blurb":"","description":"","durationMin":90,"randomness":3,"difficulty":1,"vibes":[""],"websiteUrl":"https://...","wikipediaTitle":"","imageQuery":""}]}.
Return EXACTLY ${count} quests.`;

    const questsResp = await callAI([
      { role: "system", content: sys },
      { role: "user", content: `Give me ${count} varied side quests near ${town}.` },
    ]);

    if (questsResp.error || questsResp.choices?.[0]?.finish_reason === "error") {
      throw new Error(JSON.stringify(questsResp));
    }

    const content = questsResp.choices?.[0]?.message?.content || "";
    const raw = parseQuestArray(content);
    if (!raw.length) throw new Error("AI returned no usable quests. Please try again.");

    const withImages = await Promise.all(raw.map(async (q, i) => {
      const cat = normalizeCategory(q.category, q.imageQuery || q.imageKeyword, q.vibes || []);
      const image = await resolveImage(q, cat);
      return {
        id: `ai-${Date.now()}-${i}`,
        title: q.title || q.venue || "Local side quest",
        venue: q.venue || q.title || "Nearby place",
        city: q.city || town,
        region: q.region || region,
        address: q.address,
        lat: typeof q.lat === "number" ? q.lat : lat,
        lng: typeof q.lng === "number" ? q.lng : lng,
        category: cat,
        emoji: emojiFor(cat),
        image,
        websiteUrl: q.websiteUrl,
        blurb: q.blurb || `A real-world ${cat} quest near ${town}.`,
        description: q.description || `Head to ${q.venue || "this local spot"} for a varied side quest in the area. Check opening times before you go.`,
        durationMin: typeof q.durationMin === "number" ? q.durationMin : 90,
        difficulty: typeof q.difficulty === "number" ? q.difficulty : 1,
        randomness: typeof q.randomness === "number" ? q.randomness : 3,
        points: computePoints(q.randomness, q.durationMin),
        vibes: q.vibes || [],
        source: "ai",
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((q.venue || "") + ", " + (q.city||town))}`,
      };
    }));

    return new Response(JSON.stringify({ profile, town, region, quests: withImages }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    const status = msg.includes(" 429") ? 429 : msg.includes(" 402") ? 402 : 500;
    console.error("generate-quests error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
