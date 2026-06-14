## Investor read on the current build

Pitched as a tester, the app today is doing five things at once: swipeable quest discovery, an active/journal flow, a missions/group system, a stays marketplace, and a discover/social feed. Each is half-done. None is sharp enough to demo to a user, let alone an investor. The classic early-stage failure: feature surface > depth, so nothing feels finished and the "why does this exist" question doesn't have a one-line answer.

**Verdict:** strip back hard. The MVP should answer one question — *"What's the move tonight, and did I actually do it?"* That's two surfaces: **Discover** (find an activity near me) and **Active** (do it, document it, keep it). Profile becomes the trophy cabinet for the documented memories. Everything else is noise until those two loops are loved.

## MVP scope (what stays)

1. **Onboarding** — name, avatar, location, radius. Untouched.
2. **Discover (renamed from /quests)** — the swipeable + category-filtered, AI-generated, location-aware quest deck. This becomes the home screen.
3. **Active** — saved + in-progress + completed quest journal (notes, photos, companions, rating). The documentation loop is the moat.
4. **Profile** — passport stamps, streak heatmap, memories list, badges. All photos and memories from Active land here.

## Cut from the interface (preserve code, hide routes)

- **Stays** — route, nav tab, page, generator hook all removed from UI. Keep `src/pages/Stays.tsx`, `useGeneratedStays`, `affiliate.ts`, `STAY_QUESTS`, and the `generate-stays` edge function on disk for v2; just unlink them. Also remove the "Stays" filter chip and stay category from the discover deck.
- **Missions / Mission Builder** — same treatment. Keep `Mission*.tsx`, `missions.ts`, mission store actions, but hide the section on Discover and don't render the "Build a Mission" CTA. Mission data and store keys stay in localStorage so beta testers don't lose state when we re-enable.
- **Discover social feed** ("Latest reviews", trending, groups) — pull the whole route. It's mock data with no actual social graph and dilutes the value prop. The new `/discover` becomes the quest deck (today's `/quests`).
- **Saved stays, joined groups, badges that reference stays/missions** — hide on profile.

## New IA

```
/                → redirect to /discover (or /onboarding)
/onboarding      → unchanged
/discover        → today's Quests page, renamed (swipe + browse)
/active          → unchanged (journal + saved)
/profile         → unchanged minus stay/mission stats
```

Bottom nav drops to **3 tabs**: Discover · Active · Profile. Cleaner thumb-reach, less cognitive load, signals focus.

## Critical adaptations to launch (the investor list)

These are the things that, left as-is, will cost us the demo:

1. **Photos are still flaky.** The image resolver leans on the dead `source.unsplash.com` endpoint and brittle og:image scraping. For an MVP that sells "discover real local activities," a quest tile with a generic stock photo is fatal. Fix: tiered resolver (Google Places Photos → Wikimedia → Unsplash official API → AI gen as last resort), cached server-side in a `venue_photos` table so we pay once per venue. Re-bake the hardcoded seed images using the same pipeline.
2. **No real accounts.** Everything is localStorage. As soon as a tester clears their browser or opens on mobile, their journal vanishes. Investors will ask "where's retention measured?" Fix: Lovable Cloud auth (email + Google), migrate the `Profile` shape into a `profiles` + `active_quests` + `quest_photos` schema with RLS. Photos already upload to Storage; tie the rows to `auth.uid()`.
3. **No analytics.** We can't show DAU, completion rate, or time-to-first-quest. Fix: minimal event log table (`events(user_id, name, props, ts)`) writing `quest_viewed`, `quest_accepted`, `quest_started`, `quest_completed`, `photo_added`. Three numbers on an internal dashboard = an investor story.
4. **Onboarding-to-first-quest takes too many taps.** Today: name → avatar → place → radius → land on swiper. We can defer name/avatar to after the first quest is saved. Friction reduction is the cheapest growth lever.
5. **No share artefact.** The most viral moment in this app is "I completed X" — and right now it dies in the user's journal. The `ShareCard` component exists but isn't wired up post-completion. Fix: after `completeQuest`, prompt with a generated share card (already half-built) for IG/WA. This is the loop that gives us free distribution.
6. **AI quality is opaque.** When `generate-quests` returns junk, we silently fall back to seed data. Add a "Was this a good suggestion?" 👍/👎 per AI quest, logged for prompt-tuning.
7. **Empty states are weak.** Active with 0 quests just says "Nothing active yet". Should push back to /discover with one-tap suggestions.
8. **Brand/positioning.** App is called both "SideQuest" and "Questopia" across copy. Pick one before launch. Mention to user, don't decide unilaterally.

## Code changes for the MVP cut (just this turn's work)

The investor-grade fixes above are follow-on work. This turn we only do the scope-back:

- `src/App.tsx` — remove `/stays` route; rename `/quests` → `/discover`; the existing `/discover` (social feed) goes away. Add a redirect from `/quests` and old `/discover` for backwards-compat with bookmarks.
- `src/components/BottomNav.tsx` — drop Stays + Discover (old) entries, end up with: Discover · Active · Profile.
- `src/pages/Index.tsx` — redirect to `/discover` instead of `/quests`.
- `src/pages/Quests.tsx` — rename header copy, drop the "Stays" category from `CATS`. Keep filename for now but route mounts it at `/discover`. (Filename rename can come later — risky to do in one go.)
- `src/pages/Discover.tsx` (old social feed) — unmount from the router. Leave the file on disk; we'll come back to missions.
- `src/pages/Profile.tsx` — remove the `stays` count derivation, drop badges that depend on stays/groups (or just hide the locked ones), keep memories + passport + streak.
- `src/components/QuestSwiper.tsx` / `QuestDetailSheet.tsx` — no change beyond making sure no UI links into Stays/Missions.
- Leave `src/lib/store.ts` alone — keeping `savedStays`, `joinedMissions`, etc. in state is harmless and avoids data loss on existing testers.

No DB changes this turn. No deletions of files — everything is reversible via a single PR.

## Out of scope for this turn (next sprints)

- Real auth + cloud-persisted journal (sprint 2).
- Photo resolver overhaul (sprint 2, separate plan already drafted).
- Analytics events table + internal dashboard (sprint 3).
- Share-card post-completion flow (sprint 3).
- Re-enabling Stays once affiliate revenue model is signed off.
- Re-enabling Missions once we have ≥100 weekly actives to populate them.

## Open questions before I build

1. **Brand name** — lock "SideQuest" or "Questopia"? Affects copy in nav, onboarding, share cards.
2. **Old `/discover` URL** — redirect it to the new quest deck (also `/discover`), or to `/active`? They're different surfaces today, so anyone who has it bookmarked will land somewhere new either way.
3. **Confirm "hide, don't delete"** for Stays/Missions code — happy for me to keep the files in the tree so we can re-enable cleanly, or do you want them physically removed?
