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

async function callAI(messages: any[], tools?: any[], tool_choice?: any) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, ...(tools ? { tools, tool_choice } : {}) }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI ${res.status}: ${txt}`);
  }
  return res.json();
}

const CATEGORY_TAGS: Record<string, string> = {
  active: "sport,fitness,activity",
  chill: "cozy,relax,lounge",
  foodie: "restaurant,food,dining",
  water: "water,swimming,beach",
  climb: "climbing,bouldering",
  ride: "cycling,skateboarding",
  nightlife: "bar,nightlife,cocktail",
  nature: "landscape,nature,outdoors",
};

function imageFor(category: string, _city: string, venue: string, imageKeyword?: string) {
  // Use the model's imageKeyword (most specific) + category tags for reliable, on-brief photos.
  const kw = (imageKeyword || venue || category)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(",");
  const tags = [kw, CATEGORY_TAGS[category] || category].filter(Boolean).join(",");
  // Loremflickr returns a real Flickr photo matching the tags. Seeded so each quest is stable.
  const seed = Math.abs([...(venue || kw)].reduce((a, c) => a + c.charCodeAt(0), 0));
  return `https://loremflickr.com/900/700/${encodeURIComponent(tags)}?lock=${seed}`;
}

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
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const start = value.indexOf("[");
    const end = value.lastIndexOf("]");
    if (start >= 0 && end > start) {
      const parsed = JSON.parse(value.slice(start, end + 1));
      return Array.isArray(parsed) ? parsed : [];
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat, lng, radiusMiles, count = 12, locationName }: ReqBody = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(JSON.stringify({ error: "lat/lng required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Step 1: classify place + name town
    const profileResp = await callAI(
      [
        { role: "system", content: "You classify UK locations. Reply ONLY with JSON {\"profile\":one of [urban_dense,urban_fringe,coastal,countryside,national_park,market_town], \"town\":string, \"region\":string}. No prose." },
        { role: "user", content: `Coords ${lat},${lng}${locationName ? ` (user said: ${locationName})` : ""}. Classify the area within ~${radiusMiles} miles.` },
      ],
    );
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

    // Step 2: generate quests via tool calling
    const tools = [{
      type: "function",
      function: {
        name: "return_quests",
        description: "Return a varied list of real local Side Quests.",
        parameters: {
          type: "object",
          properties: {
            questsJson: {
              type: "string",
              description: "A JSON array string of quest objects. Each object must include title, venue, city, region, address, lat, lng, category, blurb, description, durationMin, randomness, difficulty, vibes, and imageKeyword. Category must be exactly one of: active, chill, foodie, water, climb, ride, nightlife, nature.",
            },
          },
          required: ["questsJson"],
        },
      },
    }];

    const sys = `You are a UK local-adventure curator who knows real venues. The user is near ${town}, ${region} (${lat},${lng}), within ${radiusMiles} miles. Area type: ${profile} — ${guide}

RULES:
- Use ONLY real, currently-operating venues you are confident exist.
- Maximise VARIETY: spread across at least 5 different categories. Never repeat the same vibe twice in a row.
- Mix iconic with hidden-gem.
- Each must be doable today/this week.
- Approximate lat/lng of the venue.
- Vary durations from 30 min to 4 hrs.
- Be specific (real bar names, real hike names, real museums).
Return EXACTLY ${count} quests via the return_quests tool. Set questsJson to a valid JSON array string only.`;

    const questsResp = await callAI(
      [
        { role: "system", content: sys },
        { role: "user", content: `Give me ${count} varied side quests near ${town}.` },
      ],
      tools,
      { type: "function", function: { name: "return_quests" } },
    );

    if (questsResp.error || questsResp.choices?.[0]?.finish_reason === "error") {
      throw new Error(JSON.stringify(questsResp));
    }

    const call = questsResp.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : { quests: [] };
    let raw = Array.isArray(args.quests) ? args.quests : [];
    if (!raw.length) raw = parseQuestArray(args.questsJson);

    const quests = raw.map((q, i) => {
      const cat = normalizeCategory(q.category, q.imageKeyword, q.vibes || []);
      const imgKw = q.imageKeyword || `${cat} ${q.venue}`;
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
        image: imageFor(cat, q.city || town, q.venue || "", imgKw),
        blurb: q.blurb || `A real-world ${cat} quest near ${town}.`,
        description: q.description || `Head to ${q.venue || "this local spot"} for a varied side quest in the area. Check opening times before you go.`,
        durationMin: typeof q.durationMin === "number" ? q.durationMin : 90,
        difficulty: typeof q.difficulty === "number" ? q.difficulty : 1,
        randomness: typeof q.randomness === "number" ? q.randomness : 3,
        points: computePoints(q.randomness, q.durationMin),
        vibes: q.vibes || [],
        source: "ai",
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q.venue + ", " + (q.city||town))}`,
      };
    });

    return new Response(JSON.stringify({ profile, town, region, quests }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    const status = msg.includes(" 429") ? 429 : msg.includes(" 402") ? 402 : 500;
    console.error("generate-quests error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
