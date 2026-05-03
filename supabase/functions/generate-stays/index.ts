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

function unsplashFallback(type: string, name: string, q?: string) {
  const tags = [q, type.replace(/-/g," "), "interior", "stay"].filter(Boolean).join(",").replace(/\s+/g,"-");
  const sig = Math.abs([...(name || type)].reduce((a,c)=>a+c.charCodeAt(0),0)) % 100000;
  return `https://source.unsplash.com/featured/900x700/?${encodeURIComponent(tags)}&sig=${sig}`;
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
  const fb = unsplashFallback(s.type || "boutique-hotel", s.name || "", s.imageQuery);
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
