import { useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Star, Share2, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import type { Quest } from "@/data/quests";
import type { ActiveQuest } from "@/lib/store";
import { ShareCard } from "./ShareCard";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quest: Quest | null;
  active: ActiveQuest | null;
}

export function MemorySheet({ open, onOpenChange, quest, active }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  if (!quest || !active) return null;
  const rating = active.rating ?? 0;

  async function share() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 1, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${quest!.id}-memory.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: quest!.title });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl; a.download = file.name; a.click();
        toast.success("Memory card downloaded");
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate share card");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-3xl border-t-4 border-foreground p-0">
        <SheetHeader className="sr-only"><SheetTitle>{quest.title}</SheetTitle></SheetHeader>
        <div className="relative">
          <img src={active.photos?.[0]?.url ?? quest.image} alt={quest.title} className="h-56 w-full object-cover" />
          <div className="absolute right-4 top-4 -rotate-6 rounded-xl border-2 border-foreground bg-primary px-3 py-1 font-display text-sm shadow-sticker-sm">
            +{quest.points} PTS
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{quest.emoji}</span>
            <h2 className="font-display text-2xl leading-tight">{quest.title}</h2>
          </div>
          <p className="text-xs font-semibold text-muted-foreground">{quest.venue} · {quest.city}</p>

          {rating > 0 && (
            <div className="mt-3 flex gap-1 text-sun">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className={`h-5 w-5 ${i <= rating ? "fill-current" : "opacity-30"}`} strokeWidth={2.5}/>
              ))}
            </div>
          )}

          {active.companions && active.companions.length > 0 && (
            <div className="mt-4">
              <p className="font-display text-sm">Who was there</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {active.companions.map((c) => (
                  <span key={c.id} className="rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-sticker-sm">@{c.name}</span>
                ))}
              </div>
            </div>
          )}

          {active.notes && (
            <div className="mt-4">
              <p className="font-display text-sm">Notes</p>
              <p className="mt-1 whitespace-pre-wrap rounded-2xl border-2 border-foreground bg-card p-3 text-sm shadow-sticker-sm">{active.notes}</p>
            </div>
          )}

          {active.photos && active.photos.length > 1 && (
            <div className="mt-4">
              <p className="font-display text-sm">Photos</p>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {active.photos.map((p) => (
                  <img key={p.id} src={p.url} alt="" className="aspect-square w-full rounded-xl border-2 border-foreground object-cover shadow-sticker-sm"/>
                ))}
              </div>
            </div>
          )}

          <Button onClick={share} disabled={busy} className="mt-6 w-full rounded-2xl border-2 border-foreground bg-electric font-display text-base shadow-sticker">
            {busy ? <><Download className="mr-2 h-4 w-4"/>Generating…</> : <><Share2 className="mr-2 h-4 w-4"/>Share memory card</>}
          </Button>
        </div>

        {/* Offscreen render target for html-to-image */}
        <div style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }} aria-hidden>
          <ShareCard ref={cardRef} quest={quest} active={active}/>
        </div>
      </SheetContent>
    </Sheet>
  );
}
