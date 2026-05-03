import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Stay } from "@/lib/affiliate";

const TTL_MS = 30 * 60 * 1000;
const cacheKey = (lat: number, lng: number, r: number) =>
  `sq:stays:${lat.toFixed(2)}:${lng.toFixed(2)}:${r}`;

export function useGeneratedStays(
  loc: { lat: number; lng: number; name?: string } | null,
  radiusMiles: number,
) {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [town, setTown] = useState<string | null>(null);
  const [bust, setBust] = useState(0);
  const reqRef = useRef(0);

  const fetchIt = useCallback(async (force = false) => {
    if (!loc) return;
    const r = Math.min(radiusMiles, 200);
    const key = cacheKey(loc.lat, loc.lng, r);
    if (!force) {
      try {
        const c = JSON.parse(localStorage.getItem(key) || "null");
        if (c && Date.now() - c.ts < TTL_MS) {
          setStays(c.data.stays || []);
          setTown(c.data.town || null);
          return;
        }
      } catch {}
    }
    const myReq = ++reqRef.current;
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-stays", {
        body: { lat: loc.lat, lng: loc.lng, radiusMiles: r, count: 10, locationName: loc.name },
      });
      if (myReq !== reqRef.current) return;
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setStays(data.stays || []);
      setTown(data.town || null);
      try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
    } catch (e: any) {
      if (myReq !== reqRef.current) return;
      setError(e?.message || "Failed to find stays");
    } finally {
      if (myReq === reqRef.current) setLoading(false);
    }
  }, [loc?.lat, loc?.lng, radiusMiles]);

  useEffect(() => { fetchIt(false); }, [fetchIt, bust]);

  return { stays, loading, error, town, refresh: () => { setBust((b) => b + 1); fetchIt(true); } };
}
