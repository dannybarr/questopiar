import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Mission } from "@/data/missions";
import {
  useProfile,
  joinMission,
  requestJoinMission,
  leaveMission,
  cancelMissionRequest,
} from "@/lib/store";
import { distanceMiles, formatDistance } from "@/lib/geo";
import { MapPin, Clock, Users, Lock, Unlock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function MissionSheet({
  mission,
  open,
  onOpenChange,
}: {
  mission: Mission | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const profile = useProfile();
  if (!mission) return null;

  const dist = profile.location ? distanceMiles(profile.location, mission) : null;
  const joined = profile.joinedMissions.includes(mission.id);
  const requested = profile.requestedMissions.includes(mission.id);
  const isOpenMission = mission.visibility === "open";
  const goingCount = mission.attendees.filter((a) => a.status === "going").length + (joined ? 1 : 0);
  const spotsLeft = Math.max(0, mission.capacity - goingCount);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mission.lat},${mission.lng}`;

  const handlePrimary = () => {
    if (joined) {
      leaveMission(mission.id);
      toast("Left the mission");
      return;
    }
    if (requested) {
      cancelMissionRequest(mission.id);
      toast("Request cancelled");
      return;
    }
    if (isOpenMission) {
      joinMission(mission.id);
      toast.success("You're in!", { description: "See you there." });
    } else {
      requestJoinMission(mission.id);
      toast.success("Request sent", { description: `${mission.owner.name} will approve soon.` });
    }
  };

  const ctaLabel = joined
    ? "You're going ✓ — Leave"
    : requested
    ? "Request pending — Cancel"
    : isOpenMission
    ? "Join mission"
    : "Request to Join";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-[2rem] border-t-2 border-foreground p-0"
      >
        {/* Hero */}
        <div className="relative">
          <img src={mission.cover} alt={mission.title} className="h-56 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="chip bg-card">{mission.emoji} {mission.category}</span>
            <span
              className={`chip ${isOpenMission ? "bg-primary text-primary-foreground" : "bg-sun"}`}
            >
              {isOpenMission ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {isOpenMission ? "Open" : "Approval"}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5 pb-28">
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle className="font-display text-3xl leading-tight">{mission.title}</SheetTitle>
            <p className="text-sm font-semibold text-muted-foreground">
              {mission.venue} · {mission.city}, {mission.region}
            </p>
          </SheetHeader>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="chip bg-card">
              <Clock className="h-3.5 w-3.5" />
              {mission.when}
            </span>
            {dist !== null && (
              <span className="chip bg-sun">
                <MapPin className="h-3.5 w-3.5" />
                {formatDistance(dist)} away
              </span>
            )}
            {mission.costPP && <span className="chip bg-accent text-accent-foreground">{mission.costPP}</span>}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="chip bg-card hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Maps
            </a>
          </div>

          {/* The Plan */}
          <section className="space-y-2 rounded-2xl border-2 border-foreground bg-card p-4 shadow-sticker-sm">
            <h3 className="font-display text-xl">The Plan</h3>
            <p className="text-sm leading-relaxed">{mission.thePlan}</p>
            {mission.bring && mission.bring.length > 0 && (
              <div className="pt-1">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bring</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {mission.bring.map((b) => (
                    <span key={b} className="chip bg-background">{b}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Crew */}
          <section className="space-y-3 rounded-2xl border-2 border-foreground bg-card p-4 shadow-sticker-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Crew
              </h3>
              <span className="text-xs font-bold text-muted-foreground">
                {goingCount} of {mission.capacity} · {spotsLeft} spots left
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-background p-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground bg-card text-lg">
                {mission.owner.avatar}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Hosted by</p>
                <p className="text-sm font-bold">{mission.owner.name}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {mission.attendees.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-2 py-1 text-xs font-bold"
                >
                  <span className="text-base leading-none">{a.avatar}</span>
                  {a.name}
                </div>
              ))}
              {joined && (
                <div className="flex items-center gap-1.5 rounded-full border-2 border-foreground bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                  <span className="text-base leading-none">{profile.avatar}</span>
                  You
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 border-t-2 border-foreground bg-background p-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePrimary}
            disabled={spotsLeft === 0 && !joined && !requested}
            className={`w-full rounded-full border-2 border-foreground px-5 py-3 font-display text-lg shadow-sticker disabled:opacity-50 ${
              joined || requested ? "bg-card" : "bg-primary text-primary-foreground"
            }`}
          >
            {spotsLeft === 0 && !joined && !requested ? "Mission full" : ctaLabel}
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
