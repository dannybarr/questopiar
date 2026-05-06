import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ALL_QUESTS, type Quest } from "@/data/quests";
import { useProfile, createMission } from "@/lib/store";
import { distanceMiles, formatDistance } from "@/lib/geo";
import type { Mission, MissionVisibility } from "@/data/missions";
import { ArrowLeft, Search, Lock, Unlock, Sparkles, MapPin } from "lucide-react";
import { toast } from "sonner";
import { celebrate } from "@/lib/confetti";

const GROUP_FRIENDLY_VIBES = new Set(["with-mates", "date-night", "outdoorsy", "wild"]);
const GROUP_CATEGORIES = new Set(["active", "foodie", "nightlife", "water", "nature", "climb", "ride", "chill"]);

const FILTERS = ["All", "Pubs & food", "Activity bars", "Outdoors", "Run & ride", "Nightlife"] as const;
type Filter = typeof FILTERS[number];

const matchFilter = (q: Quest, f: Filter) => {
  if (f === "All") return true;
  if (f === "Pubs & food") return q.category === "foodie";
  if (f === "Activity bars") return q.category === "active" || q.category === "climb";
  if (f === "Outdoors") return q.category === "nature" || q.category === "chill";
  if (f === "Run & ride") return q.category === "ride";
  if (f === "Nightlife") return q.category === "nightlife";
  return true;
};

export function MissionBuilder({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const profile = useProfile();
  const [step, setStep] = useState<"pick" | "compose">("pick");
  const [picked, setPicked] = useState<Quest | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  // compose state
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [visibility, setVisibility] = useState<MissionVisibility>("open");
  const [thePlan, setThePlan] = useState("");

  const reset = () => {
    setStep("pick"); setPicked(null); setFilter("All"); setSearch("");
    setTitle(""); setWhen(""); setCapacity(8); setVisibility("open"); setThePlan("");
  };

  const handleClose = (o: boolean) => { if (!o) reset(); onOpenChange(o); };

  const candidates = useMemo(() => {
    const loc = profile.location;
    const items = ALL_QUESTS
      .filter((q) => GROUP_CATEGORIES.has(q.category) && q.vibes.some((v) => GROUP_FRIENDLY_VIBES.has(v)))
      .filter((q) => matchFilter(q, filter))
      .filter((q) => !search || `${q.title} ${q.venue} ${q.city}`.toLowerCase().includes(search.toLowerCase()))
      .map((q) => ({ q, dist: loc ? distanceMiles(loc, q) : null }));
    const within = items.filter(({ dist }) => profile.radiusMiles >= 9999 || dist === null ? true : dist <= profile.radiusMiles);
    const list = within.length ? within : items; // fall back to all if radius is empty
    return list.sort((a, b) => (a.dist ?? 9999) - (b.dist ?? 9999)).slice(0, 30);
  }, [profile.location, profile.radiusMiles, filter, search]);

  const pick = (q: Quest) => {
    setPicked(q);
    setTitle(`${q.title} — group session`);
    setThePlan(q.description);
    setStep("compose");
  };

  const handleCreate = () => {
    if (!picked) return;
    if (!title.trim() || !when.trim()) { toast.error("Add a title and a time"); return; }
    const mission: Mission = {
      id: `m-custom-${Date.now()}`,
      title: title.trim(),
      emoji: picked.emoji,
      category: "outdoors",
      cover: picked.image,
      city: picked.city,
      region: picked.region,
      lat: picked.lat,
      lng: picked.lng,
      venue: picked.venue,
      when: when.trim(),
      whenISO: new Date().toISOString(),
      visibility,
      capacity,
      owner: { id: "u-me", name: profile.name || "You", avatar: profile.avatar },
      attendees: [],
      vibe: picked.blurb,
      thePlan: thePlan.trim() || picked.description,
      bring: picked.bring,
    };
    createMission(mission);
    celebrate("big");
    toast.success("Mission live!", { description: "Your crew can request to join." });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto rounded-3xl border-2 border-foreground p-0">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-foreground bg-primary p-4">
          {step === "compose" && (
            <button onClick={() => setStep("pick")} className="rounded-full border-2 border-foreground bg-background p-1.5">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <DialogHeader className="flex-1 space-y-0 text-left">
            <DialogTitle className="font-display text-2xl">
              {step === "pick" ? "Build a Mission" : "Set the details"}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-foreground/80">
              {step === "pick" ? "Pick a group-friendly activity to base it on" : `Based on ${picked?.title}`}
            </DialogDescription>
          </DialogHeader>
        </div>

        {step === "pick" && (
          <div className="space-y-3 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pubs, runs, BBQs…"
                className="pl-9 border-2 border-foreground rounded-xl"
              />
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scroll-hide">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`chip whitespace-nowrap ${filter === f ? "bg-foreground text-background" : "bg-card"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            {candidates.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Nothing matches. Try widening your search.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {candidates.map(({ q, dist }) => (
                  <button
                    key={q.id}
                    onClick={() => pick(q)}
                    className="flex gap-3 overflow-hidden rounded-2xl border-2 border-foreground bg-card text-left shadow-sticker-sm transition-transform hover:-translate-y-0.5"
                  >
                    <img src={q.image} alt="" className="h-20 w-24 flex-shrink-0 object-cover" />
                    <div className="min-w-0 flex-1 py-2 pr-2">
                      <p className="line-clamp-1 font-display text-sm leading-tight">{q.emoji} {q.title}</p>
                      <p className="line-clamp-1 text-[11px] text-muted-foreground">{q.venue} · {q.city}</p>
                      {dist !== null && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                          <MapPin className="h-3 w-3" /> {formatDistance(dist)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "compose" && picked && (
          <div className="space-y-4 p-4">
            <div className="overflow-hidden rounded-2xl border-2 border-foreground">
              <img src={picked.image} alt="" className="h-32 w-full object-cover" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide">Mission title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-2 border-foreground rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide">When</label>
                <Input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Sat 2pm" className="border-2 border-foreground rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide">Capacity</label>
                <Input
                  type="number" min={2} max={50}
                  value={capacity}
                  onChange={(e) => setCapacity(Math.max(2, Math.min(50, Number(e.target.value) || 2)))}
                  className="border-2 border-foreground rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide">Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVisibility("open")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border-2 border-foreground p-3 text-sm font-bold ${
                    visibility === "open" ? "bg-primary text-primary-foreground shadow-sticker-sm" : "bg-card"
                  }`}
                >
                  <Unlock className="h-4 w-4" /> Open — anyone joins
                </button>
                <button
                  onClick={() => setVisibility("approval")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border-2 border-foreground p-3 text-sm font-bold ${
                    visibility === "approval" ? "bg-sun shadow-sticker-sm" : "bg-card"
                  }`}
                >
                  <Lock className="h-4 w-4" /> Approval needed
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide">The Plan</label>
              <Textarea
                value={thePlan}
                onChange={(e) => setThePlan(e.target.value)}
                rows={4}
                placeholder="Where to meet, what's the flow, what to bring…"
                className="border-2 border-foreground rounded-xl"
              />
            </div>

            <button
              onClick={handleCreate}
              className="w-full rounded-2xl border-2 border-foreground bg-primary p-4 font-display text-lg text-primary-foreground shadow-sticker sticker-tap"
            >
              <Sparkles className="mr-1 inline h-4 w-4" /> Launch Mission
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
