import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGeneratedStays } from "@/hooks/useGeneratedStays";
import { useProfile, toggleSavedStay } from "@/lib/store";
import { bookingUrl, airbnbUrl, trackAffiliateClick, type Stay } from "@/lib/affiliate";
import { Loader2, MapPin, Heart, ExternalLink, Shuffle, BedDouble, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const TYPE_FILTERS = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "treehouse", label: "Treehouse", emoji: "🌳" },
  { key: "shepherds-hut", label: "Hut", emoji: "🐑" },
  { key: "cabin", label: "Cabin", emoji: "🪵" },
  { key: "glamping", label: "Glamping", emoji: "⛺" },
  { key: "boat", label: "Boat", emoji: "⛵" },
  { key: "lighthouse", label: "Lighthouse", emoji: "🗼" },
  { key: "castle", label: "Castle", emoji: "🏰" },
  { key: "boutique-hotel", label: "Boutique", emoji: "🛎️" },
  { key: "off-grid", label: "Off-grid", emoji: "🌲" },
] as const;

export default function StaysPage() {
  const profile = useProfile();
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<Stay | null>(null);
  const { stays, loading, error, town, refresh } = useGeneratedStays(profile.location, profile.radiusMiles);

  const filtered = useMemo(() => {
    if (filter === "all") return stays;
    return stays.filter((s) => s.type === filter);
  }, [stays, filter]);

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground inline-flex items-center gap-1">
              <BedDouble className="h-4 w-4"/> Stay Quests
            </p>
            <h1 className="font-display text-3xl leading-tight">Sleep somewhere unforgettable</h1>
          </div>
          <button onClick={refresh} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-sun shadow-sticker-sm sticker-tap" aria-label="Refresh">
            <Shuffle className="h-5 w-5" strokeWidth={2.5}/>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-sticker-sm">
            <MapPin className="h-3.5 w-3.5"/> {profile.location?.name ?? "Set location"}
            <span className="opacity-50">·</span>
            <span>{profile.radiusMiles >= 9999 ? "∞" : `${profile.radiusMiles}mi`}</span>
          </span>
          {loading && (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-electric px-3 py-1 text-xs font-bold shadow-sticker-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin"/> Finding gems near {town || "you"}…
            </span>
          )}
        </div>
        {error && <p className="mt-2 text-xs font-semibold text-destructive">Couldn't load stays: {error}</p>}

        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-3 scroll-hide">
          {TYPE_FILTERS.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)} className={`chip whitespace-nowrap ${filter === t.key ? "bg-foreground text-background" : "bg-card"}`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4 px-5 pt-2 pb-32">
        {!profile.location && (
          <div className="rounded-2xl border-2 border-foreground bg-card p-4 shadow-sticker-sm">
            <p className="font-display text-lg">Set your area first</p>
            <p className="text-sm text-muted-foreground">Head to onboarding to pick where you're exploring from.</p>
          </div>
        )}

        {loading && stays.length === 0 && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border-2 border-foreground bg-muted shadow-sticker-sm"/>
          ))
        )}

        <AnimatePresence>
          {filtered.map((s) => {
            const saved = profile.savedStays.includes(s.id);
            return (
              <motion.article
                key={s.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-sticker"
              >
                <button onClick={() => setOpen(s)} className="block w-full text-left">
                  <div className="relative">
                    <img src={s.image} alt={s.name} loading="lazy" className="h-52 w-full object-cover"/>
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-2.5 py-1 text-xs font-bold shadow-sticker-sm">
                      <span>{s.emoji}</span> {s.type.replace(/-/g, " ")}
                    </div>
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-sun px-2.5 py-1 text-xs font-bold shadow-sticker-sm">
                      {s.priceBand}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-xl leading-tight">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.area}{s.region ? `, ${s.region}` : ""}</p>
                    <p className="mt-2 text-sm leading-snug">{s.whyUnique || s.blurb}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5"/> Sleeps {s.sleeps} · {s.nights} night{s.nights > 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2 border-t-2 border-foreground p-3">
                  <a
                    href={bookingUrl(s)}
                    target="_blank"
                    rel="sponsored noopener"
                    onClick={() => trackAffiliateClick("booking", s)}
                    className="flex-1 rounded-full border-2 border-foreground bg-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground shadow-sticker-sm sticker-tap"
                  >
                    Book on Booking.com
                  </a>
                  <a
                    href={airbnbUrl(s)}
                    target="_blank"
                    rel="sponsored noopener"
                    onClick={() => trackAffiliateClick("airbnb", s)}
                    className="rounded-full border-2 border-foreground bg-card px-3 py-2 text-sm font-bold shadow-sticker-sm sticker-tap"
                    aria-label="View on Airbnb"
                  >
                    Airbnb
                  </a>
                  <button
                    onClick={() => toggleSavedStay(s.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground shadow-sticker-sm sticker-tap ${saved ? "bg-accent text-accent-foreground" : "bg-card"}`}
                    aria-label={saved ? "Unsave" : "Save"}
                  >
                    <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} strokeWidth={2.5}/>
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {!loading && filtered.length === 0 && profile.location && (
          <div className="rounded-2xl border-2 border-foreground bg-card p-6 text-center shadow-sticker-sm">
            <p className="font-display text-lg">No stays in this filter yet</p>
            <p className="text-sm text-muted-foreground">Try "All" or refresh to scout again.</p>
          </div>
        )}
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t-2 border-foreground p-0">
          {open && (
            <div>
              <img src={open.image} alt={open.name} className="h-64 w-full object-cover"/>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl leading-tight">{open.emoji} {open.name}</h2>
                    <p className="text-sm text-muted-foreground">{open.area}{open.region ? `, ${open.region}` : ""}</p>
                  </div>
                  <span className="rounded-full border-2 border-foreground bg-sun px-3 py-1 text-sm font-bold shadow-sticker-sm">{open.priceBand}</span>
                </div>
                <p className="text-sm leading-relaxed">{open.blurb}</p>
                <div className="rounded-2xl border-2 border-foreground bg-card p-3 shadow-sticker-sm">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Why it's special</p>
                  <p className="mt-1 text-sm">{open.whyUnique}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="chip bg-card"><Users className="h-3 w-3"/> Sleeps {open.sleeps}</span>
                  <span className="chip bg-card">{open.nights} night{open.nights > 1 ? "s" : ""}</span>
                  <span className="chip bg-card">{open.type.replace(/-/g," ")}</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={bookingUrl(open)}
                    target="_blank"
                    rel="sponsored noopener"
                    onClick={() => trackAffiliateClick("booking", open)}
                    className="rounded-full border-2 border-foreground bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground shadow-sticker-sm sticker-tap"
                  >
                    Book on Booking.com →
                  </a>
                  <a
                    href={airbnbUrl(open)}
                    target="_blank"
                    rel="sponsored noopener"
                    onClick={() => trackAffiliateClick("airbnb", open)}
                    className="rounded-full border-2 border-foreground bg-card px-4 py-3 text-center text-sm font-bold shadow-sticker-sm sticker-tap"
                  >
                    Search on Airbnb →
                  </a>
                  {open.websiteUrl && (
                    <a
                      href={open.websiteUrl}
                      target="_blank"
                      rel="noopener"
                      onClick={() => trackAffiliateClick("site", open)}
                      className="inline-flex items-center justify-center gap-1 text-xs font-semibold underline"
                    >
                      <ExternalLink className="h-3 w-3"/> Visit official site
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
