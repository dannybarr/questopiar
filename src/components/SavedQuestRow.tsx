import { Quest } from "@/data/quests";
import { moveSavedToActive, removeSaved } from "@/lib/store";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function SavedQuestRow({ quest }: { quest: Quest }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-card p-2 shadow-sticker-sm">
      <img src={quest.image} alt={quest.title} className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"/>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 font-display text-sm leading-tight">{quest.emoji} {quest.title}</p>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">{quest.venue}</p>
      </div>
      <button
        onClick={() => { moveSavedToActive(quest); toast.success("Quest started!"); navigate("/active"); }}
        className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-electric px-3 py-1 text-xs font-bold shadow-sticker-sm sticker-tap"
      >
        <Plus className="h-3 w-3" strokeWidth={3}/> Active
      </button>
      <button
        onClick={() => removeSaved(quest.id)}
        aria-label="Remove"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-foreground bg-card text-xs font-bold shadow-sticker-sm sticker-tap"
      >
        <X className="h-3 w-3" strokeWidth={3}/>
      </button>
    </div>
  );
}
