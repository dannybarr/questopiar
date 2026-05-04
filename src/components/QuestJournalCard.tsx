import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, Trash2, ChevronDown, Camera, X, Plus, Star, Loader2 } from "lucide-react";
import { Quest } from "@/data/quests";
import {
  ActiveQuest,
  startQuest,
  completeQuest,
  abandonQuest,
  updateQuestNotes,
  addQuestPhoto,
  removeQuestPhoto,
  addCompanion,
  removeCompanion,
  setQuestRating,
} from "@/lib/store";
import { formatDuration } from "@/lib/geo";
import { celebrate } from "@/lib/confetti";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { uploadQuestPhoto, deleteQuestPhoto } from "@/lib/uploadQuestPhoto";
import { toast } from "sonner";

interface Props {
  quest: Quest;
  active: ActiveQuest;
  defaultOpen?: boolean;
  onCompleted?: (q: Quest) => void;
}

export function QuestJournalCard({ quest, active, defaultOpen, onCompleted }: Props) {
  const [open, setOpen] = useState(defaultOpen ?? active.status === "in-progress");
  const [companion, setCompanion] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const noteTimer = useRef<number | null>(null);

  const isDone = active.status === "completed";

  function onNotesChange(v: string) {
    if (noteTimer.current) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => updateQuestNotes(quest.id, v), 250);
  }

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const photo = await uploadQuestPhoto(quest.id, f);
        addQuestPhoto(quest.id, photo);
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't upload photo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removePhoto(photoId: string, path?: string) {
    removeQuestPhoto(quest.id, photoId);
    deleteQuestPhoto(path).catch(() => {});
  }

  function handleCheckIn() {
    completeQuest(quest.id, quest.points, active.rating ?? 5);
    celebrate("big");
    onCompleted?.(quest);
  }

  return (
    <motion.div layout className="overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-sticker">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full text-left">
        <img src={quest.image} alt={quest.title} className="h-28 w-28 flex-shrink-0 object-cover" />
        <div className="flex-1 p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">{quest.emoji}</span>
            <div className="flex-1">
              <h3 className="font-display text-lg leading-tight">{quest.title}</h3>
              <p className="text-xs font-semibold text-muted-foreground">{quest.venue} · {formatDuration(quest.durationMin)}</p>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={3}/>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {active.status === "planned" && (
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-electric px-3 py-1 text-xs font-bold shadow-sticker-sm" onClick={(e) => { e.stopPropagation(); startQuest(quest.id); toast("Quest started! Go!"); setOpen(true); }}>
                <Play className="h-3 w-3" strokeWidth={3}/> Start
              </span>
            )}
            {active.status === "in-progress" && (
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-primary px-3 py-1 text-xs font-bold shadow-sticker-sm" onClick={(e) => { e.stopPropagation(); handleCheckIn(); }}>
                <Check className="h-3 w-3" strokeWidth={3}/> Check in
              </span>
            )}
            <span onClick={(e) => { e.stopPropagation(); abandonQuest(quest.id); }} aria-label="Abandon" className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-2 py-1 text-xs font-bold shadow-sticker-sm">
              <Trash2 className="h-3 w-3"/>
            </span>
            {active.status === "in-progress" && <span className="ml-auto text-xs font-bold text-accent animate-pulse">● LIVE</span>}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t-2 border-foreground"
          >
            <div className="space-y-4 p-4">
              {/* Companions */}
              <section>
                <p className="font-display text-sm">Who was there</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {(active.companions ?? []).map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-2.5 py-1 text-xs font-bold shadow-sticker-sm">
                      @{c.name}
                      <button onClick={() => removeCompanion(quest.id, c.id)} aria-label="Remove"><X className="h-3 w-3"/></button>
                    </span>
                  ))}
                </div>
                <form
                  className="mt-2 flex gap-2"
                  onSubmit={(e) => { e.preventDefault(); addCompanion(quest.id, companion); setCompanion(""); }}
                >
                  <Input value={companion} onChange={(e) => setCompanion(e.target.value)} placeholder="Add a name…" className="h-9 rounded-xl border-2 border-foreground"/>
                  <button type="submit" className="inline-flex items-center gap-1 rounded-xl border-2 border-foreground bg-electric px-3 text-xs font-bold shadow-sticker-sm">
                    <Plus className="h-3 w-3" strokeWidth={3}/> Add
                  </button>
                </form>
                <p className="mt-1 text-[10px] text-muted-foreground">Tag friends — once profiles are live, these become @-mentions.</p>
              </section>

              {/* Notes */}
              <section>
                <p className="font-display text-sm">Notes</p>
                <Textarea
                  defaultValue={active.notes ?? ""}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="How did it go? Any tips for next time?"
                  className="mt-1 min-h-[80px] rounded-2xl border-2 border-foreground"
                />
              </section>

              {/* Photos */}
              <section>
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm">Photos</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-sticker-sm disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin"/> : <Camera className="h-3 w-3" strokeWidth={3}/>} Add
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)}/>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(active.photos ?? []).map((p) => (
                    <div key={p.id} className="relative">
                      <img src={p.url} alt="" className="aspect-square w-full rounded-xl border-2 border-foreground object-cover shadow-sticker-sm"/>
                      <button onClick={() => removePhoto(p.id, p.path)} aria-label="Remove" className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground bg-card text-xs">
                        <X className="h-3 w-3" strokeWidth={3}/>
                      </button>
                    </div>
                  ))}
                  {(active.photos ?? []).length === 0 && (
                    <p className="col-span-3 text-xs text-muted-foreground">No photos yet — add a snap from the day.</p>
                  )}
                </div>
              </section>

              {/* Rating */}
              {(active.status === "in-progress" || isDone) && (
                <section>
                  <p className="font-display text-sm">How was it?</p>
                  <div className="mt-1 flex gap-1">
                    {[1,2,3,4,5].map((i) => {
                      const filled = (active.rating ?? 0) >= i;
                      return (
                        <button key={i} onClick={() => setQuestRating(quest.id, i)} aria-label={`Rate ${i}`}>
                          <Star className={`h-7 w-7 text-sun ${filled ? "fill-current" : "opacity-30"}`} strokeWidth={2.5}/>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
