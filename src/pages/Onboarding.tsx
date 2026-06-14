import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UK_PLACES, AVATARS, UKPlace } from "@/data/places";
import { setProfile, useProfile } from "@/lib/store";
import { celebrate } from "@/lib/confetti";
import { MapPin, Search, ChevronRight, Sparkles, LocateFixed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const profile = useProfile();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar || "🦊");
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<UKPlace | null>(profile.location);
  const [radius, setRadius] = useState(profile.radiusMiles || 25);
  const [noLimit, setNoLimit] = useState(false);

  const [matches, setMatches] = useState<UKPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    if (q.length < 2) { setMatches([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = window.setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const { data, error } = await supabase.functions.invoke("geocode", { body: { q } });
        if (ctrl.signal.aborted) return;
        if (error) throw error;
        const results = (data?.results || []) as UKPlace[];
        if (results.length) setMatches(results);
        else setMatches(UK_PLACES.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6));
      } catch {
        setMatches(UK_PLACES.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6));
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 250);
  }, [query]);

  const useGeo = () => {
    if (!navigator.geolocation) return toast("Geolocation not available on this device");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const { data, error } = await supabase.functions.invoke("geocode", {
            body: { lat: latitude, lng: longitude },
          });
          if (error) throw error;
          const p = (data?.place as UKPlace | null) ?? null;
          if (p) {
            setPlace(p);
            toast(`Location set: ${p.name}${p.region ? `, ${p.region}` : ""}`);
          } else {
            setPlace({ name: "Near me", region: "", lat: latitude, lng: longitude });
            toast("Location set");
          }
        } catch {
          setPlace({ name: "Near me", region: "", lat: latitude, lng: longitude });
          toast("Got your location (couldn't fetch place name)");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) toast("Location permission denied");
        else if (err.code === err.TIMEOUT) toast("Location request timed out");
        else toast("Couldn't get location — pick one below.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const finish = () => {
    if (!place) return;
    setProfile({ name: name.trim() || "Quester", avatar, location: place, radiusMiles: noLimit ? 9999 : radius });
    celebrate("big");
    setTimeout(() => nav("/discover"), 300);
  };

  return (
    <div className="phone-frame flex min-h-dvh flex-col px-6 pb-10 pt-8">
      <div className="mb-6 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-2 flex-1 rounded-full border-2 border-foreground transition-all ${i <= step ? "bg-primary" : "bg-card"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col">
            <div className="mb-6 inline-flex w-fit rotate-[-3deg] items-center gap-2 rounded-2xl border-2 border-foreground bg-primary px-3 py-1 font-display text-sm shadow-sticker-sm">
              <Sparkles className="h-4 w-4" strokeWidth={3}/> SIDE QUEST
            </div>
            <h1 className="font-display text-5xl leading-[0.95]">Go do <span className="bg-accent px-2 text-accent-foreground">something.</span></h1>
            <p className="mt-3 text-lg text-muted-foreground">Real-world quests near you. Swipe, accept, do, brag.</p>

            <div className="mt-10 space-y-2">
              <label className="font-display text-lg">What should we call you?</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya"
                className="w-full rounded-2xl border-2 border-foreground bg-card px-4 py-4 text-lg font-semibold shadow-sticker-sm outline-none focus:bg-background"
              />
            </div>
            <div className="flex-1" />
            <Next disabled={!name.trim()} onClick={() => setStep(1)} />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col">
            <h2 className="font-display text-4xl">Pick your sidekick</h2>
            <p className="mt-2 text-muted-foreground">Your avatar follows you everywhere.</p>
            <div className="mt-8 grid grid-cols-4 gap-3">
              {AVATARS.map((a) => (
                <motion.button
                  key={a}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setAvatar(a)}
                  className={`flex aspect-square items-center justify-center rounded-2xl border-2 border-foreground text-4xl shadow-sticker-sm transition ${
                    avatar === a ? "bg-primary scale-105" : "bg-card"
                  }`}
                >
                  {a}
                </motion.button>
              ))}
            </div>
            <div className="flex-1" />
            <Next onClick={() => setStep(2)} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col">
            <h2 className="font-display text-4xl">Where are you?</h2>
            <p className="mt-2 text-muted-foreground">We'll surface quests around you.</p>

            <button onClick={useGeo} disabled={locating} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-foreground bg-electric px-4 py-3 font-bold shadow-sticker-sm sticker-tap disabled:opacity-60">
              {locating ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5}/> : <LocateFixed className="h-5 w-5" strokeWidth={2.5}/>}
              {locating ? "Locating…" : "Use current location"}
            </button>

            <div className="my-3 text-center text-xs font-semibold text-muted-foreground">or pick a place</div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"/>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any UK place, town or postcode"
                className="w-full rounded-2xl border-2 border-foreground bg-card py-3 pl-10 pr-10 font-semibold shadow-sticker-sm outline-none"
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin opacity-70"/>}
            </div>
            {matches.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {matches.map((p, i) => (
                  <button key={`${p.name}-${p.lat}-${i}`} onClick={() => { setPlace(p); setQuery(p.name); setMatches([]); }}
                    className="flex w-full items-center justify-between rounded-xl border-2 border-foreground bg-card px-3 py-2 text-left shadow-sticker-sm sticker-tap">
                    <span><span className="font-bold">{p.name}</span> {p.region && <span className="text-xs text-muted-foreground">{p.region}</span>}</span>
                    <ChevronRight className="h-4 w-4"/>
                  </button>
                ))}
              </div>
            )}
            {!searching && query.trim().length >= 2 && matches.length === 0 && (
              <div className="mt-2 rounded-xl border-2 border-dashed border-foreground/30 bg-card px-3 py-2 text-sm text-muted-foreground">No matches — try a different spelling.</div>
            )}

            {place && (
              <div className="mt-4 rounded-2xl border-2 border-foreground bg-sun p-4 shadow-sticker-sm">
                <div className="flex items-center gap-2 font-display text-lg"><MapPin className="h-5 w-5"/> {place.name}{place.region ? `, ${place.region}` : ""}</div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-2xl">{noLimit ? "∞" : `${radius} mi`}</span>
                  <button onClick={() => setNoLimit((n) => !n)} className={`chip ${noLimit ? "bg-accent text-accent-foreground" : "bg-card"}`}>
                    No limit
                  </button>
                </div>
                {!noLimit && (
                  <input type="range" min={1} max={500} value={radius} onChange={(e) => setRadius(+e.target.value)} className="mt-2 w-full accent-foreground" />
                )}
                <div className="mt-1 flex justify-between text-xs font-semibold opacity-70">
                  <span>1 mi</span><span>500+ mi</span>
                </div>
              </div>
            )}

            <div className="flex-1" />
            <Next disabled={!place} onClick={finish} label="Start questing" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Next({ onClick, disabled, label = "Continue" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      disabled={disabled}
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-foreground bg-primary py-4 font-display text-xl shadow-sticker disabled:opacity-40"
    >
      {label} <ChevronRight className="h-5 w-5" strokeWidth={3}/>
    </motion.button>
  );
}
