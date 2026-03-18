/**
 * useNotifications — computes notification badge counts for menu items.
 * Polls every 6 seconds and also reacts to the rpg:data-updated event
 * fired after cloud sync completes.
 */
import { useState, useEffect } from "react";
import { getHabits, isCheckedInToday } from "../data/habits";
import { getEconomy } from "../data/economy";

const SEEN_KEY = "rpg_achievements_seen_v1";

export interface Notifications {
  habitsUnchecked: number;  // active habits not checked in today
  newAchievements: number;  // achievements unlocked since last view
}

function computeNotifications(): Notifications {
  try {
    const habits = getHabits();
    const habitsUnchecked = habits.filter(h => h.active && !isCheckedInToday(h)).length;

    const econ = getEconomy();
    const seen = parseInt(localStorage.getItem(SEEN_KEY) ?? "0", 10);
    const newAchievements = Math.max(0, econ.unlockedAchievements.length - seen);

    return { habitsUnchecked, newAchievements };
  } catch {
    return { habitsUnchecked: 0, newAchievements: 0 };
  }
}

export function useNotifications(): Notifications {
  const [notifs, setNotifs] = useState<Notifications>(() => computeNotifications());

  useEffect(() => {
    const refresh = () => setNotifs(computeNotifications());
    const iv = setInterval(refresh, 6000);
    window.addEventListener("rpg:data-updated", refresh);
    return () => {
      clearInterval(iv);
      window.removeEventListener("rpg:data-updated", refresh);
    };
  }, []);

  return notifs;
}

/** Call this when the user visits the achievements screen. */
export function markAchievementsSeen(): void {
  try {
    const econ = getEconomy();
    localStorage.setItem(SEEN_KEY, String(econ.unlockedAchievements.length));
  } catch { /* noop */ }
}
