import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useProfile, startQuest, completeQuest, abandonQuest, ActiveQuest } from "@/lib/store";
import { ALL_QUESTS } from "@/data/quests";
import { formatDuration } from "@/lib/geo";
import { celebrate } from "@/lib/confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, Trash2, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

export default function ActivePage() {
  const profile = useProfile();
  const [celebrating, setCelebrating] = useState<{ title: string; points: number } | null>(null);

  const planned = profile.active.filter((a) => a.status !== "completed");
  const done = profile.active.filter((a) => a.status === "completed");

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <h1 className="font-display text-3xl leading-tight">Active Quests</h1>
        <p className="text-sm text-muted-foreground">{planned.length} on your list · {done.length} stamped</p>
      </header>

      <div className="space-y-3 px-5 pt-4">
        {planned.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-foreground/30 bg-card p-8 text-center">
            <div className="text-4xl">🎯</div>
            <p className="mt-2 font-display text-lg">Nothing accepted yet.</p>
            <p className="text-sm text-muted-foreground">Swipe right on a quest to add it here.</p>
          </div>
        )}
        <AnimatePresence>
          {planned.map((a) => {
            const q = ALL_QUESTS.find((x) => x.id === a.questId);
            if (!q) return null;
            return (
              <motion.div
                key={a.questId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-sticker"
              >
                <div className="flex">
                  <img src={q.image} alt={q.title} className="h-28 w-28 flex-shrink-0 object-cover" />
                  <div className="flex-1 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{q.emoji}</span>
                      <h3 className="font-display text-lg leading-tight">{q.title}</h3>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">{q.venue} · {formatDuration(q.durationMin)}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      {a.status === "planned" && (
                        <button onClick={() => { startQuest(q.id); toast("Quest started! Go!"); }}
                          className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-electric px-3 py-1 text-xs font-bold shadow-sticker-sm">
                          <Play className="h-3 w-3" strokeWidth={3}/> Start
                        </button>
                      )}
                      {a.status === "in-progress" && (
                        <button onClick={() => { completeQuest(q.id, q.points, 5); celebrate("big"); setCelebrating({ title: q.title, points: q.points }); }}
                          className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-primary px-3 py-1 text-xs font-bold shadow-sticker-sm">
                          <Check className="h-3 w-3" strokeWidth={3}/> Check in
                        </button>
                      )}
                      <button onClick={() => abandonQuest(q.id)} aria-label="Abandon"
                        className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-2 py-1 text-xs font-bold shadow-sticker-sm">
                        <Trash2 className="h-3 w-3"/>
                      </button>
                      {a.status === "in-progress" && <span className="ml-auto text-xs font-bold text-accent animate-pulse">● LIVE</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {done.length > 0 && (
          <>
            <h2 className="mt-8 font-display text-xl">Stamped 🏆</h2>
            <div className="grid grid-cols-2 gap-3">
              {done.map((a) => {
                const q = ALL_QUESTS.find((x) => x.id === a.questId);
                if (!q) return null;
                return (
                  <div key={a.questId} className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-sticker-sm">
                    <div className="relative">
                      <img src={q.image} alt={q.title} className="h-24 w-full object-cover opacity-90"/>
                      <div className="absolute right-2 top-2 -rotate-12 rounded-md border-2 border-primary bg-card px-1.5 py-0.5 font-display text-xs text-primary">DONE</div>
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-1 font-display text-sm">{q.title}</p>
                      <p className="text-[10px] text-muted-foreground">+{q.points}pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6">
            <motion.div initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-full max-w-sm rounded-3xl border-2 border-foreground bg-background p-6 text-center shadow-sticker-lg">
              <div className="text-6xl">🎉</div>
              <h3 className="mt-2 font-display text-3xl">Quest Stamped!</h3>
              <p className="mt-1 text-muted-foreground">{celebrating.title}</p>
              <div className="my-4 inline-block -rotate-6 rounded-2xl border-4 border-primary bg-card px-6 py-3 font-display text-3xl text-primary shadow-sticker">
                +{celebrating.points} PTS
              </div>
              <div className="flex justify-center gap-1 text-sun">
                {[1,2,3,4,5].map((i) => <Star key={i} className="h-6 w-6 fill-current"/>)}
              </div>
              <button onClick={() => setCelebrating(null)} className="mt-5 w-full rounded-2xl border-2 border-foreground bg-primary py-3 font-display text-lg shadow-sticker">
                <Sparkles className="mr-1 inline h-4 w-4"/> Onwards
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
