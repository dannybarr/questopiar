// Geocoding proxy using OpenStreetMap Nominatim (no API key required)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UA = "SideQuest/1.0 (https://lovable.app)";

interface Place {
  name: string;
  region: string;
  lat: number;
  lng: number;
}

const cache = new Map<string, { ts: number; data: any }>();
const TTL = 5 * 60 * 1000;

function cacheGet(k: string) {
  const v = cache.get(k);
  if (!v) return null;
  if (Date.now() - v.ts > TTL) {
    cache.delete(k);
    return null;
  }
  return v.data;
}
function cacheSet(k: string, data: any) {
  cache.set(k, { ts: Date.now(), data });
  if (cache.size > 200) cache.delete(cache.keys().next().value);
}

function pickName(addr: any, fallback: string): string {
  return (
    addr?.village ||
    addr?.town ||
    addr?.city ||
    addr?.suburb ||
    addr?.neighbourhood ||
    addr?.hamlet ||
    addr?.municipality ||
    addr?.county ||
    fallback
  );
}
function pickRegion(addr: any): string {
  return (
    addr?.county ||
    addr?.state_district ||
    addr?.state ||
    addr?.region ||
    addr?.country ||
    ""
  );
}

async function forward(q: string): Promise<Place[]> {
  const key = `f:${q.toLowerCase()}`;
  const hit = cacheGet(key);
  if (hit) return hit;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("countrycodes", "gb");
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-GB" } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const arr = (await res.json()) as any[];
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const r of arr) {
    const name = pickName(r.address, r.name || r.display_name?.split(",")[0] || "");
    const region = pickRegion(r.address);
    const sig = `${name}|${region}`;
    if (seen.has(sig) || !name) continue;
    seen.add(sig);
    out.push({ name, region, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
  }
  cacheSet(key, out);
  return out;
}

async function reverse(lat: number, lng: number): Promise<Place | null> {
  const key = `r:${lat.toFixed(4)},${lng.toFixed(4)}`;
  const hit = cacheGet(key);
  if (hit) return hit;
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "12");
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-GB" } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const r = (await res.json()) as any;
  if (!r || r.error) return null;
  const place: Place = {
    name: pickName(r.address, r.display_name?.split(",")[0] || "Near me"),
    region: pickRegion(r.address),
    lat,
    lng,
  };
  cacheSet(key, place);
  return place;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    let q = "";
    let lat: number | null = null;
    let lng: number | null = null;

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      q = (body?.q || "").toString().trim();
      if (typeof body?.lat === "number") lat = body.lat;
      if (typeof body?.lng === "number") lng = body.lng;
    } else {
      const u = new URL(req.url);
      q = (u.searchParams.get("q") || "").trim();
      const la = u.searchParams.get("lat");
      const ln = u.searchParams.get("lng");
      if (la) lat = parseFloat(la);
      if (ln) lng = parseFloat(ln);
    }

    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      const place = await reverse(lat, lng);
      return new Response(JSON.stringify({ place }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (q.length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await forward(q);
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "geocode failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
