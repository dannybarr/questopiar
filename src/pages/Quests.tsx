import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QuestSwiper } from "@/components/QuestSwiper";
import { QuestDetailSheet } from "@/components/QuestDetailSheet";
import { ALL_QUESTS, ACTIVITY_QUESTS, STAY_QUESTS, Quest, QuestCategory } from "@/data/quests";
import { useProfile, setProfile, clearSeen } from "@/lib/store";
import { distanceMiles } from "@/lib/geo";
import { useGeneratedQuests } from "@/hooks/useGeneratedQuests";
import { Shuffle, MapPin, Sliders, Sparkles, Loader2 } from "lucide-react";

const CATS: { key: "all" | QuestCategory; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "active", label: "Active", emoji: "💪" },
  { key: "chill", label: "Chill", emoji: "🌿" },
  { key: "water", label: "Water", emoji: "🌊" },
  { key: "climb", label: "Climb", emoji: "🧗" },
  { key: "ride", label: "Ride", emoji: "🚴" },
  { key: "nature", label: "Nature", emoji: "🌄" },
  { key: "nightlife", label: "Night", emoji: "🌃" },
  { key: "foodie", label: "Foodie", emoji: "🍻" },
  { key: "stay", label: "Stays", emoji: "🛏️" },
];

const PROFILE_LABEL: Record<string, string> = {
  urban_dense: "City vibe ⚡",
  urban_fringe: "Edge of town 🌆",
  coastal: "Coastal vibe 🌊",
  countryside: "Countryside vibe 🌿",
  national_park: "Wild vibe 🏔️",
  market_town: "Market town vibe 🏛️",
};

export default function QuestsPage() {
  const profile = useProfile();
  const [cat, setCat] = useState<"all" | QuestCategory>("all");
  const [seed, setSeed] = useState(0);
  const [openQuest, setOpenQuest] = useState<Quest | null>(null);
  const [showRadius, setShowRadius] = useState(false);

  const { quests: aiQuests, loading: aiLoading, profile: areaProfile, town, refresh, error: aiError } = useGeneratedQuests(
    profile.location,
    profile.radiusMiles,
  );

  const deck = useMemo(() => {
    let pool: Quest[];
    if (cat === "stay") {
      pool = STAY_QUESTS;
    } else {
      // Real AI quests first, then seed activity quests as backup
      const ai = aiQuests as Quest[];
      const seedPool = cat === "all" ? ACTIVITY_QUESTS : ACTIVITY_QUESTS.filter((q) => q.category === cat);
      const aiFiltered = cat === "all" ? ai : ai.filter((q) => q.category === cat);
      pool = [...aiFiltered, ...seedPool];
    }
    const filtered = pool.filter((q) => {
      if (profile.seenQuests.includes(q.id)) return false;
      if (q.category === "stay") return true;
      if (!profile.location) return true;
      if (profile.radiusMiles >= 9999) return true;
      return distanceMiles(profile.location, q) <= profile.radiusMiles;
    });
    // dedupe by venue+title
    const seen = new Set<string>();
    const unique = filtered.filter((q) => {
      const k = `${q.venue}|${q.title}`.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
    const a = [...unique];
    let s = seed + 1;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    // Keep AI quests biased to front
    a.sort((x, y) => (x.source === "ai" ? -1 : 1) - (y.source === "ai" ? -1 : 1));
    return a;
  }, [cat, profile, seed, aiQuests]);

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Hey {profile.name || "Quester"} {profile.avatar}</p>
            <h1 className="font-display text-3xl leading-tight">What's the move?</h1>
          </div>
          <button onClick={() => { setSeed((s) => s + 1); refresh(); }} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-sun shadow-sticker-sm sticker-tap" aria-label="Shuffle">
            <Shuffle className="h-5 w-5" strokeWidth={2.5}/>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => setShowRadius((s) => !s)} className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-sticker-sm">
            <MapPin className="h-3.5 w-3.5"/> {profile.location?.name ?? "Set location"}
            <span className="opacity-50">·</span>
            <span>{profile.radiusMiles >= 9999 ? "∞" : `${profile.radiusMiles}mi`}</span>
            <Sliders className="h-3.5 w-3.5"/>
          </button>
          {aiLoading && (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-electric px-3 py-1 text-xs font-bold shadow-sticker-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin"/> Scouting {town || profile.location?.name || "your area"}…
            </span>
          )}
          {!aiLoading && areaProfile && (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sticker-sm">
              <Sparkles className="h-3.5 w-3.5"/> {PROFILE_LABEL[areaProfile] || "Live quests"}
            </span>
          )}
        </div>
        {aiError && (
          <p className="mt-2 text-xs font-semibold text-destructive">Couldn't scout fresh quests: {aiError}. Showing classics.</p>
        )}

        {showRadius && (
          <div className="mt-2 rounded-2xl border-2 border-foreground bg-card p-3 shadow-sticker-sm">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg">{profile.radiusMiles >= 9999 ? "No limit" : `${profile.radiusMiles} miles`}</span>
              <button onClick={() => setProfile({ radiusMiles: profile.radiusMiles >= 9999 ? 25 : 9999 })} className="chip bg-primary text-primary-foreground text-xs">
                {profile.radiusMiles >= 9999 ? "Set range" : "Go infinite"}
              </button>
            </div>
            {profile.radiusMiles < 9999 && (
              <input type="range" min={1} max={200} value={profile.radiusMiles} onChange={(e) => setProfile({ radiusMiles: +e.target.value })} className="mt-2 w-full accent-foreground"/>
            )}
            <button onClick={clearSeen} className="mt-2 text-xs font-semibold underline">Reset seen quests</button>
          </div>
        )}

        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-3 scroll-hide">
          {CATS.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)} className={`chip whitespace-nowrap ${cat === c.key ? "bg-foreground text-background" : "bg-card"}`}>
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 pt-4 pb-32">
        <QuestSwiper
          quests={deck}
          onTap={(q) => setOpenQuest(q)}
          onEmpty={() => {}}
        />
      </div>

      <QuestDetailSheet quest={openQuest} open={!!openQuest} onOpenChange={(o) => !o && setOpenQuest(null)} />
    </AppShell>
  );
}
