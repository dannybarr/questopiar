import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Quest } from "@/data/quests";
import { useProfile, acceptQuest } from "@/lib/store";
import { distanceMiles, formatDistance, formatDuration } from "@/lib/geo";
import { MapPin, Clock, Zap, Users, Sparkles } from "lucide-react";
import { celebrate } from "@/lib/confetti";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function QuestDetailSheet({ quest, open, onOpenChange }: { quest: Quest | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const profile = useProfile();
  const navigate = useNavigate();
  if (!quest) return null;
  const dist = profile.location ? distanceMiles(profile.location, quest) : null;
  const mapsUrl = quest.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${quest.lat},${quest.lng}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-[2rem] border-t-2 border-foreground p-0">
        <div className="relative">
          <img src={quest.image} alt={quest.title} className="h-56 w-full object-cover" />
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="chip bg-primary"><Zap className="h-3.5 w-3.5" strokeWidth={2.5}/> {quest.points} pts</span>
            <span className="chip bg-card">{quest.emoji} {quest.category}</span>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle className="font-display text-3xl">{quest.venue}</SheetTitle>
            <p className="text-sm font-semibold text-muted-foreground">{quest.title}</p>
            <p className="text-xs text-muted-foreground">{quest.city}, {quest.region}</p>
          </SheetHeader>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="chip bg-card"><Clock className="h-3.5 w-3.5"/>{formatDuration(quest.durationMin)}</span>
            {dist !== null && <span className="chip bg-sun"><MapPin className="h-3.5 w-3.5"/>{formatDistance(dist)} away</span>}
            <span className="chip bg-card">Difficulty {"●".repeat(quest.difficulty)}{"○".repeat(3 - quest.difficulty)}</span>
            {quest.pricePerNight && <span className="chip bg-accent text-accent-foreground">£{quest.pricePerNight}/night</span>}
          </div>

          <p className="text-base leading-relaxed">{quest.description}</p>

          {quest.bring && quest.bring.length > 0 && (
            <div>
              <h4 className="font-display text-lg">Bring</h4>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {quest.bring.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {quest.vibes.map((v) => <span key={v} className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">#{v}</span>)}
          </div>

          {quest.websiteUrl && (
            <a
              href={quest.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border-2 border-foreground bg-card p-4 text-center font-bold shadow-sticker-sm"
            >
              🌐 Visit Website
            </a>
          )}

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border-2 border-foreground bg-electric p-4 text-center font-bold shadow-sticker-sm"
          >
            <MapPin className="mr-1 inline h-4 w-4" /> Open in Maps
          </a>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => { navigator.share?.({ title: quest.title, text: quest.blurb, url: mapsUrl }).catch(() => toast("Link copied!")); navigator.clipboard?.writeText(mapsUrl); }}
              className="rounded-2xl border-2 border-foreground bg-card p-4 font-bold shadow-sticker-sm sticker-tap"
            >
              <Users className="mr-1 inline h-4 w-4"/> Bring a mate
            </button>
            <button
              onClick={() => { acceptQuest(quest); celebrate("big"); toast("Quest started! 🚀"); onOpenChange(false); navigate("/active"); }}
              className="rounded-2xl border-2 border-foreground bg-card p-4 font-bold shadow-sticker-sm sticker-tap"
            >
              <Sparkles className="mr-1 inline h-4 w-4"/> Accept
            </button>
          </div>
          <button
            onClick={() => { acceptQuest(quest.id); celebrate("big"); toast("Quest started! 🚀", { description: "Find it in Active." }); onOpenChange(false); navigate("/active"); }}
            className="w-full rounded-2xl border-2 border-foreground bg-primary p-4 font-display text-lg text-primary-foreground shadow-sticker sticker-tap"
          >
            Start Quest
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
