import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { QuestJournalCard } from "@/components/QuestJournalCard";
import { SavedQuestRow } from "@/components/SavedQuestRow";
import { MemorySheet } from "@/components/MemorySheet";
import { useProfile, resolveQuest } from "@/lib/store";
import type { Quest } from "@/data/quests";

export default function ActivePage() {
  const profile = useProfile();
  const [celebrating, setCelebrating] = useState<{ title: string; points: number } | null>(null);
  const [memoryQuest, setMemoryQuest] = useState<Quest | null>(null);

  const activeList = profile.active.filter((a) => a.status !== "completed");
  const savedList = profile.savedQuests
    .map((id) => resolveQuest(id))
    .filter((q): q is Quest => Boolean(q))
    // hide saved quests already promoted to active
    .filter((q) => !profile.active.some((a) => a.questId === q.id));

  const lastCompleted = profile.active.filter((a) => a.status === "completed").slice(-1)[0];
  const lastQuest = lastCompleted ? resolveQuest(lastCompleted.questId) : null;

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <h1 className="font-display text-3xl leading-tight">Active</h1>
        <p className="text-sm text-muted-foreground">{activeList.length} on your list · {savedList.length} saved</p>
      </header>

      <section className="space-y-3 px-5 pt-4">
        {activeList.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-foreground/30 bg-card p-8 text-center">
            <div className="text-4xl">🎯</div>
            <p className="mt-2 font-display text-lg">Nothing active yet.</p>
            <p className="text-sm text-muted-foreground">Swipe right on a quest to add it here.</p>
          </div>
        )}
        <AnimatePresence>
          {activeList.map((a) => {
            const q = ALL_QUESTS.find((x) => x.id === a.questId);
            if (!q) return null;
            return (
              <motion.div key={a.questId} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}>
                <QuestJournalCard
                  quest={q}
                  active={a}
                  onCompleted={(quest) => {
                    setCelebrating({ title: quest.title, points: quest.points });
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>

      <section className="px-5 pt-8">
        <h2 className="font-display text-xl">Saved</h2>
        {savedList.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Saved quests show up here. Swipe down on a quest card to save it for later.</p>
        ) : (
          <div className="mt-2 space-y-2">
            <AnimatePresence>
              {savedList.map((q) => (
                <motion.div key={q.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 100 }}>
                  <SavedQuestRow quest={q}/>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <div className="h-8"/>

      <AnimatePresence>
        {celebrating && lastQuest && (
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
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setCelebrating(null); setMemoryQuest(lastQuest); }}
                  className="rounded-2xl border-2 border-foreground bg-electric py-3 font-display text-base shadow-sticker-sm sticker-tap"
                >
                  Share
                </button>
                <button onClick={() => setCelebrating(null)} className="rounded-2xl border-2 border-foreground bg-primary py-3 font-display text-base shadow-sticker-sm sticker-tap">
                  <Sparkles className="mr-1 inline h-4 w-4"/> Onwards
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MemorySheet
        open={!!memoryQuest}
        onOpenChange={(o) => !o && setMemoryQuest(null)}
        quest={memoryQuest}
        active={memoryQuest ? profile.active.find((a) => a.questId === memoryQuest.id) ?? null : null}
      />
    </AppShell>
  );
}
