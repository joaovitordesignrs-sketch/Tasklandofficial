// ── Habit Tracker System ──────────────────────────────────────────────────────
// Based on: Duhigg (habit loop), BJ Fogg (tiny habits), Bandura (self-efficacy)

export type HabitMedal = "iniciante" | "formador" | "mestre";

export const HABIT_MEDALS: Record<HabitMedal, { days: number; label: string; color: string; dmgBonus: number; desc: string }> = {
  iniciante: { days: 5,  label: "Beginner",      color: "#8a9fba", dmgBonus: 0.05, desc: "5 days in a row — +5% damage for 24h" },
  formador:  { days: 21, label: "Habit Builder", color: "#FFD700", dmgBonus: 0.10, desc: "21 days — +10% permanent damage" },
  mestre:    { days: 66, label: "Habit Master",  color: "#FF6B35", dmgBonus: 0.15, desc: "66 days — +15% damage + exclusive skin" },
};

export interface Habit {
  id:            string;
  name:          string;
  icon:          string;
  createdAt:     number;
  checkIns:      string[];     // ISO date strings "YYYY-MM-DD"
  currentStreak: number;
  bestStreak:    number;
  medals:        HabitMedal[];
  active:        boolean;
}

const HABITS_KEY = "rpg_habits_v1";
const MAX_HABITS = 5;

function load(): Habit[] {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (raw) return JSON.parse(raw) as Habit[];
  } catch { /* noop */ }
  return [];
}

function save(habits: Habit[]): void {
  try { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)); } catch { /* noop */ }
  try { import("./syncService").then(s => s.schedulePush(2000)); } catch { /* noop */ }
}

let store: Habit[] = load();

export function getHabits(): Habit[] { return store; }

export function getActiveHabits(): Habit[] {
  return store.filter(h => h.active);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function createHabit(name: string, icon: string): Habit | null {
  if (store.filter(h => h.active).length >= MAX_HABITS) return null;
  const habit: Habit = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    icon,
    createdAt: Date.now(),
    checkIns: [],
    currentStreak: 0,
    bestStreak: 0,
    medals: [],
    active: true,
  };
  store = [...store, habit];
  save(store);
  return habit;
}

export function deleteHabit(id: string): void {
  store = store.filter(h => h.id !== id);
  save(store);
}

export function checkinHabit(id: string): { newMedals: HabitMedal[] } {
  const today = todayStr();
  const yesterday = yesterdayStr();
  const newMedals: HabitMedal[] = [];

  store = store.map(h => {
    if (h.id !== id) return h;
    if (h.checkIns.includes(today)) return h; // already checked in today

    const newCheckIns = [...h.checkIns, today];
    let streak = h.currentStreak;

    // If checked in yesterday, increment streak; otherwise reset to 1
    if (h.checkIns.includes(yesterday) || h.checkIns.length === 0) {
      streak = streak + 1;
    } else {
      streak = 1;
    }

    const bestStreak = Math.max(h.bestStreak, streak);

    // Check new medals
    const medals = [...h.medals];
    for (const [key, info] of Object.entries(HABIT_MEDALS)) {
      if (!medals.includes(key as HabitMedal) && streak >= info.days) {
        medals.push(key as HabitMedal);
        newMedals.push(key as HabitMedal);
      }
    }

    return { ...h, checkIns: newCheckIns, currentStreak: streak, bestStreak, medals };
  });

  save(store);
  return { newMedals };
}

export function uncheckinHabit(id: string): void {
  const today = todayStr();
  store = store.map(h => {
    if (h.id !== id) return h;
    if (!h.checkIns.includes(today)) return h;
    const newCheckIns = h.checkIns.filter(d => d !== today);
    const streak = Math.max(0, h.currentStreak - 1);
    return { ...h, checkIns: newCheckIns, currentStreak: streak };
  });
  save(store);
}

export function isCheckedInToday(habit: Habit): boolean {
  return habit.checkIns.includes(todayStr());
}

/** Recalculate streaks on app load (in case user missed days) */
export function recalcStreaks(): void {
  const today = todayStr();
  const yesterday = yesterdayStr();
  let changed = false;
  store = store.map(h => {
    if (!h.active) return h;
    const lastCheckin = h.checkIns[h.checkIns.length - 1];
    if (lastCheckin && lastCheckin !== today && lastCheckin !== yesterday) {
      // Streak broken
      if (h.currentStreak > 0) {
        changed = true;
        return { ...h, currentStreak: 0 };
      }
    }
    return h;
  });
  if (changed) save(store);
}

/**
 * Total damage bonus from active habit streaks.
 * Each active habit in streak → +2% base damage (max 5 habits = +10%)
 * Plus permanent medal bonuses (formador +10%, mestre +15%)
 */
export function getHabitDamageBonus(): number {
  const today = todayStr();
  let bonus = 0;
  for (const h of store) {
    if (!h.active) continue;
    const checkedToday = h.checkIns.includes(today);
    // +2% streak bonus only when the habit was actually checked in today
    if (checkedToday && h.currentStreak > 0) bonus += 0.02;
    // Medal bonuses: formador and mestre are permanent (always active once earned)
    if (h.medals.includes("mestre"))        bonus += 0.15;
    else if (h.medals.includes("formador")) bonus += 0.10;
    // iniciante is "por 24h" — only counts when checked in today
    else if (h.medals.includes("iniciante") && checkedToday) bonus += 0.05;
  }
  return bonus;
}

export function resetHabits(): void {
  store = [];
  save(store);
}

export function reloadHabits(): void {
  store = load();
}