import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useProfile, resetProfile, resolveQuest } from "@/lib/store";
import type { Quest } from "@/data/quests";
import { BADGES } from "@/data/places";
import { Flame, Trophy, MapPin, RotateCcw, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MemorySheet } from "@/components/MemorySheet";

export default function ProfilePage() {
  const profile = useProfile();
  const nav = useNavigate();
  const [memoryQuestId, setMemoryQuestId] = useState<string | null>(null);

  const completed = profile.active.filter((a) => a.status === "completed");

  // 12-week heatmap (84 days)
  const days: { date: string; active: boolean }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    days.push({ date: d, active: profile.completedDays.includes(d) });
  }

  const earnedBadges = new Set<string>();
  if (completed.length >= 1) earnedBadges.add("first-quest");
  if (profile.streak >= 5) earnedBadges.add("streak-5");

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <div className="rounded-3xl border-2 border-foreground bg-electric p-5 shadow-sticker-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-foreground bg-card text-5xl shadow-sticker-sm">
              {profile.avatar}
            </div>
            <div>
              <h1 className="font-display text-3xl leading-tight">{profile.name || "Quester"}</h1>
              <p className="inline-flex items-center gap-1 text-sm font-semibold"><MapPin className="h-3.5 w-3.5"/> {profile.location?.name ?? "No location"}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2 px-5 pt-4">
        <Stat label="Points" value={profile.points} icon={<Trophy className="h-4 w-4"/>} accent="bg-sun"/>
        <Stat label="Streak" value={`${profile.streak}d`} icon={<Flame className="h-4 w-4"/>} accent="bg-accent text-accent-foreground"/>
        <Stat label="Done" value={completed.length} icon={<span>🎯</span>} accent="bg-primary"/>
      </section>

      <section className="px-5 pt-5">
        <h2 className="font-display text-lg">Streak heatmap</h2>
        <div className="mt-2 rounded-2xl border-2 border-foreground bg-card p-3 shadow-sticker-sm">
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {days.map((d) => (
              <div key={d.date} className={`h-3.5 w-3.5 rounded-sm border ${d.active ? "border-foreground bg-primary" : "border-foreground/20 bg-muted"}`} title={d.date}/>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <h2 className="font-display text-lg">Passport</h2>
        {completed.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Stamps appear here when you finish a quest.</p>
        ) : (
          <div className="mt-2 grid grid-cols-3 gap-3">
            {completed.map((a, i) => {
              const q = resolveQuest(a.questId);
              if (!q) return null;
              const rot = (i * 137) % 11 - 5;
              return (
                <div key={a.questId} style={{ transform: `rotate(${rot}deg)` }}
                  className="aspect-square rounded-2xl border-4 border-primary bg-card p-2 text-center shadow-sticker-sm">
                  <div className="text-3xl">{q.emoji}</div>
                  <p className="mt-1 line-clamp-2 font-display text-[11px] leading-tight">{q.title}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-5 pt-5">
        <h2 className="font-display text-lg">Memories</h2>
        {(() => {
          const memories = [...completed].sort(
            (a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0),
          );
          if (memories.length === 0) {
            return <p className="mt-1 text-sm text-muted-foreground">Complete a quest and it'll show up here automatically — with your photos, notes and friends.</p>;
          }
          return (
            <div className="mt-2 space-y-2">
              {memories.map((a) => {
                const q = resolveQuest(a.questId);
                if (!q) return null;
                const hero = a.photos?.[0]?.url ?? q.image;
                const noteExcerpt = a.notes?.slice(0, 80);
                return (
                  <button key={a.questId} onClick={() => setMemoryQuestId(a.questId)}
                    className="flex w-full gap-3 rounded-2xl border-2 border-foreground bg-card p-2 text-left shadow-sticker-sm sticker-tap">
                    <img src={hero} alt={q.title} className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"/>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-display text-sm leading-tight">{q.emoji} {q.title}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={`h-3 w-3 text-sun ${(a.rating ?? 0) >= i ? "fill-current" : "opacity-30"}`} strokeWidth={2.5}/>
                        ))}
                        {a.companions && a.companions.length > 0 && (
                          <span className="ml-2 text-[10px] font-semibold text-muted-foreground">+{a.companions.length} 👥</span>
                        )}
                        {a.photos && a.photos.length > 0 && (
                          <span className="ml-1 text-[10px] font-semibold text-muted-foreground">📷 {a.photos.length}</span>
                        )}
                      </div>
                      {noteExcerpt && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{noteExcerpt}{a.notes && a.notes.length > 80 ? "…" : ""}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </section>

      <section className="px-5 pt-5 pb-2">
        <h2 className="font-display text-lg">Badges</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {BADGES.map((b) => {
            const earned = earnedBadges.has(b.id);
            return (
              <div key={b.id} className={`rounded-2xl border-2 border-foreground bg-card p-3 text-center shadow-sticker-sm ${earned ? "" : "opacity-30 grayscale"}`}>
                <div className="text-2xl">{b.emoji}</div>
                <p className="mt-1 font-display text-xs leading-tight">{b.title}</p>
                <p className="text-[10px] text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-2 px-5 py-5">
        <button onClick={() => nav("/onboarding")} className="w-full rounded-2xl border-2 border-foreground bg-card px-4 py-3 text-left font-bold shadow-sticker-sm sticker-tap">
          <MapPin className="mr-1 inline h-4 w-4"/> Edit location & radius
        </button>
        <button onClick={() => { if (confirm("Reset all demo data?")) { resetProfile(); nav("/onboarding"); } }}
          className="w-full rounded-2xl border-2 border-foreground bg-card px-4 py-3 text-left font-bold shadow-sticker-sm sticker-tap">
          <RotateCcw className="mr-1 inline h-4 w-4"/> Reset demo
        </button>
      </section>

      <MemorySheet
        open={!!memoryQuestId}
        onOpenChange={(o) => !o && setMemoryQuestId(null)}
        quest={memoryQuestId ? resolveQuest(memoryQuestId) ?? null : null}
        active={memoryQuestId ? profile.active.find((a) => a.questId === memoryQuestId) ?? null : null}
      />
    </AppShell>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className={`rounded-2xl border-2 border-foreground p-3 shadow-sticker-sm ${accent}`}>
      <div className="flex items-center gap-1 text-xs font-bold opacity-80">{icon}{label}</div>
      <div className="font-display text-3xl leading-none mt-1 font-numeric">{value}</div>
    </div>
  );
}
