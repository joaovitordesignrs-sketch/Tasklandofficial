export type Theme = "dark" | "light";
export type Language = "pt" | "en";

export interface Preferences {
  theme: Theme;
  showDamageNumbers: boolean;
  habitStreakNotifs: boolean;
  language: Language;
  compactMode: boolean;
}

const PREFS_KEY = "rpg_preferences_v1";
const DEFAULT: Preferences = { theme: "dark", showDamageNumbers: true, habitStreakNotifs: true, language: "pt", compactMode: false };

export function getPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Preferences;
      if (!p.theme) p.theme = "dark";
      if (p.showDamageNumbers === undefined) p.showDamageNumbers = true;
      if (p.habitStreakNotifs === undefined) p.habitStreakNotifs = true;
      if (!p.language) p.language = "pt";
      if (p.compactMode === undefined) p.compactMode = false;
      return p;
    }
  } catch { /* noop */ }
  return { ...DEFAULT };
}

function savePreferences(p: Preferences): void {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent("rpg-prefs-changed", { detail: p }));
}

export function setTheme(theme: Theme): void {
  savePreferences({ ...getPreferences(), theme });
}

export function setPref<K extends keyof Preferences>(key: K, value: Preferences[K]): void {
  savePreferences({ ...getPreferences(), [key]: value });
}
