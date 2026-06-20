import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Quest } from "@/data/quests";
import { useProfile, acceptQuest, skipQuest, saveForLater } from "@/lib/store";
import { distanceMiles, formatDistance, formatDuration } from "@/lib/geo";
import { celebrate } from "@/lib/confetti";
import { Heart, X, Bookmark, MapPin, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface Props { quests: Quest[]; onEmpty?: () => void; onTap?: (q: Quest) => void; }

export function QuestSwiper({ quests, onEmpty, onTap }: Props) {
  const profile = useProfile();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const visible = useMemo(() => quests.slice(index, index + 3), [quests, index]);

  const handleAction = (action: "accept" | "skip" | "save", q: Quest) => {
    if (action === "accept") {
      acceptQuest(q.id);
      celebrate("small");
      toast("Quest started! 🚀", { description: q.title });
      navigate("/active");
      return;
    }
    if (action === "skip") { skipQuest(q.id); }
    else { saveForLater(q.id); toast("Saved for later", { description: q.title }); }
    setIndex((i) => {
      const next = i + 1;
      if (next >= quests.length) onEmpty?.();
      return next;
    });
  };

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 text-6xl animate-float">🗺️</div>
        <h3 className="font-display text-2xl">You've seen them all.</h3>
        <p className="mt-2 text-muted-foreground">Try widening your radius or shuffling the deck.</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[540px] w-full max-w-[400px]">
      <AnimatePresence>
        {visible.slice().reverse().map((q, i) => {
          const isTop = i === visible.length - 1;
          const stackIdx = visible.length - 1 - i;
          return (
            <SwipeCard
              key={q.id}
              quest={q}
              isTop={isTop}
              stackIdx={stackIdx}
              userLoc={profile.location}
              onAction={handleAction}
              onTap={() => onTap?.(q)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function SwipeCard({
  quest, isTop, stackIdx, userLoc, onAction, onTap,
}: {
  quest: Quest; isTop: boolean; stackIdx: number;
  userLoc: { lat: number; lng: number } | null;
  onAction: (a: "accept" | "skip" | "save", q: Quest) => void;
  onTap: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-22, 22]);
  const acceptOpacity = useTransform(x, [40, 160], [0, 1]);
  const skipOpacity = useTransform(x, [-160, -40], [1, 0]);
  const saveOpacity = useTransform(y, [-160, -40], [1, 0]);

  const dist = userLoc ? distanceMiles(userLoc, quest) : null;

  const onEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipePower = Math.abs(offset.x) * 0.6 + Math.abs(velocity.x) * 0.2;
    if (offset.y < -120 || velocity.y < -600) onAction("save", quest);
    else if (offset.x > 100 || (offset.x > 60 && swipePower > 200)) onAction("accept", quest);
    else if (offset.x < -100 || (offset.x < -60 && swipePower > 200)) onAction("skip", quest);
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x: isTop ? x : 0, y: isTop ? y : 0, rotate: isTop ? rotate : 0, zIndex: 10 - stackIdx }}
      drag={isTop}
      dragElastic={0.6}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={onEnd}
      initial={{ scale: 1 - stackIdx * 0.05, y: stackIdx * 12, opacity: 1 }}
      animate={{ scale: 1 - stackIdx * 0.05, y: stackIdx * 12, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 600 : x.get() < 0 ? -600 : 0, y: y.get() < 0 ? -600 : 0, opacity: 0, transition: { duration: 0.3 } }}
      whileTap={isTop ? { cursor: "grabbing" } : undefined}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] border-2 border-foreground bg-card shadow-sticker-lg">
        <img src={quest.image} alt={quest.title} className="h-[60%] w-full object-cover" draggable={false} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="chip bg-primary"><Zap className="h-3.5 w-3.5" strokeWidth={2.5}/> {quest.points} pts</span>
          <span className="chip bg-card capitalize">{quest.emoji} {quest.category}</span>
        </div>
        {dist !== null && (
          <span className="chip absolute right-3 top-3 bg-sun"><MapPin className="h-3.5 w-3.5" strokeWidth={2.5}/> {formatDistance(dist)}</span>
        )}

        {/* Stamps */}
        {isTop && (
          <>
            <motion.div style={{ opacity: acceptOpacity }} className="pointer-events-none absolute left-6 top-24 -rotate-12 rounded-xl border-4 border-primary bg-card px-4 py-2 font-display text-2xl text-primary">
              GO!
            </motion.div>
            <motion.div style={{ opacity: skipOpacity }} className="pointer-events-none absolute right-6 top-24 rotate-12 rounded-xl border-4 border-accent bg-card px-4 py-2 font-display text-2xl text-accent">
              NOPE
            </motion.div>
            <motion.div style={{ opacity: saveOpacity }} className="pointer-events-none absolute left-1/2 top-32 -translate-x-1/2 rounded-xl border-4 border-sky bg-card px-4 py-2 font-display text-2xl text-sky">
              SAVE
            </motion.div>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={isTop ? onTap : undefined}
            className="w-full rounded-2xl border-2 border-foreground bg-background/95 p-4 text-left shadow-sticker-sm backdrop-blur"
          >
            <h3 className="font-display text-2xl leading-tight">{quest.venue}</h3>
            <p className="mt-0.5 text-sm font-semibold text-muted-foreground">{quest.city}</p>
            <p className="mt-2 line-clamp-2 text-sm">{quest.blurb}</p>
            <div className="mt-3 flex items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5"/>{formatDuration(quest.durationMin)}</span>
              {quest.vibes.slice(0, 2).map((v) => (
                <span key={v} className="rounded-full bg-muted px-2 py-0.5">#{v}</span>
              ))}
            </div>
          </button>
        </div>
      </div>

      {isTop && (
        <div className="pointer-events-none absolute -bottom-20 left-0 right-0 flex items-center justify-center gap-4">
          <ActionBtn label="Skip" onClick={() => onAction("skip", quest)} className="bg-card text-accent">
            <X className="h-6 w-6" strokeWidth={3}/>
          </ActionBtn>
          <ActionBtn label="Save" onClick={() => onAction("save", quest)} className="bg-sky text-foreground">
            <Bookmark className="h-5 w-5" strokeWidth={3}/>
          </ActionBtn>
          <ActionBtn label="Go" onClick={() => onAction("accept", quest)} className="bg-primary text-primary-foreground">
            <Heart className="h-6 w-6" strokeWidth={3} fill="currentColor"/>
          </ActionBtn>
        </div>
      )}
    </motion.div>
  );
}

function ActionBtn({ children, onClick, className, label }: { children: React.ReactNode; onClick: () => void; className: string; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      aria-label={label}
      className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground shadow-sticker ${className}`}
    >
      {children}
    </motion.button>
  );
}
