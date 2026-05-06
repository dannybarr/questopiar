import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DISCOVER_POSTS } from "@/data/discover";
import { MOCK_MISSIONS, type Mission } from "@/data/missions";
import { ALL_QUESTS, type Quest } from "@/data/quests";
import { useProfile, toggleUpvote } from "@/lib/store";
import { distanceMiles, formatDistance } from "@/lib/geo";
import { MissionSheet } from "@/components/MissionSheet";
import { QuestDetailSheet } from "@/components/QuestDetailSheet";
import { motion } from "framer-motion";
import { ArrowUp, MessageCircle, Star, Target, Flame, Lock, Unlock, MapPin, Clock, CheckCircle2 } from "lucide-react";

// Deterministic mock completion count per quest (200–4000)
const completionsFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 200 + (h % 3800);
};
const fmtCompletions = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

const TABS = ["All", "Activities", "Stays", "Missions"] as const;
type Tab = typeof TABS[number];

export default function DiscoverPage() {
  const profile = useProfile();
  const [tab, setTab] = useState<Tab>("All");
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [openQuest, setOpenQuest] = useState<Quest | null>(null);

  const trending = ALL_QUESTS.slice(0, 6);

  const missions = useMemo(() => {
    const loc = profile.location;
    const items = MOCK_MISSIONS.map((m) => ({
      m,
      dist: loc ? distanceMiles(loc, m) : null,
    }));
    const within = items.filter(({ dist }) =>
      profile.radiusMiles >= 9999 || dist === null ? true : dist <= profile.radiusMiles,
    );
    return within.sort((a, b) => {
      if (a.dist !== null && b.dist !== null && a.dist !== b.dist) return a.dist - b.dist;
      return a.m.whenISO.localeCompare(b.m.whenISO);
    });
  }, [profile.location, profile.radiusMiles]);

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <h1 className="font-display text-3xl leading-tight">Discover</h1>
        <p className="text-sm text-muted-foreground">What people are doing right now.</p>
        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2 scroll-hide">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`chip whitespace-nowrap ${tab === t ? "bg-foreground text-background" : "bg-card"}`}>{t}</button>
          ))}
        </div>
      </header>

      {/* Trending */}
      <section className="pt-2">
        <h2 className="px-5 font-display text-lg flex items-center gap-1.5"><Flame className="h-4 w-4 text-accent"/> Trending this week</h2>
        <div className="-mx-1 mt-2 flex gap-3 overflow-x-auto px-5 pb-3 scroll-hide">
          {trending.map((q) => {
            const n = completionsFor(q.id);
            return (
              <button
                key={q.id}
                onClick={() => setOpenQuest(q)}
                className="w-40 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-foreground bg-card text-left shadow-sticker-sm transition-transform hover:-translate-y-0.5 sticker-tap"
              >
                <img src={q.image} alt={q.title} className="h-24 w-full object-cover" />
                <div className="space-y-1 p-2">
                  <p className="line-clamp-2 font-display text-sm leading-tight">{q.emoji} {q.title}</p>
                  <p className="text-[10px] text-muted-foreground">{q.city}</p>
                  <p className="flex items-center gap-1 text-[10px] font-bold text-primary">
                    <CheckCircle2 className="h-3 w-3" /> {fmtCompletions(n)} completions
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Missions */}
      {(tab === "All" || tab === "Missions") && (
        <section className="space-y-3 px-5 pt-3">
          <div>
            <h2 className="font-display text-lg flex items-center gap-1.5">
              <Target className="h-4 w-4" /> Missions
            </h2>
            <p className="text-xs text-muted-foreground">
              Group side-quests near {profile.location?.name ?? "you"}. Hop in or pitch your own.
            </p>
          </div>

          {missions.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-foreground/30 bg-card p-6 text-center text-sm text-muted-foreground">
              No missions near {profile.location?.name ?? "you"} yet — try widening your radius.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {missions.map(({ m, dist }) => {
              const joined = profile.joinedMissions.includes(m.id);
              const requested = profile.requestedMissions.includes(m.id);
              const goingCount = m.attendees.filter((a) => a.status === "going").length + (joined ? 1 : 0);
              const spotsLeft = Math.max(0, m.capacity - goingCount);
              const isOpen = m.visibility === "open";
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMission(m)}
                  className="group overflow-hidden rounded-2xl border-2 border-foreground bg-card text-left shadow-sticker-sm transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative h-32">
                    <img src={m.cover} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                    <div className="absolute left-2 top-2 flex gap-1.5">
                      <span className="chip bg-card text-xs">{m.emoji} {m.category}</span>
                      <span
                        className={`chip text-xs ${
                          isOpen ? "bg-primary text-primary-foreground" : "bg-sun"
                        }`}
                      >
                        {isOpen ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {isOpen ? "Open" : "Approval"}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-3 right-3 text-background">
                      <h3 className="font-display text-xl leading-tight">{m.title}</h3>
                      <p className="text-[11px] opacity-90">{m.venue} · {m.city}</p>
                    </div>
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="chip bg-background text-[11px]">
                        <Clock className="h-3 w-3" /> {m.when}
                      </span>
                      {dist !== null && (
                        <span className="chip bg-background text-[11px]">
                          <MapPin className="h-3 w-3" /> {formatDistance(dist)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-foreground bg-background text-xs">
                          {m.owner.avatar}
                        </span>
                        {m.attendees.slice(0, 4).map((a) => (
                          <span
                            key={a.id}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-foreground bg-background text-xs"
                          >
                            {a.avatar}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {spotsLeft} spots left
                      </span>
                    </div>
                    {(joined || requested) && (
                      <p className="text-[11px] font-bold text-primary">
                        {joined ? "You're going ✓" : "Request pending…"}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <MissionSheet
        mission={activeMission}
        open={!!activeMission}
        onOpenChange={(o) => !o && setActiveMission(null)}
      />

      {/* Reviews feed */}
      {(tab === "All" || tab === "Activities" || tab === "Stays") && (
        <section className="space-y-3 px-5 pt-4 pb-4">
          <h2 className="font-display text-lg">Latest reviews</h2>
          {DISCOVER_POSTS
            .filter((p) => {
              if (tab === "Stays") return p.questId.startsWith("s-");
              if (tab === "Activities") return p.questId.startsWith("q-");
              return true;
            })
            .map((p) => {
              const upvoted = profile.upvoted.includes(p.id);
              return (
                <article key={p.id} className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-sticker-sm">
                  <img src={p.image} alt={p.questTitle} className="h-44 w-full object-cover"/>
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground bg-background text-lg">{p.user.avatar}</span>
                      <div>
                        <p className="text-sm font-bold">{p.user.name} · <span className="font-normal text-muted-foreground">{p.daysAgo}d ago</span></p>
                        <p className="font-display text-base leading-tight">{p.questTitle}</p>
                      </div>
                      <div className="ml-auto flex text-sun">
                        {Array.from({ length: p.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current"/>)}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{p.review}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleUpvote(p.id)}
                        className={`inline-flex items-center gap-1 rounded-full border-2 border-foreground px-3 py-1 text-xs font-bold shadow-sticker-sm ${upvoted ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                        <ArrowUp className="h-3.5 w-3.5" strokeWidth={3}/> {p.upvotes + (upvoted ? 1 : 0)}
                      </motion.button>
                      <span className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-sticker-sm">
                        <MessageCircle className="h-3.5 w-3.5"/> {p.comments}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
        </section>
      )}
    </AppShell>
  );
}
