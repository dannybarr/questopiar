import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DISCOVER_POSTS } from "@/data/discover";
import { MOCK_MISSIONS, type Mission } from "@/data/missions";
import { ALL_QUESTS } from "@/data/quests";
import { useProfile, toggleUpvote } from "@/lib/store";
import { distanceMiles, formatDistance } from "@/lib/geo";
import { MissionSheet } from "@/components/MissionSheet";
import { motion } from "framer-motion";
import { ArrowUp, MessageCircle, Star, Target, Flame, Lock, Unlock, MapPin, Clock } from "lucide-react";

const TABS = ["All", "Activities", "Stays", "Missions"] as const;
type Tab = typeof TABS[number];

export default function DiscoverPage() {
  const profile = useProfile();
  const [tab, setTab] = useState<Tab>("All");
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

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
          {trending.map((q) => (
            <div key={q.id} className="w-40 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-sticker-sm">
              <img src={q.image} alt={q.title} className="h-24 w-full object-cover"/>
              <div className="p-2">
                <p className="line-clamp-2 font-display text-sm leading-tight">{q.emoji} {q.title}</p>
                <p className="text-[10px] text-muted-foreground">{q.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Groups */}
      {(tab === "All" || tab === "Groups") && (
        <section className="space-y-3 px-5 pt-3">
          <h2 className="font-display text-lg flex items-center gap-1.5"><Users className="h-4 w-4"/> Open groups</h2>
          {GROUPS.map((g) => {
            const joined = profile.joinedGroups.includes(g.id);
            return (
              <div key={g.id} className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-sticker">
                <div className="relative h-28">
                  <img src={g.cover} alt="" className="h-full w-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent"/>
                  <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between text-background">
                    <div>
                      <h3 className="font-display text-2xl leading-none">{g.emoji} {g.name}</h3>
                      <p className="text-xs opacity-90">{g.vibe}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <div className="flex -space-x-2">
                      {g.avatars.map((a, i) => (
                        <span key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-foreground bg-background text-sm">{a}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs"><span className="font-bold">Next:</span> {g.activeQuest.title} · <span className="text-muted-foreground">{g.activeQuest.when}</span></p>
                  </div>
                  <button onClick={() => toggleGroup(g.id)} className={`chip ${joined ? "bg-card" : "bg-primary text-primary-foreground"}`}>
                    {joined ? "Joined ✓" : "Join the chaos"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

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
