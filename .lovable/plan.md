# Active → Active + Saved, Quest Journal & Memories

## 1. Page restructure (`src/pages/Active.tsx`)

Two stacked sections, no more "Stamped" grid:

- **Active** (top) — large expandable journal tiles for quests with `status` of `planned` or `in-progress`.
- **Saved** (below) — compact rows for quests the user swiped "save for later" (`profile.savedQuests`). Each row has **Move to Active** and **Remove**.

Completed quests no longer show here — they live on Profile under **Memories**.

## 2. Data model (`src/lib/store.ts`)

Extend `ActiveQuest` with journal fields:

```ts
interface JournalPhoto { id: string; url: string; caption?: string; addedAt: number; }
interface CompanionTag { id: string; name: string; profileId?: string; } // profileId reserved for future profile linking

interface ActiveQuest {
  // existing fields...
  notes?: string;
  photos?: JournalPhoto[];
  companions?: CompanionTag[];   // "Who was there"
  rating?: number;                // already exists, surfaced in journal as 1–5 stars
}
```

New actions: `updateQuestNotes`, `addQuestPhoto`, `removeQuestPhoto`, `addCompanion`, `removeCompanion`, `setQuestRating`, `moveSavedToActive`, `removeSaved`.

## 3. Photo storage

Migration creates a public `quest-photos` bucket with RLS for anon read/insert/delete (MVP — auth comes later).

`src/lib/uploadQuestPhoto.ts` uploads to `quest-photos/{questId}/{uuid}.{ext}` and returns the public URL stored in the journal.

## 4. New components

- **`QuestJournalCard.tsx`** — large expandable Active tile. Collapsed: hero image, title, Start/Check-in buttons. Expanded sections:
  - **Who was there** — chip input. Free-text now; each chip carries an optional `profileId` slot so once social profiles ship, chips become tappable @-mentions with no migration.
  - **Notes** — Textarea, autosave.
  - **Photos** — file input + grid with remove.
  - **Rating** — 1–5 stars (shown after Check-in).
- **`SavedQuestRow.tsx`** — compact tile with Move-to-Active and Remove actions.
- **`MemorySheet.tsx`** — read-only Sheet rendering all journal content for a completed quest, plus a **Share card** button.
- **`ShareCard.tsx`** — generates a 1080×1350 PNG via `html-to-image` (hero photo, title, rating stars, companions, +points stamp). Triggers `navigator.share` with file fallback to download.

## 5. Profile (`src/pages/Profile.tsx`)

New **Memories** section between Passport and Badges. Filters `profile.active` for `status === 'completed'` with any journal content (photo / note / companion / rating). Renders memory cards (hero photo · title · rating stars · companion count · note excerpt). Tap → `MemorySheet`.

Passport stamps remain as the lightweight grid for quests completed without a journal.

## 6. Completion flow

On Check-in, the existing celebration modal gets two new CTAs:
- **Add memory** → opens journal expanded for photos, companions, rating.
- **Share** → opens `ShareCard` directly.

## Technical notes

- `framer-motion` for the expand/collapse animation on `QuestJournalCard`.
- All new fields optional — existing local profiles stay valid.
- Companion chips use `crypto.randomUUID()` ids; future migration just attaches `profileId` when a tagged user joins, no schema change needed.
- Share card uses `html-to-image` (lightweight, no canvas wrangling).

## Out of scope

Authentication, voice notes, mood check-ins, cost tracking, weather stamp, AI suggestions, brainstorm section.
