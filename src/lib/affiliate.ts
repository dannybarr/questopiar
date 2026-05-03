// Affiliate URL builders. Public IDs only — safe in client.
// Replace placeholders with your real affiliate IDs once you're approved.
// Booking.com Affiliate Programme: https://www.booking.com/affiliate-program/v2/index.html
// Awin (Canopy & Stars, Sykes etc): https://www.awin.com/

const BOOKING_AID = import.meta.env.VITE_BOOKING_AFFILIATE_AID || "1234567"; // TODO: replace
const AWIN_AFFID = import.meta.env.VITE_AWIN_AFFID || "";

export type Stay = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  area: string;
  region: string;
  lat: number;
  lng: number;
  image: string;
  blurb: string;
  whyUnique: string;
  priceBand: string;
  sleeps: number;
  nights: number;
  websiteUrl?: string;
  bookingSearchTerm: string;
  mapsUrl: string;
};

function isoDatePlus(days: number) {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString().slice(0, 10);
}

export function bookingUrl(stay: Pick<Stay, "bookingSearchTerm" | "area" | "nights" | "sleeps">) {
  const checkin = isoDatePlus(14);
  const checkout = isoDatePlus(14 + Math.max(1, stay.nights || 2));
  const ss = `${stay.bookingSearchTerm} ${stay.area || ""}`.trim();
  const params = new URLSearchParams({
    aid: BOOKING_AID,
    ss,
    checkin,
    checkout,
    group_adults: String(Math.max(1, stay.sleeps || 2)),
    no_rooms: "1",
    selected_currency: "GBP",
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function airbnbUrl(stay: Pick<Stay, "name" | "area" | "sleeps" | "nights">) {
  const slug = (stay.area || "United Kingdom").trim().replace(/\s+/g, "-");
  const params = new URLSearchParams({
    query: stay.name,
    adults: String(Math.max(1, stay.sleeps || 2)),
    checkin: isoDatePlus(14),
    checkout: isoDatePlus(14 + Math.max(1, stay.nights || 2)),
  });
  return `https://www.airbnb.co.uk/s/${encodeURIComponent(slug)}/homes?${params.toString()}`;
}

export function trackAffiliateClick(provider: "booking" | "airbnb" | "site", stay: Pick<Stay, "id" | "name">) {
  // TODO: persist to a stay_clicks table for revenue attribution.
  console.info("[affiliate]", provider, stay.id, stay.name);
}
