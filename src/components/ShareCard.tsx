import { forwardRef } from "react";
import type { Quest } from "@/data/quests";
import type { ActiveQuest } from "@/lib/store";
import { Star } from "lucide-react";

interface Props {
  quest: Quest;
  active: ActiveQuest;
}

/** 1080x1350 sticker-style share card. Rendered offscreen for html-to-image capture. */
export const ShareCard = forwardRef<HTMLDivElement, Props>(({ quest, active }, ref) => {
  const photo = active.photos?.[0]?.url ?? quest.image;
  const rating = active.rating ?? 5;
  const companions = active.companions ?? [];
  return (
    <div
      ref={ref}
      style={{ width: 1080, height: 1350 }}
      className="flex flex-col bg-background"
    >
      <div className="relative h-[820px] w-full overflow-hidden">
        <img src={photo} alt={quest.title} crossOrigin="anonymous" className="h-full w-full object-cover" />
        <div className="absolute right-10 top-10 -rotate-6 rounded-3xl border-4 border-foreground bg-primary px-8 py-4 font-display text-5xl shadow-sticker-lg">
          +{quest.points} PTS
        </div>
        <div className="absolute left-10 top-10 rounded-2xl border-4 border-foreground bg-card px-5 py-3 font-display text-3xl shadow-sticker">
          {quest.emoji} STAMPED
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between border-t-4 border-foreground bg-card p-12">
        <div>
          <h2 className="font-display text-7xl leading-none">{quest.title}</h2>
          <p className="mt-4 font-display text-3xl text-muted-foreground">{quest.venue} · {quest.city}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex gap-2 text-sun">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className={`h-14 w-14 ${i <= rating ? "fill-current" : "opacity-30"}`} strokeWidth={3}/>
              ))}
            </div>
            {companions.length > 0 && (
              <p className="mt-4 font-display text-2xl">with {companions.map((c) => c.name).join(" · ")}</p>
            )}
          </div>
          <div className="rounded-2xl border-4 border-foreground bg-electric px-6 py-3 font-display text-3xl shadow-sticker">
            sidequest
          </div>
        </div>
      </div>
    </div>
  );
});
ShareCard.displayName = "ShareCard";
