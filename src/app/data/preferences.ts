export type Language = "pt-br" | "en";
export type Theme = "dark" | "light";

export interface Preferences {
  language: Language;
  theme: Theme;
}

const PREFS_KEY = "rpg_preferences_v1";
const DEFAULT: Preferences = { language: "pt-br", theme: "dark" };

export function getPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Preferences;
      if (!p.language) p.language = "pt-br";
      if (!p.theme) p.theme = "dark";
      return p;
    }
  } catch { /* noop */ }
  return { ...DEFAULT };
}

function savePreferences(p: Preferences): void {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent("rpg-prefs-changed", { detail: p }));
}

export function setLanguage(language: Language): void {
  savePreferences({ ...getPreferences(), language });
}

export function setTheme(theme: Theme): void {
  savePreferences({ ...getPreferences(), theme });
}
