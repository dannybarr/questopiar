## Rename & rework: Open groups → Missions

Turn the existing "Open groups" section on Discover into a **Missions** feed: location-aware group side-quests (unique pubs, run clubs, activity bars, park BBQs, supper clubs, lido swims, etc.) that users can open into a "The Plan" sheet and **Request to Join** (or instantly join if the mission is open).

---

### 1. Data model — `src/data/missions.ts` (new)

```ts
export type MissionVisibility = "open" | "approval";
export type MissionCategory = "pub" | "run" | "activity-bar" | "bbq" | "swim" | "ride" | "food" | "nightlife" | "outdoors";

export interface MissionOwner { id: string; name: string; avatar: string; }
export interface MissionAttendee { id: string; name: string; avatar: string; status: "going" | "pending"; }

export interface Mission {
  id: string;
  title: string;
  emoji: string;
  category: MissionCategory;
  cover: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  venue: string;
  address?: string;
  when: string;            // human label, e.g. "Sat 2pm"
  whenISO: string;         // for sorting
  visibility: MissionVisibility;
  capacity: number;
  owner: MissionOwner;
  attendees: MissionAttendee[];
  vibe: string;            // short tagline
  thePlan: string;         // 2–4 sentences: meet point, flow, what to bring
  bring?: string[];
  costPP?: string;         // "£12pp" or "Free"
}
export const MOCK_MISSIONS: Mission[] = [ /* ~10–12 entries spanning London + Kent + Brighton */ ];
```

**Mock missions to seed** (location-tagged so distance filter works the same way `Quests` page does):

- 🍻 *Hidden Pub Hunt — Soho speakeasies* (London, approval, 6 spots)
- 🏃 *Sunday Slow Run Club — Hackney Marshes 5k + coffee* (London, open, 15 spots)
- 🏓 *Bounce Ping-Pong Takeover* (Shoreditch, open, 8 spots)
- 🔥 *Park BBQ — London Fields golden hour* (London, open, 20 spots)
- 🪓 *Axe-throwing & wings* (Vauxhall, approval, 6 spots)
- 🌊 *Whitstable cold dip + chips* (Kent, open, 12 spots)
- 🚴 *Richmond Park dawn loop* (London, open, 10 spots)
- 🏰 *Castle climbing session + vegan brownie* (Stoke Newington, open, 8 spots)
- 🛼 *Flippers Roller Disco crew night* (Olympia, approval, 10 spots)
- 🎡 *Margate Old Town wander → Dreamland* (Kent, open, 12 spots)
- ⚽ *Powerleague 5-a-side — pickup* (Bermondsey, approval, 10 spots)
- 🍕 *Brockley Market crawl* (London, open, 15 spots)

Categories chosen to mirror the existing quest "vibe" framework (date-night, with-mates, outdoorsy, wild) so Missions feel native, not bolted on.

### 2. Location syncing

Reuse the same pattern as the homepage Quests feed:
- Read `profile.location` and `profile.radiusMiles` from `useProfile()`.
- Filter `MOCK_MISSIONS` with `distanceMiles()` from `src/lib/geo.ts`.
- Sort by ascending distance, then by `whenISO`.
- If `radiusMiles === 9999`, show all.
- Empty state: "No missions near {town} yet — try widening your radius."

### 3. Store additions — `src/lib/store.ts`

```ts
joinedMissions: string[];        // missions the user is "going" to
requestedMissions: string[];     // missions the user has requested to join (pending)
```
Actions:
```ts
joinMission(missionId)           // open missions
requestJoinMission(missionId)    // approval missions
leaveMission(missionId)
cancelMissionRequest(missionId)
```
Persist via existing localStorage layer. No backend yet (mock).

### 4. UI — Discover page

Rename the section heading "Open groups" → **"Missions"** with a subtitle:
> *"Group side-quests near {town}. Hop in or pitch your own."*

Replace the current 2-card group list with a Missions grid (one column on mobile, two from `md:` up). Each card shows:
- Cover image with category emoji badge
- Title + venue · city
- When · distance pill (e.g. "Sat 2pm · 1.4 mi")
- Owner avatar + "+N going" attendee stack
- Visibility pill: "Open" (green) or "Approval" (amber)
- Spots remaining: "3 of 8 spots left"
- Tap card → opens `MissionSheet`

Keep the existing groups data file (`src/data/groups.ts`) intact for now — only the *Discover section* swaps from groups to missions. Group profiles can return later.

### 5. New component — `src/components/MissionSheet.tsx`

A bottom Sheet (matches `QuestDetailSheet` styling) with three stacked blocks:

1. **Hero** — cover image, title, when, venue + maps link, distance.
2. **The Plan** — `<h3>The Plan</h3>` then the `thePlan` paragraph, "Bring" chip list, cost pill.
3. **Crew** — owner ("Hosted by …"), attendee avatar grid with status, spots remaining bar.

Footer CTA depends on visibility + state:

| State                          | Open mission         | Approval mission           |
|--------------------------------|----------------------|----------------------------|
| Not joined / not requested     | "Join mission"       | "Request to Join"          |
| Joined                         | "You're going ✓ — Leave" | n/a                    |
| Requested (pending)            | n/a                  | "Request pending — Cancel" |
| Owner                          | "You're hosting"     | "You're hosting · Manage"  |

For the mock, "Manage" is a no-op toast saying "Approval inbox coming soon".

### 6. Out of scope (intentionally)

- No real auth / ownership — owner is mock data; the current user is never the owner.
- No real approval inbox or notifications.
- No mission creation flow (will follow once auth lands). The subtitle hints at it but no CTA.
- No edits to `src/data/groups.ts` or other pages.

### Files

- **New**: `src/data/missions.ts`, `src/components/MissionSheet.tsx`
- **Edit**: `src/lib/store.ts` (add joined/requested mission state + actions), `src/pages/Discover.tsx` (replace Open Groups block with Missions block, location-filtered)
