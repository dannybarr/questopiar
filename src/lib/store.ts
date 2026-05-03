import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import type { UKPlace } from "@/data/places";

export type QuestStatus = "planned" | "in-progress" | "completed";
export interface ActiveQuest {
  questId: string;
  status: QuestStatus;
  acceptedAt: number;
  startedAt?: number;
  completedAt?: number;
  rating?: number;
  note?: string;
}

export interface Profile {
  name: string;
  avatar: string;
  location: UKPlace | null;
  radiusMiles: number; // 9999 = no limit
  points: number;
  streak: number;
  lastActiveDay: string | null; // YYYY-MM-DD
  completedDays: string[]; // YYYY-MM-DD list
  seenQuests: string[];
  savedQuests: string[];
  active: ActiveQuest[];
  upvoted: string[];
  joinedGroups: string[];
  savedStays: string[];
}

const KEY = "sidequest:v1";

const initial: Profile = {
  name: "",
  avatar: "🦊",
  location: null,
  radiusMiles: 25,
  points: 0,
  streak: 0,
  lastActiveDay: null,
  completedDays: [],
  seenQuests: [],
  savedQuests: [],
  active: [],
  upvoted: [],
  joinedGroups: [],
  savedStays: [],
};

let state: Profile = load();
const listeners = new Set<() => void>();

function load(): Profile {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}

export function setProfile(patch: Partial<Profile> | ((p: Profile) => Partial<Profile>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
}

export function resetProfile() { state = initial; persist(); }

export function useProfile(): Profile {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state,
    () => initial,
  );
}

// Actions
const today = () => new Date().toISOString().slice(0, 10);

export function acceptQuest(questId: string) {
  setProfile((p) => ({
    seenQuests: Array.from(new Set([...p.seenQuests, questId])),
    active: p.active.find((a) => a.questId === questId)
      ? p.active
      : [...p.active, { questId, status: "planned", acceptedAt: Date.now() }],
  }));
}
export function skipQuest(questId: string) {
  setProfile((p) => ({ seenQuests: Array.from(new Set([...p.seenQuests, questId])) }));
}
export function saveForLater(questId: string) {
  setProfile((p) => ({
    seenQuests: Array.from(new Set([...p.seenQuests, questId])),
    savedQuests: Array.from(new Set([...p.savedQuests, questId])),
  }));
}
export function startQuest(questId: string) {
  setProfile((p) => ({
    active: p.active.map((a) => a.questId === questId ? { ...a, status: "in-progress", startedAt: Date.now() } : a),
  }));
}
export function completeQuest(questId: string, points: number, rating?: number) {
  const day = today();
  setProfile((p) => {
    const last = p.lastActiveDay;
    let streak = p.streak;
    if (last === day) { /* no change */ }
    else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      streak = last === yesterday ? streak + 1 : 1;
    }
    return {
      points: p.points + points,
      streak,
      lastActiveDay: day,
      completedDays: Array.from(new Set([...p.completedDays, day])),
      active: p.active.map((a) => a.questId === questId ? { ...a, status: "completed", completedAt: Date.now(), rating } : a),
    };
  });
}
export function abandonQuest(questId: string) {
  setProfile((p) => ({ active: p.active.filter((a) => a.questId !== questId) }));
}
export function clearSeen() { setProfile({ seenQuests: [] }); }
export function toggleUpvote(postId: string) {
  setProfile((p) => ({
    upvoted: p.upvoted.includes(postId) ? p.upvoted.filter((x) => x !== postId) : [...p.upvoted, postId],
  }));
}
export function toggleGroup(groupId: string) {
  setProfile((p) => ({
    joinedGroups: p.joinedGroups.includes(groupId) ? p.joinedGroups.filter((x) => x !== groupId) : [...p.joinedGroups, groupId],
  }));
}
