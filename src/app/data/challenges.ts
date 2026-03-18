// ── Types ─────────────────────────────────────────────────────────────────────
export type ChallengeType = "time-attack" | "focus";
export type ChallengeStatus = "active" | "completed" | "failed";

export interface ChallengeTask {
  id:         string;
  text:       string;
  completed:  boolean;
  difficulty: "easy" | "medium" | "hard";
  completedAt?: number;
}

export interface Challenge {
  id:        string;
  type:      ChallengeType;
  name:      string;
  status:    ChallengeStatus;
  createdAt: number;

  // Time-attack
  durationMinutes?: number; // total allowed time
  endsAt?:          number; // timestamp when time ends
  tasks?:           ChallengeTask[];
  paused?:          boolean;  // whether the challenge is paused
  pausedRemainingMs?: number; // remaining ms when paused

  // Focus / Pomodoro
  focusDurationMinutes?: number; // e.g. 120 total
  sessionMinutes?:       number; // pomodoro session length, default 25
  breakMinutes?:         number; // break length, default 5
  completedSessions?:    number;
  totalSessions?:        number; // calculated: focusDurationMinutes / sessionMinutes
  focusStartedAt?:       number; // when focus challenge started
  focusElapsedMs?:       number; // total elapsed (paused included)
}

// ── localStorage ──────────────────────────────────────────────────────────────
const KEY = "rpg_challenges_v1";

function load(): Challenge[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Challenge[];
  } catch { /* noop */ }
  return [];
}

function save(c: Challenge[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* noop */ }
  try { import("./syncService").then(s => s.schedulePush(5000)); } catch { /* noop */ }
}

// ── In-memory store ───────────────────────────────────────────────────────────
let store: Challenge[] = load();

export function getChallenges(): Challenge[]           { return store; }
export function getChallengeById(id: string): Challenge | undefined {
  return store.find((c) => c.id === id);
}

/** Reload in-memory store from localStorage (called after cloud sync applies new data) */
export function reloadChallenges(): void {
  store = load();
}

export function createChallenge(c: Omit<Challenge, "id" | "createdAt">): Challenge {
  const challenge: Challenge = { ...c, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now() };
  store = [...store, challenge];
  save(store);
  return challenge;
}

export function updateChallenge(c: Challenge): void {
  store = store.map((x) => (x.id === c.id ? c : x));
  save(store);
}

export function deleteChallenge(id: string): void {
  store = store.filter((c) => c.id !== id);
  save(store);
}

// ── Bonus XP pool ─────────────────────────────────────────────────────────────
// Delegated to economy.ts so bonusXP is included in the cloud sync payload.
// These re-exports keep all existing imports (gameEngine, HomeScreen, etc.) working.
export { getBonusXP, addBonusXP, resetBonusXP } from "./economy";