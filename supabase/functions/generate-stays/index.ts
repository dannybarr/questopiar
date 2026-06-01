// Generate unique, location-aware Stay Quests via Lovable AI Gateway
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

const STAY_TYPES = [
  "treehouse","shepherds-hut","cabin","glamping","yurt","boat","narrowboat",
  "lighthouse","castle","converted-chapel","tiny-home","boutique-hotel",
  "design-hotel","farm-stay","off-grid","dome","airstream"
] as const;

async function callAI(messages: any[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  return res.json();
}

function parseStayArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray((value as any).stays)) return (value as any).stays;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.stays)) return parsed.stays;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const s = value.indexOf("{"), e = value.lastIndexOf("}");
    if (s >= 0 && e > s) {
      try {
        const j = JSON.parse(value.slice(s, e + 1));
        if (Array.isArray(j.stays)) return j.stays;
      } catch {}
    }
    return [];
  }
}

function emojiFor(type: string) {
  const map: Record<string,string> = {
    treehouse:"🌳","shepherds-hut":"🐑",cabin:"🪵",glamping:"⛺",yurt:"🏕️",
    boat:"⛵",narrowboat:"🚤",lighthouse:"🗼",castle:"🏰","converted-chapel":"⛪",
    "tiny-home":"🏠","boutique-hotel":"🛎️","design-hotel":"✨","farm-stay":"🚜",
    "off-grid":"🌲",dome:"🔭",airstream:"🚐",
  };
  return map[type] || "🛏️";
}

// ============ Image resolution (reused pattern) ============
const imageCache = new Map<string, string>();

async function safeFetch(url: string, init: RequestInit = {}, timeoutMs = 2500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init, signal: ctrl.signal, redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SideQuestBot/1.0)", ...(init.headers||{}) },
    });
  } catch { return null; } finally { clearTimeout(t); }
}

function absolutize(u: string, base: string) { try { return new URL(u, base).toString(); } catch { return null; } }

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
    if (m && m[1]) { const abs = absolutize(m[1].trim(), siteUrl); if (abs) return abs; }
  }
  return null;
}

async function validateImage(url: string) {
  const res = await safeFetch(url, { method: "HEAD" }, 2000);
  if (!res || !res.ok) return false;
  return (res.headers.get("content-type") || "").startsWith("image/");
}

function staticStayFallback(type: string, name: string): string {
  const STATIC: Record<string, string> = {
    treehouse:           "1542718610-a21bfaf9d82f",
    "shepherds-hut":     "1518780664697-55e3ad937233",
    cabin:               "1449824913935-59a10b8d2000",
    glamping:            "1445294211564-3ca59d999abd",
    yurt:                "1474314170-b3f8473adb1d",
    boat:                "1605281317010-fe5ffe798166",
    narrowboat:          "1601581987809-a9d267ddce1a",
    lighthouse:          "1558618666-fcd25c85cd64",
    castle:              "1587502536575-6dfba0a6e017",
    "converted-chapel":  "1510798831971-3935172b4823",
    "tiny-home":         "1570129477492-45c003edd2be",
    "boutique-hotel":    "1566073771259-6a8506099945",
    "design-hotel":      "1445965748-7b38f9a6c03f",
    "farm-stay":         "1500076656116-558758c991c1",
    "off-grid":          "1501854140801-50d01698950b",
    dome:                "1464822759023-fed622ff2c3b",
    airstream:           "1485965120184-e220f721d03e",
  };
  const id = STATIC[type] || STATIC["boutique-hotel"];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;
}

async function pexelsStayFallback(imageQuery: string, type: string, name: string): Promise<string> {
  const apiKey = Deno.env.get("PEXELS_API_KEY");
  if (!apiKey) return staticStayFallback(type, name);
  const readable = type.replace(/-/g, " ");
  const queries = [imageQuery, `${readable} interior`, readable].filter(Boolean);
  for (const q of queries) {
    const res = await safeFetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=3&orientation=landscape`,
      { headers: { Authorization: apiKey } },
      3000
    );
    if (!res?.ok) continue;
    try {
      const json = await res.json();
      const photos: any[] = json?.photos || [];
      if (photos.length) {
        const idx = Math.abs([...(name || q)].reduce((a, c) => a + c.charCodeAt(0), 0)) % photos.length;
        return photos[idx].src.large;
      }
    } catch {}
  }
  return staticStayFallback(type, name);
}

async function resolveImage(s: any): Promise<string> {
  const key = `${s.name||""}|${s.area||""}`;
  const c = imageCache.get(key); if (c) return c;
  if (s.websiteUrl && /^https?:\/\//.test(s.websiteUrl)) {
    try {
      const og = await ogImageFromSite(s.websiteUrl);
      if (og && await validateImage(og)) { imageCache.set(key, og); return og; }
    } catch {}
  }
  const fb = await pexelsStayFallback(s.imageQuery || "", s.type || "boutique-hotel", s.name || "");
  imageCache.set(key, fb); return fb;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { lat, lng, radiusMiles, count = 10, locationName }: ReqBody = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(JSON.stringify({ error: "lat/lng required" }), { status: 400, headers: { ...corsHeaders, "Content-Type":"application/json" } });
    }

    const town = locationName || "your area";
    const sys = `You curate UNIQUE places to stay the night in the UK. The user is near ${town} (${lat},${lng}) within ${radiusMiles} miles.

RULES:
- Only REAL, currently-operating properties you are confident exist (treehouses, shepherd's huts, converted chapels, lighthouse keepers' cottages, narrowboats, design-led boutique hotels, glamping pods, castles you can sleep in, etc).
- NEVER list generic chain hotels (no Premier Inn, Travelodge, Holiday Inn, Hilton, etc.).
- Maximise VARIETY across stay types.
- Each stay must have a clear "why it's special" angle.
- Include the property's official websiteUrl so we can fetch its real photo.
- bookingSearchTerm: the EXACT property name as it appears on Booking.com (so the affiliate search resolves).

Return ONLY valid JSON: {"stays":[{"name":"","type":"treehouse|shepherds-hut|cabin|glamping|yurt|boat|narrowboat|lighthouse|castle|converted-chapel|tiny-home|boutique-hotel|design-hotel|farm-stay|off-grid|dome|airstream","area":"","region":"","lat":0,"lng":0,"blurb":"","whyUnique":"","priceBand":"£|££|£££|££££","sleeps":2,"nights":2,"websiteUrl":"https://...","bookingSearchTerm":"","imageQuery":""}]}.
Return EXACTLY ${count} stays.`;

    const resp = await callAI([
      { role: "system", content: sys },
      { role: "user", content: `${count} unique stays near ${town}, within ${radiusMiles} miles.` },
    ]);
    if (resp.error) throw new Error(JSON.stringify(resp));
    const raw = parseStayArray(resp.choices?.[0]?.message?.content || "");
    if (!raw.length) throw new Error("AI returned no stays.");

    const stays = await Promise.all(raw.map(async (s, i) => {
      const image = await resolveImage(s);
      const type = (STAY_TYPES as readonly string[]).includes(s.type) ? s.type : "boutique-hotel";
      const searchTerm = s.bookingSearchTerm || `${s.name} ${s.area || town}`;
      return {
        id: `stay-${Date.now()}-${i}`,
        name: s.name || "Unique stay",
        type,
        emoji: emojiFor(type),
        area: s.area || town,
        region: s.region || "UK",
        lat: typeof s.lat === "number" ? s.lat : lat,
        lng: typeof s.lng === "number" ? s.lng : lng,
        image,
        blurb: s.blurb || "",
        whyUnique: s.whyUnique || s.blurb || "",
        priceBand: ["£","££","£££","££££"].includes(s.priceBand) ? s.priceBand : "££",
        sleeps: typeof s.sleeps === "number" ? s.sleeps : 2,
        nights: typeof s.nights === "number" ? s.nights : 2,
        websiteUrl: s.websiteUrl,
        bookingSearchTerm: searchTerm,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((s.name||"") + ", " + (s.area||town))}`,
      };
    }));

    return new Response(JSON.stringify({ town, stays }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    const status = msg.includes(" 429") ? 429 : msg.includes(" 402") ? 402 : 500;
    console.error("generate-stays error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
