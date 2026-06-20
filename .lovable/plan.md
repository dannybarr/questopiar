## Root cause

The "Active" page (and Profile, MemorySheet) resolves quests via `ALL_QUESTS.find(q => q.id === a.questId)`. `ALL_QUESTS` is only the static seed data. AI-generated quests from the `generate-quests` edge function have IDs that don't exist in `ALL_QUESTS`, so:

- `profile.active` correctly contains the accepted quest (count says "1 on your list")
- But `ALL_QUESTS.find(...)` returns `undefined` → the card is filtered out → nothing renders
- User sees "1 on your list" with an empty list and bounces

This was masked before because seed quests worked. It now bites every time a user accepts an AI quest (which is the majority of cards on the Discover/Quests deck).

## Fix

Persist the full Quest object at acceptance time, then resolve from a unified cache instead of relying on `ALL_QUESTS`.

### 1. `src/lib/store.ts`
- Add `questCache: Record<string, Quest>` to the `Profile` type and `initial`.
- Change action signatures to accept full quest objects so we can cache them:
  - `acceptQuest(quest: Quest)`
  - `saveForLater(quest: Quest)`
  - `moveSavedToActive(quest: Quest)` (or look up cache by id — but pass quest where available)
- Each action writes the quest into `questCache` keyed by `quest.id` before/while updating active/saved arrays.
- Add a helper `getCachedQuest(id: string): Quest | undefined` that checks `state.questCache` first, then falls back to `ALL_QUESTS`.
- Backward-compat: keep a migration in `load()` so existing localStorage without `questCache` still works (empty cache, falls back to `ALL_QUESTS` for old seed entries).

### 2. Callers passing quest objects
Update these to pass the full `quest` instead of just `quest.id`:
- `src/components/QuestSwiper.tsx` — `acceptQuest`, `saveForLater` calls in swipe actions
- `src/components/QuestDetailSheet.tsx` — Accept / Save buttons
- `src/components/SavedQuestRow.tsx` — move-to-active button (already has the quest object)

### 3. Pages reading from active/saved
Replace `ALL_QUESTS.find(...)` with a `useResolveQuest(id)` (or `getCachedQuest`) helper backed by the store cache:
- `src/pages/Active.tsx` — active list, saved list, last-completed lookup
- `src/pages/Profile.tsx` — completed/active lookups, memory sheet lookup
- `src/components/MemorySheet.tsx` — if it does its own lookup

### 4. Verification (post-build)
- Open `/quests`, accept an AI-generated card.
- Confirm it navigates to `/active`, the card renders and is auto-expanded (existing `defaultOpen` on `QuestJournalCard` already opens when `status === "in-progress"` — which `acceptQuest` already sets).
- Reload the page; the active card still renders (cache persisted via localStorage).
- Accept a seed quest; still works via fallback.

## Out of scope
No UI redesign, no changes to the swipe gesture, no edge-function changes. Pure data-plumbing fix targeted at the "vanishing active quest" bug.